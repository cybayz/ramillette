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

  let title = "Collection";
  let description = "Luxury perfumes in Qatar from Ramillette.";

  if (categorySlug === "all" || categorySlug === "frontpage") {
    title = "All Products";
    description = "Shop all Arabian and European fragrances in Qatar.";
  } else if (categorySlug === "best-sellers") {
    title = "Best Sellers";
    description = "Shop our top-selling perfumes and Arabian oud in Qatar.";
  } else if (categorySlug === "new-arrivals") {
    title = "New Arrivals";
    description = "Explore fresh luxury perfume releases and seasonal scents.";
  } else if (categorySlug === "own-brand") {
    title = "Own Brand";
    description = "Exclusive perfumes formulated in Qatar by Ramillette.";
  } else if (categorySlug === "inspired") {
    title = "Inspired";
    description = "Designer-inspired luxury fragrances with intense longevity.";
  } else if (categorySlug === "luxury-perfumes") {
    title = "Luxury Perfumes";
    description = "Opulent Middle Eastern oud and amber compositions.";
  } else {
    const cat = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (cat) {
      title = cat.name;
      description =
        cat.description ||
        `Explore the ${cat.name} luxury fragrance collection by Ramillette.`;
    }
  }

  return {
    title: `${title} | Ramillette Perfumes Qatar`,
    description,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { categorySlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialSize = resolvedSearchParams?.size;

  const whereCondition: any = { active: true };
  let currentCategory: CategoryInfo;

  if (categorySlug === "all" || categorySlug === "frontpage") {
    currentCategory = {
      name: "Products",
      slug: "all",
      description:
        "Discover Ramillette's curated collection of Arabian and European perfumes, handcrafted with high-concentration oils for lasting sillage.",
    };
  } else if (categorySlug === "best-sellers") {
    whereCondition.bestseller = true;
    currentCategory = {
      name: "Best Sellers",
      slug: "best-sellers",
      description:
        "The most coveted and highly-rated perfumes in Qatar, featuring intense projection and long-lasting notes.",
    };
  } else if (categorySlug === "new-arrivals") {
    whereCondition.newArrival = true;
    currentCategory = {
      name: "New Arrivals",
      slug: "new-arrivals",
      description:
        "Newly introduced luxury drops, crafted with premium fragrance essences from Doha and Europe.",
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
    />
  );
}
