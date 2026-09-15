"use client";

import React, { useRef } from "react";
import { ProductCard, CardProduct } from "@/components/product/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguageStore } from "@/lib/store/useLanguageStore";

interface RelatedProductsCarouselProps {
  products: CardProduct[];
  title?: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
}

export function RelatedProductsCarousel({
  products,
  title = "Vinova Product Related",
  titleAr = "منتجات ذات صلة",
  subtitle = "Subtitle from happy customers",
  subtitleAr = "آراء وتفضيلات عملائنا السعداء",
}: RelatedProductsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguageStore();
  const isArabic = language === "ar";

  const displayTitle = isArabic && titleAr ? titleAr : title;
  const displaySubtitle = isArabic && subtitleAr ? subtitleAr : subtitle;

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 border-t border-[#ececec]">
      <div className="ramillette-container">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1c] tracking-tight">
              {displayTitle}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              {displaySubtitle}
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="w-9 h-9 rounded-full bg-white border border-[#d1d5db] hover:border-black flex items-center justify-center text-neutral-700 hover:text-black transition-all cursor-pointer shadow-xs"
              aria-label="Previous products"
            >
              <ChevronLeft size={18} className="stroke-[2]" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="w-9 h-9 rounded-full bg-white border border-[#d1d5db] hover:border-black flex items-center justify-center text-neutral-700 hover:text-black transition-all cursor-pointer shadow-xs"
              aria-label="Next products"
            >
              <ChevronRight size={18} className="stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Carousel Row (5 items visible on desktop, smooth scrolling) */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[240px] sm:w-[260px] md:w-[270px] lg:w-[280px] shrink-0 snap-start flex flex-col"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
