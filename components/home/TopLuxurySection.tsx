"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { useLanguageStore } from "@/lib/store/useLanguageStore";

interface TopLuxurySectionProps {
  products: any[];
}

export function TopLuxurySection({ products }: TopLuxurySectionProps) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguageStore();
  const isAr = pathname?.startsWith("/ar") || language === "ar";

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const isRtl = isAr;
      const scrollAmount = Math.min(scrollRef.current.clientWidth * 0.8, 380);
      const moveLeft =
        direction === "left"
          ? (isRtl ? scrollAmount : -scrollAmount)
          : (isRtl ? -scrollAmount : scrollAmount);

      scrollRef.current.scrollBy({ left: moveLeft, behavior: "smooth" });
    }
  };

  const title = "Top Luxury Perfumes";
  const subtitle = isAr
    ? "عطور خلاصة فاخرة من راميلليت"
    : "Premium extrait fragrances from Ramillette";
  const viewAllLink = isAr ? "/ar/shop/luxury-perfumes" : "/shop/luxury-perfumes";

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="ramillette-container">
        {/* Section Header */}
        <div className="flex flex-row items-end justify-between mb-6 pb-2 border-b border-neutral-100">
          <div>
            <h2 className="text-xl md:text-2xl lg:text-[28px] font-bold text-[#1a1a1a] tracking-tight font-heading">
              {title}
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 mt-1">
              {subtitle}
            </p>
          </div>

          <Link
            href={viewAllLink}
            className="group flex items-center gap-1 text-xs md:text-sm font-semibold text-[#1a1a1a] hover:text-[#4e6648] transition-colors"
          >
            <span>View All</span>
            <span className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-xs">
              {isAr ? "↖" : "↗"}
            </span>
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel -mx-4 sm:mx-0">
          {/* Scrollable Track */}
          <div
            ref={scrollRef}
            className="flex items-stretch gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-4 sm:px-0 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-[0_0_44%] w-[44%] min-w-[44%] max-w-[44%] sm:flex-[0_0_31%] sm:w-[31%] sm:min-w-[31%] sm:max-w-[31%] md:flex-[0_0_23%] md:w-[23%] md:min-w-[23%] md:max-w-[23%] lg:flex-[0_0_19%] lg:w-[19%] lg:min-w-[19%] lg:max-w-[19%] snap-start shrink-0 flex flex-col"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Previous products"
            className="flex absolute left-1.5 sm:left-2 md:-left-3 top-[38%] -translate-y-1/2 z-20 w-[34px] h-[34px] sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/95 border border-neutral-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.18)] items-center justify-center text-neutral-800 hover:text-black hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Next products"
            className="flex absolute right-1.5 sm:right-2 md:-right-3 top-[38%] -translate-y-1/2 z-20 w-[34px] h-[34px] sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/95 border border-neutral-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.18)] items-center justify-center text-neutral-800 hover:text-black hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </section>
  );
}
