import { getHomeProducts } from "@/lib/data/getHomeProducts";
import { StoryCircles } from "@/components/home/StoryCircles";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HomeProductTabs } from "@/components/home/HomeProductTabs";
import { FeaturedCollectionsBanners } from "@/components/home/FeaturedCollectionsBanners";
import { ReelVideosSlider } from "@/components/home/ReelVideosSlider";
import { TopLuxurySection } from "@/components/home/TopLuxurySection";
import { DualPromoBanners } from "@/components/home/DualPromoBanners";
import { BestSellersCarousel } from "@/components/home/BestSellersCarousel";
import { CustomerReviewsSection } from "@/components/home/CustomerReviewsSection";
import { ValueProps } from "@/components/home/ValueProps";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  const {
    bestSellers,
    ownBrand,
    inspired,
    luxuryPerfumes,
    newArrivals,
    topLuxuryProducts,
    bestSellersCarousel,
  } = await getHomeProducts();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Preloaded Circular Video Stories */}
      <StoryCircles />

      {/* 2. Hero Model Banner Carousel */}
      <HeroCarousel />

      {/* 3. Tabbed Product Showcase */}
      <HomeProductTabs
        bestSellers={bestSellers}
        ownBrand={ownBrand}
        inspired={inspired}
        luxuryPerfumes={luxuryPerfumes}
        newArrivals={newArrivals}
      />

      {/* 4. Two Collection Cards: Own Brand & Inspired Collection */}
      <FeaturedCollectionsBanners />

      {/* 5. Video Section: Reels Horizontal Slider */}
      <ReelVideosSlider />

      {/* 6. Top Luxury Perfumes Carousel */}
      <TopLuxurySection products={topLuxuryProducts} />

      {/* 7. Two Promotional Cards: Amber Code & 10% OFF */}
      <DualPromoBanners />

      {/* 8. Best Sellers Carousel */}
      <BestSellersCarousel products={bestSellersCarousel} />

      {/* 9. Country-Specific Customer Reviews */}
      <CustomerReviewsSection />

      {/* 10. Service Value Propositions (4 Badges) */}
      <ValueProps />
    </div>
  );
}
