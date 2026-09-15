import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { ShopListing } from "@/components/shop/ShopListing";
import type { Metadata } from "next";

export const revalidate = 60;

interface PageProps {
  params: Promise<{
    categorySlug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;

  let title = "Collection";
  let description = "Luxury perfumes in Qatar from Ramillette.";

  if (categorySlug === "best-sellers") {
    title = "Best Sellers";
    description = "Shop our top-selling perfumes and Arabian oud in Qatar.";
  } else if (categorySlug === "new-arrivals") {
    title = "New Arrivals";
    description = "Explore fresh luxury perfume releases and seasonal scents.";
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

export default async function CategoryPage({ params }: PageProps) {
  const { categorySlug } = await params;

  const whereCondition: any = { active: true };
  let currentCategory: {
    name: string;
    slug: string;
    description?: string | null;
  };

  if (categorySlug === "best-sellers") {
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

  const [productsRaw, allCategoriesRaw] = await Promise.all([
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
      orderBy: { sortOrder: "asc" },
    }),
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
  }));

  return (
    <ShopListing
      category={currentCategory}
      products={products}
      allCategories={allCategories}
    />
  );
}
