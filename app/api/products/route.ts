import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category");
    const sort = searchParams.get("sort") || "featured";
    const limit = parseInt(searchParams.get("limit") || "40", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;

    const where: any = {
      active: true,
    };

    if (query.trim()) {
      where.OR = [
        { name: { contains: query.trim(), mode: "insensitive" } },
        { description: { contains: query.trim(), mode: "insensitive" } },
        { brand: { contains: query.trim(), mode: "insensitive" } },
        { sku: { contains: query.trim(), mode: "insensitive" } },
      ];
    }

    if (categorySlug && categorySlug !== "all") {
      if (categorySlug === "best-sellers") {
        where.bestseller = true;
      } else if (categorySlug === "new-arrivals") {
        where.newArrival = true;
      } else {
        where.category = {
          slug: categorySlug,
        };
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { basePrice: "asc" };
    else if (sort === "price-desc") orderBy = { basePrice: "desc" };
    else if (sort === "name-asc") orderBy = { name: "asc" };
    else if (sort === "bestseller") orderBy = { bestseller: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { active: true }, orderBy: { price: "asc" } },
          reviews: { where: { approved: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const formatted = products.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 5;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        brand: p.brand,
        categoryId: p.categoryId,
        categoryName: p.category?.name,
        basePrice: Number(p.basePrice),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        bestseller: p.bestseller,
        newArrival: p.newArrival,
        stock: p.stock,
        images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
        variants: p.variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
          stock: v.stock,
        })),
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: p.reviews.length,
      };
    });

    return NextResponse.json({
      products: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in /api/products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
