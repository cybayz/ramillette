import React, { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchaseForm } from "@/components/product/ProductPurchaseForm";
import { ProductReviews } from "@/components/product/ProductReviews";
import { RelatedProductsCarousel } from "@/components/product/RelatedProductsCarousel";
import { ValueProps } from "@/components/home/ValueProps";
import type { Metadata } from "next";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  isArabic?: boolean;
}

// Deduplicate product query between generateMetadata and Page component
const getProduct = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { active: true }, orderBy: { price: "asc" } },
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } },
      category: true,
    },
  });
});

// Single optimized query for related products
const getRelatedProducts = cache(async (productId: string, categoryId?: string | null) => {
  return prisma.product.findMany({
    where: {
      active: true,
      id: { not: productId },
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 2 },
      variants: { where: { active: true }, orderBy: { price: "asc" }, take: 1 },
      reviews: { where: { approved: true } },
      category: true,
    },
    take: 5,
  });
});

// Pre-render all product pages at build time for instant 0ms navigation
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true },
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

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

export default async function ProductDetailPage({ params, isArabic = false }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products in a single fast parallel/cached query
  const relatedFinal = await getRelatedProducts(product.id, product.categoryId);

  const relatedProducts = relatedFinal.map((p) => ({
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
    reviewsCount: p.reviews.length > 0 ? p.reviews.length : 10,
  }));

  const formattedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: Number(product.basePrice),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    stock: product.stock,
    images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
    topNotes: product.topNotes,
    heartNotes: product.heartNotes,
    baseNotes: product.baseNotes,
    inspiredBy: product.name.includes("Oudh And Rose") ? "Ahmed Al Maghribi" : undefined,
    gender: "Unisex",
    concentration: "Extrait de Parfum",
    description: product.description,
    reviewsCount: product.reviews.length > 0 ? product.reviews.length : 10,
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
    <div className="bg-[#ffffff] min-h-screen pt-6 sm:pt-8">
      <div className="ramillette-container max-w-[1320px] mx-auto">
        {/* Luxury Breadcrumb Badge (Matching Reference Screenshot) */}
        <div className="mb-6">
          <div className="border border-[#ebdcc7] bg-[#fbf9f5] px-3.5 py-1.5 rounded-[4px] inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8b6534] uppercase tracking-wider">
            <Link href={isArabic ? "/ar" : "/"} className="hover:text-[#4E6548] transition-colors">
              {isArabic ? "الرئيسية" : "HOME"}
            </Link>
            <span className="text-[#8b6534]/50">›</span>
            <Link href={isArabic ? "/ar/collections/all" : "/collections/all"} className="hover:text-[#4E6548] transition-colors">
              {isArabic ? "العطور" : "FRAGRANCES"}
            </Link>
            <span className="text-[#8b6534]/50">›</span>
            <span className="text-[#1c1c1c] font-extrabold">{product.name}</span>
          </div>
        </div>

        {/* Top Main PDP Section (Gallery on Left + Details/Tabs on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-12">
          {/* Left Column: Gallery with Vertical Thumbnails and Share/Heart floating buttons */}
          <div className="lg:col-span-6 xl:col-span-7">
            <ProductGallery
              images={product.images}
              productName={product.name}
              productId={product.id}
              slug={product.slug}
              price={Number(product.basePrice)}
            />
          </div>

          {/* Right Column: Information, Size Selector, Delivery, Actions, Tabs */}
          <div className="lg:col-span-6 xl:col-span-5">
            <ProductPurchaseForm
              product={formattedProduct}
              variants={formattedVariants}
            />
          </div>
        </div>

        {/* Customer Reviews Section */}
        {product.reviews.length > 0 && (
          <div className="pt-8 pb-12 border-t border-[#ececec]">
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
        )}
      </div>

      {/* Vinova Product Related Section (The Missing 5-Item Carousel Section) */}
      <RelatedProductsCarousel
        products={relatedProducts}
        title="Vinova Product Related"
        titleAr="منتجات ذات صلة"
        subtitle="Subtitle from happy customers"
        subtitleAr="آراء وتفضيلات عملائنا السعداء"
      />

      {/* 4 Value Propositions Banner (Matching Reference Site Below Related Section) */}
      <ValueProps />
    </div>
  );
}
