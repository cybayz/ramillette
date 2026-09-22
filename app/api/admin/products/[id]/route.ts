import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

interface Props {
  params: Promise<{ id: string }>;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
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
    const {
      name,
      slug: customSlug,
      description,
      shortDescription,
      brand,
      categoryId,
      sku,
      stock,
      basePrice,
      compareAtPrice,
      active,
      featured,
      bestseller,
      newArrival,
      fragranceFamily,
      topNotes,
      heartNotes,
      baseNotes,
      images,
      variants,
      countryPricing,
      variantCountryPricing,
    } = body;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Slug validation if updated
    let newSlug = existing.slug;
    if (customSlug && customSlug.trim() && customSlug.trim() !== existing.slug) {
      const formatted = slugify(customSlug.trim());
      const duplicate = await prisma.product.findFirst({
        where: { slug: formatted, NOT: { id } },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: `Slug "${formatted}" is already in use by another fragrance.` },
          { status: 400 }
        );
      }
      newSlug = formatted;
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update base product fields
      const p = await tx.product.update({
        where: { id },
        data: {
          ...(name !== undefined ? { name: name.trim() } : {}),
          slug: newSlug,
          ...(description !== undefined ? { description: description.trim() } : {}),
          ...(shortDescription !== undefined
            ? { shortDescription: shortDescription ? shortDescription.trim() : null }
            : {}),
          ...(brand !== undefined ? { brand: brand.trim() } : {}),
          ...(categoryId !== undefined ? { categoryId: categoryId || null } : {}),
          ...(sku !== undefined ? { sku: sku ? sku.trim() : null } : {}),
          ...(stock !== undefined ? { stock: Number(stock) } : {}),
          ...(basePrice !== undefined ? { basePrice: Number(basePrice) } : {}),
          ...(compareAtPrice !== undefined
            ? { compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null }
            : {}),
          ...(active !== undefined ? { active: Boolean(active) } : {}),
          ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
          ...(bestseller !== undefined ? { bestseller: Boolean(bestseller) } : {}),
          ...(newArrival !== undefined ? { newArrival: Boolean(newArrival) } : {}),
          ...(fragranceFamily !== undefined
            ? { fragranceFamily: fragranceFamily ? fragranceFamily.trim() : null }
            : {}),
          ...(topNotes !== undefined ? { topNotes: topNotes ? topNotes.trim() : null } : {}),
          ...(heartNotes !== undefined
            ? { heartNotes: heartNotes ? heartNotes.trim() : null }
            : {}),
          ...(baseNotes !== undefined ? { baseNotes: baseNotes ? baseNotes.trim() : null } : {}),
        },
      });

      // 2. Synchronize images if supplied
      if (images && Array.isArray(images)) {
        // Delete existing images and re-insert fresh
        await tx.productImage.deleteMany({ where: { productId: id } });

        const validImages = images
          .filter((img) => img.url && typeof img.url === "string" && img.url.trim())
          .map((img, idx) => ({
            productId: id,
            url: img.url.trim(),
            alt: img.alt?.trim() || p.name,
            sortOrder: img.sortOrder !== undefined ? Number(img.sortOrder) : idx,
          }));

        if (validImages.length > 0) {
          await tx.productImage.createMany({ data: validImages });
        }
      }

      // 3. Synchronize variants if supplied
      if (variants && Array.isArray(variants)) {
        // Delete variants not in the updated list
        const updatedVariantIds = variants
          .filter((v) => v.id && typeof v.id === "string")
          .map((v) => v.id);

        await tx.productVariant.deleteMany({
          where: {
            productId: id,
            id: { notIn: updatedVariantIds },
          },
        });

        // Upsert or create variants
        for (const v of variants) {
          if (!v.name || !v.name.trim()) continue;

          if (v.id && !v.id.startsWith("temp-")) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                name: v.name.trim(),
                sku: v.sku?.trim() || null,
                price: Number(v.price) || Number(p.basePrice),
                compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
                stock: v.stock !== undefined ? Number(v.stock) : 50,
                active: v.active !== undefined ? Boolean(v.active) : true,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                name: v.name.trim(),
                sku: v.sku?.trim() || null,
                price: Number(v.price) || Number(p.basePrice),
                compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
                stock: v.stock !== undefined ? Number(v.stock) : 50,
                active: v.active !== undefined ? Boolean(v.active) : true,
              },
            });
          }
        }
      }

      // 4. Upsert regional product pricing & warehouse stock
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

      // 5. Upsert regional variant pricing & stock
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

    return NextResponse.json({
      success: true,
      message: "Fragrance updated successfully",
      product: updated,
    });
  } catch (error: any) {
    console.error("Admin product update error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A product with this SKU or slug already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update fragrance details" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product has historical orders or transactions
    const [ordersCount, transactionsCount] = await Promise.all([
      prisma.orderItem.count({ where: { productId: id } }),
      prisma.inventoryTransaction.count({ where: { productId: id } }),
    ]);

    if (ordersCount > 0 || transactionsCount > 0) {
      // Soft-delete: de-activate to protect historical order and inventory integrity
      await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data: { active: false, deletedAt: new Date() },
        });
        await tx.productVariant.updateMany({
          where: { productId: id },
          data: { active: false, deletedAt: new Date() },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Fragrance "${existing.name}" is referenced by ${ordersCount} historical order(s) and has been deactivated/archived safely.`,
      });
    }

    // Otherwise, safe physical deletion
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { productId: id } });
      await tx.wishlist.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });
      await tx.productCountry.deleteMany({ where: { productId: id } });
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.storeInventory.deleteMany({ where: { productId: id } });
      const variants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const variantIds = variants.map((v) => v.id);
      if (variantIds.length > 0) {
        await tx.productVariantCountry.deleteMany({
          where: { variantId: { in: variantIds } },
        });
        await tx.productVariant.deleteMany({
          where: { id: { in: variantIds } },
        });
      }
      await tx.product.delete({ where: { id } });
    });

    return NextResponse.json({
      success: true,
      message: `Fragrance "${existing.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Admin product delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
