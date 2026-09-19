import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

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

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        countries: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      slug: customSlug,
      description,
      shortDescription,
      brand,
      categoryId,
      sku,
      basePrice,
      compareAtPrice,
      stock,
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
    } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (basePrice === undefined || isNaN(Number(basePrice))) {
      return NextResponse.json(
        { error: "Valid base price is required" },
        { status: 400 }
      );
    }

    // Determine unique slug
    let baseSlug = customSlug?.trim() ? slugify(customSlug) : slugify(name);
    if (!baseSlug) baseSlug = `perfume-${Date.now()}`;

    let slug = baseSlug;
    let count = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const createdProduct = await prisma.$transaction(async (tx) => {
      // 1. Create product
      const p = await tx.product.create({
        data: {
          name: name.trim(),
          slug,
          description: description?.trim() || "",
          shortDescription: shortDescription?.trim() || null,
          brand: brand?.trim() || "Ramillette",
          categoryId: categoryId || null,
          sku: sku?.trim() || null,
          basePrice: Number(basePrice),
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          stock: stock !== undefined ? Number(stock) : 100,
          active: active !== undefined ? Boolean(active) : true,
          featured: Boolean(featured),
          bestseller: Boolean(bestseller),
          newArrival: Boolean(newArrival),
          fragranceFamily: fragranceFamily?.trim() || null,
          topNotes: topNotes?.trim() || null,
          heartNotes: heartNotes?.trim() || null,
          baseNotes: baseNotes?.trim() || null,
        },
      });

      // 2. Create images
      if (images && Array.isArray(images) && images.length > 0) {
        const imageRecords = images
          .filter((img) => img.url && typeof img.url === "string" && img.url.trim())
          .map((img, idx) => ({
            productId: p.id,
            url: img.url.trim(),
            alt: img.alt?.trim() || p.name,
            sortOrder: img.sortOrder !== undefined ? Number(img.sortOrder) : idx,
          }));

        if (imageRecords.length > 0) {
          await tx.productImage.createMany({
            data: imageRecords,
          });
        }
      }

      // 3. Create variants
      if (variants && Array.isArray(variants) && variants.length > 0) {
        for (const v of variants) {
          if (!v.name || !v.name.trim()) continue;
          await tx.productVariant.create({
            data: {
              productId: p.id,
              name: v.name.trim(),
              sku: v.sku?.trim() || null,
              price: Number(v.price) || Number(basePrice),
              compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
              stock: v.stock !== undefined ? Number(v.stock) : 50,
              active: v.active !== undefined ? Boolean(v.active) : true,
            },
          });
        }
      }

      // 4. Auto-populate country pricing
      const activeCountries = await tx.country.findMany({
        where: { active: true },
      });

      for (const country of activeCountries) {
        const customPrice = countryPricing?.find(
          (cp: any) => cp.country?.toUpperCase() === country.code
        );

        let finalPrice = Number(basePrice);
        let finalCompare = compareAtPrice ? Number(compareAtPrice) : null;
        let finalStock = stock !== undefined ? Number(stock) : 50;
        let isActive = true;

        if (customPrice) {
          finalPrice = Number(customPrice.price) || finalPrice;
          finalCompare = customPrice.compareAtPrice
            ? Number(customPrice.compareAtPrice)
            : null;
          finalStock = customPrice.stock !== undefined ? Number(customPrice.stock) : finalStock;
          isActive = customPrice.active !== undefined ? Boolean(customPrice.active) : true;
        } else {
          // Calculate price using exchange rate
          const rate = Number(country.exchangeRate) || 1.0;
          finalPrice = Math.round(Number(basePrice) * rate * 100) / 100;
          if (compareAtPrice) {
            finalCompare = Math.round(Number(compareAtPrice) * rate * 100) / 100;
          }
        }

        await tx.productCountry.create({
          data: {
            productId: p.id,
            country: country.code,
            price: finalPrice,
            compareAtPrice: finalCompare,
            stock: finalStock,
            active: isActive,
          },
        });
      }

      return p;
    });

    return NextResponse.json({
      success: true,
      message: "Fragrance added successfully",
      product: createdProduct,
    });
  } catch (error: any) {
    console.error("Admin create product error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A product with this SKU or slug already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
