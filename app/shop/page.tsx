import React from "react";
import prisma from "@/lib/db/prisma";
import { ShopListing } from "@/components/shop/ShopListing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | Ramillette Perfumes Qatar",
  description:
    "Browse our complete catalog of luxury Middle Eastern oud, amber, and designer-inspired perfumes in Qatar with 2-hour express delivery in Doha.",
};

export const revalidate = 60;

interface ShopPageProps {
  searchParams?: Promise<{
    size?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialSize = resolvedSearchParams?.size;

  const [
    productsRaw,
    categoriesRaw,
    totalCount,
    bestSellerCount,
    newArrivalCount,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          where: { active: true },
          orderBy: { price: "asc" },
          include: { countries: true },
        },
        reviews: { where: { approved: true } },
        category: true,
        countries: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { active: true },
      include: {
        _count: {
          select: { products: { where: { active: true } } },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true, bestseller: true } }),
    prisma.product.count({ where: { active: true, newArrival: true } }),
  ]);

  const products = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    categoryName: p.category?.name,
    basePrice: Number(p.basePrice),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    bestseller: p.bestseller,
    newArrival: p.newArrival,
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
    countries: p.countries.map((c) => ({
      country: c.country,
      price: Number(c.price),
      compareAtPrice: c.compareAtPrice ? Number(c.compareAtPrice) : null,
      stock: c.stock,
      active: c.active,
    })),
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      stock: v.stock,
      countries: v.countries?.map((vc) => ({
        country: vc.country,
        price: Number(vc.price),
        compareAtPrice: vc.compareAtPrice ? Number(vc.compareAtPrice) : null,
        stock: vc.stock,
        active: vc.active,
      })) || [],
    })),
    rating:
      p.reviews.length > 0
        ? Math.round(
            (p.reviews.reduce((sum, r) => sum + r.rating, 0) /
              p.reviews.length) *
              10
          ) / 10
        : 5,
    reviewsCount: p.reviews.length ?? 10,
  }));

  const categories = categoriesRaw.map((c) => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
    count: c._count.products,
  }));

  const categoryCounts: Record<string, number> = {
    all: totalCount,
    "best-sellers": bestSellerCount,
    "new-arrivals": newArrivalCount,
  };
  categoriesRaw.forEach((c) => {
    categoryCounts[c.slug] = c._count.products;
  });

  return (
    <ShopListing
      category={{
        name: "Products",
        slug: "all",
        description:
          "Discover Ramillette's curated collection of Arabian and European perfumes, handcrafted with high-concentration oils for lasting sillage.",
      }}
      products={products}
      allCategories={categories}
      categoryCounts={categoryCounts}
      initialSize={initialSize}
    />
  );
}
