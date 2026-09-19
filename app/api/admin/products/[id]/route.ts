import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        countries: true,
        variants: {
          include: {
            countries: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Admin fetch product error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { stock, basePrice, compareAtPrice, active, countryPricing, variantCountryPricing } = body;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update base product
      const p = await tx.product.update({
        where: { id },
        data: {
          ...(stock !== undefined ? { stock: Number(stock) } : {}),
          ...(basePrice !== undefined ? { basePrice: Number(basePrice) } : {}),
          ...(compareAtPrice !== undefined
            ? { compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null }
            : {}),
          ...(active !== undefined ? { active: Boolean(active) } : {}),
        },
      });

      // 2. Upsert regional product pricing & warehouse stock
      if (countryPricing && Array.isArray(countryPricing)) {
        for (const cp of countryPricing) {
          if (!cp.country) continue;
          const countryCode = cp.country.toUpperCase();
          await tx.productCountry.upsert({
            where: {
              productId_country: {
                productId: id,
                country: countryCode,
              },
            },
            create: {
              productId: id,
              country: countryCode,
              price: Number(cp.price) || Number(p.basePrice),
              compareAtPrice: cp.compareAtPrice ? Number(cp.compareAtPrice) : null,
              stock: Number(cp.stock) ?? 50,
              active: cp.active !== undefined ? Boolean(cp.active) : true,
            },
            update: {
              price: Number(cp.price) || Number(p.basePrice),
              compareAtPrice: cp.compareAtPrice ? Number(cp.compareAtPrice) : null,
              stock: Number(cp.stock) ?? 50,
              active: cp.active !== undefined ? Boolean(cp.active) : true,
            },
          });
        }
      }

      // 3. Upsert regional variant pricing & stock
      if (variantCountryPricing && Array.isArray(variantCountryPricing)) {
        for (const vcp of variantCountryPricing) {
          if (!vcp.variantId || !vcp.country) continue;
          const countryCode = vcp.country.toUpperCase();
          await tx.productVariantCountry.upsert({
            where: {
              variantId_country: {
                variantId: vcp.variantId,
                country: countryCode,
              },
            },
            create: {
              variantId: vcp.variantId,
              country: countryCode,
              price: Number(vcp.price),
              compareAtPrice: vcp.compareAtPrice ? Number(vcp.compareAtPrice) : null,
              stock: Number(vcp.stock) ?? 30,
              active: vcp.active !== undefined ? Boolean(vcp.active) : true,
            },
            update: {
              price: Number(vcp.price),
              compareAtPrice: vcp.compareAtPrice ? Number(vcp.compareAtPrice) : null,
              stock: Number(vcp.stock) ?? 30,
              active: vcp.active !== undefined ? Boolean(vcp.active) : true,
            },
          });
        }
      }

      return p;
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Admin product update error:", error);
    return NextResponse.json(
      { error: "Failed to update product and regional pricing" },
      { status: 500 }
    );
  }
}
