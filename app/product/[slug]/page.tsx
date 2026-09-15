import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchaseForm } from "@/components/product/ProductPurchaseForm";
import { FragranceNotesPyramid } from "@/components/product/FragranceNotesPyramid";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductCard } from "@/components/product/ProductCard";
import { RatingStars } from "@/components/ui/RatingStars";
import type { Metadata } from "next";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true },
  });

  if (!product) {
    return { title: "Product Not Found | Ramillette" };
  }

  const primaryImage = product.images[0]?.url;

  return {
    title: `${product.name} | Ramillette Perfumes Qatar`,
    description:
      product.shortDescription ||
      `Shop ${product.name} luxury fragrance with 2-hour express delivery across Doha, Qatar.`,
    openGraph: {
      title: `${product.name} | Ramillette Perfumes Qatar`,
      description:
        product.shortDescription ||
        `Shop ${product.name} luxury fragrance with 2-hour express delivery across Doha, Qatar.`,
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { active: true }, orderBy: { price: "asc" } },
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } },
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Related products from the same category or bestsellers
  const relatedRaw = await prisma.product.findMany({
    where: {
      active: true,
      id: { not: product.id },
      ...(product.categoryId ? { categoryId: product.categoryId } : {}),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { active: true }, orderBy: { price: "asc" } },
      reviews: { where: { approved: true } },
      category: true,
    },
    take: 4,
  });

  const relatedProducts = relatedRaw.map((p) => ({
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
    reviewsCount: p.reviews.length ?? 8,
  }));

  const avgRating =
    product.reviews.length > 0
      ? Math.round(
          (product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length) *
            10
        ) / 10
      : 5;

  const formattedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: Number(product.basePrice),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    stock: product.stock,
    images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
  };

  const formattedVariants = product.variants.map((v) => ({
    id: v.id,
    name: v.name,
    sku: v.sku,
    price: Number(v.price),
    compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
    stock: v.stock,
  }));

  return (
    <div className="bg-[#ffffff] min-h-screen py-8">
      <div className="ramillette-container">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-neutral-500 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#b6713e]">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#b6713e]">
            Shop
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/shop/${product.category.slug}`}
                className="hover:text-[#b6713e]"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">{product.name}</span>
        </nav>

        {/* Top Product Section (Gallery + Details) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pb-16">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#b6713e]">
                {product.brand || "Ramillette Perfumes"}
              </span>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1c1c1c] tracking-tight">
                {product.name}
              </h1>

              {/* Rating header */}
              <div className="flex items-center gap-2 pt-1">
                <RatingStars
                  rating={avgRating}
                  reviewsCount={product.reviews.length}
                  size={15}
                />
                <span className="text-xs text-neutral-500">
                  • 2-Hour Doha Delivery
                </span>
              </div>
            </div>

            {/* Short Description */}
            <p className="text-sm text-neutral-600 leading-relaxed pt-1">
              {product.description}
            </p>

            {/* Purchase Form (Variants, Stepper, Add to Cart, Buy Now) */}
            <ProductPurchaseForm
              product={formattedProduct}
              variants={formattedVariants}
            />
          </div>
        </div>

        {/* Detailed Tabs / Accordions */}
        <div className="pt-12 border-t border-[#e5e5e5] space-y-16">
          {/* Section 1: Olfactory Pyramid */}
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#b6713e]">
                Fragrance Architecture
              </span>
              <h2 className="text-2xl font-bold text-[#1c1c1c] mt-1">
                Olfactory Notes & Sillage
              </h2>
            </div>
            <FragranceNotesPyramid
              topNotes={product.topNotes}
              heartNotes={product.heartNotes}
              baseNotes={product.baseNotes}
              fragranceFamily={product.fragranceFamily}
            />
          </div>

          {/* Section 2: Customer Reviews */}
          <div className="pt-8 border-t border-[#e5e5e5]">
            <ProductReviews
              productId={product.id}
              productName={product.name}
              reviews={product.reviews.map((r) => ({
                id: r.id,
                authorName: r.authorName,
                rating: r.rating,
                title: r.title,
                comment: r.comment,
                createdAt: r.createdAt.toISOString(),
              }))}
            />
          </div>

          {/* Section 3: Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-8 border-t border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#b6713e]">
                    You May Also Love
                  </span>
                  <h2 className="text-2xl font-bold text-[#1c1c1c] mt-1">
                    Related Fragrances
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="text-xs font-semibold text-[#1c1c1c] hover:text-[#b6713e]"
                >
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
