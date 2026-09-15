import prisma from "@/lib/db/prisma";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryShortcuts } from "@/components/home/CategoryShortcuts";
import { BestSellersSection } from "@/components/home/BestSellersSection";
import { OwnBrandSpotlight } from "@/components/home/OwnBrandSpotlight";
import { InspiredSection } from "@/components/home/InspiredSection";
import { LuxuryPerfumesSection } from "@/components/home/LuxuryPerfumesSection";
import { PromotionalCTAs } from "@/components/home/PromotionalCTAs";
import { ValueProps } from "@/components/home/ValueProps";
import { CustomerReviewsSection } from "@/components/home/CustomerReviewsSection";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  // Fetch real data from Prisma database
  const [bestSellersRaw, ownBrandProduct, inspiredRaw, luxuryRaw] =
    await Promise.all([
      prisma.product.findMany({
        where: { active: true, bestseller: true },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { active: true }, orderBy: { price: "asc" } },
          reviews: { where: { approved: true } },
          category: true,
        },
        take: 8,
      }),
      prisma.product.findFirst({
        where: { slug: "amber-code-45" },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { active: true } },
        },
      }),
      prisma.product.findMany({
        where: {
          active: true,
          category: { slug: "inspired" },
        },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { active: true }, orderBy: { price: "asc" } },
          reviews: { where: { approved: true } },
          category: true,
        },
        take: 8,
      }),
      prisma.product.findMany({
        where: {
          active: true,
          category: { slug: "luxury-perfumes" },
        },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { active: true }, orderBy: { price: "asc" } },
          reviews: { where: { approved: true } },
          category: true,
        },
        take: 8,
      }),
    ]);

  // Format products for universal ProductCard
  const formatCard = (p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    categoryName: p.category?.name,
    basePrice: Number(p.basePrice),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    bestseller: p.bestseller,
    newArrival: p.newArrival,
    images: p.images.map((img: any) => ({ url: img.url, alt: img.alt })),
    variants: p.variants.map((v: any) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      stock: v.stock,
    })),
    rating:
      p.reviews?.length > 0
        ? Math.round(
            (p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
              p.reviews.length) *
              10
          ) / 10
        : 5,
    reviewsCount: p.reviews?.length ?? 12,
  });

  const bestSellers = bestSellersRaw.map(formatCard);
  const inspiredProducts = inspiredRaw.map(formatCard);
  const luxuryPerfumes = luxuryRaw.map(formatCard);

  const formattedOwnBrand = ownBrandProduct
    ? {
        id: ownBrandProduct.id,
        name: ownBrandProduct.name,
        slug: ownBrandProduct.slug,
        description: ownBrandProduct.description,
        basePrice: Number(ownBrandProduct.basePrice),
        compareAtPrice: ownBrandProduct.compareAtPrice
          ? Number(ownBrandProduct.compareAtPrice)
          : null,
        images: ownBrandProduct.images.map((img) => ({ url: img.url })),
        variants: ownBrandProduct.variants.map((v) => ({
          id: v.id,
          name: v.name,
          price: Number(v.price),
          stock: v.stock,
        })),
      }
    : undefined;

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Banner with CTAs & Highlights */}
      <HeroBanner />

      {/* 2. Visual Category Navigation Shortcuts */}
      <CategoryShortcuts />

      {/* 3. Best Sellers Carousel / Grid */}
      <BestSellersSection products={bestSellers} />

      {/* 4. Own Brand Dedicated Showcase (Amber Code 80ml) */}
      <OwnBrandSpotlight product={formattedOwnBrand} />

      {/* 5. Inspired Fragrances Collection */}
      <InspiredSection products={inspiredProducts} />

      {/* 6. Luxury Perfumes (Arabian Oud & Amber) */}
      <LuxuryPerfumesSection products={luxuryPerfumes} />

      {/* 7. Promotional CTAs (Corporate Gifting & Refer & Earn) */}
      <PromotionalCTAs />

      {/* 8. Service Value Propositions (Qatar Delivery, Authentic, COD) */}
      <ValueProps />

      {/* 9. Verified Customer Reviews */}
      <CustomerReviewsSection />
    </div>
  );
}
