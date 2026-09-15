import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { ShopListing, CategoryInfo } from "@/components/shop/ShopListing";
import type { Metadata } from "next";

export const revalidate = 60;

interface PageProps {
  params: Promise<{
    categorySlug: string;
  }>;
  searchParams?: Promise<{
    size?: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  let title = "المنتجات";
  if (categorySlug === "best-sellers") title = "الأكثر مبيعاً";
  else if (categorySlug === "new-arrivals") title = "وصل حديثاً";
  else if (categorySlug === "own-brand") title = "علامتنا التجارية";
  else if (categorySlug === "inspired") title = "مستوحى";
  else if (categorySlug === "luxury-perfumes") title = "عطور فاخرة";

  return {
    title: `${title} | عطور راميليت قطر`,
    description: "تسوق أرقى العطور الفاخرة في قطر مع توصيل سريع خلال ساعتين في الدوحة.",
  };
}

export default async function ArabicCollectionPage({
  params,
  searchParams,
}: PageProps) {
  const { categorySlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialSize = resolvedSearchParams?.size;

  const whereCondition: any = { active: true };
  let currentCategory: CategoryInfo;

  if (categorySlug === "all" || categorySlug === "frontpage") {
    currentCategory = {
      name: "المنتجات",
      slug: "all",
      description: "اكتشف مجموعة عطور راميليت المميزة بتركيز عالٍ وثبات طويل.",
    };
  } else if (categorySlug === "best-sellers") {
    whereCondition.bestseller = true;
    currentCategory = {
      name: "الأكثر مبيعاً",
      slug: "best-sellers",
      description: "العطور الأكثر طلباً وتميزاً في الدوحة.",
    };
  } else if (categorySlug === "new-arrivals") {
    whereCondition.newArrival = true;
    currentCategory = {
      name: "وصل حديثاً",
      slug: "new-arrivals",
      description: "أحدث إصدارات العطور الفاخرة.",
    };
  } else {
    const dbCat = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!dbCat) {
      notFound();
    }

    whereCondition.categoryId = dbCat.id;
    currentCategory = {
      name: dbCat.name,
      slug: dbCat.slug,
      description: dbCat.description,
    };
  }

  const [
    productsRaw,
    allCategoriesRaw,
    totalCount,
    bestSellerCount,
    newArrivalCount,
  ] = await Promise.all([
    prisma.product.findMany({
      where: whereCondition,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { active: true }, orderBy: { price: "asc" } },
        reviews: { where: { approved: true } },
        category: true,
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
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      stock: v.stock,
    })),
    rating:
      p.reviews.length > 0
        ? Math.round(
            (p.reviews.reduce((sum, r) => sum + r.rating, 0) /
              p.reviews.length) *
              10
          ) / 10
        : 5,
    reviewsCount: p.reviews.length ?? 12,
  }));

  const allCategories = allCategoriesRaw.map((c) => ({
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
  allCategoriesRaw.forEach((c) => {
    categoryCounts[c.slug] = c._count.products;
  });

  return (
    <ShopListing
      category={currentCategory}
      products={products}
      allCategories={allCategories}
      categoryCounts={categoryCounts}
      initialSize={initialSize}
      isArabic={true}
    />
  );
}
