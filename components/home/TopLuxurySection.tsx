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
      const offset = direction === "left" ? -350 : 350;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
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
        <div className="relative group/carousel">
          {/* Scrollable Track */}
          <div
            ref={scrollRef}
            className="grid grid-flow-col auto-cols-[calc(50%-8px)] sm:auto-cols-[calc(33.333%-12px)] md:auto-cols-[calc(25%-12px)] lg:auto-cols-[calc(20%-13px)] gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div key={product.id} className="min-w-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={() => scroll("left")}
            aria-label="Previous products"
            className="hidden sm:flex absolute left-2 md:left-4 top-[32%] -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/95 border border-neutral-100 shadow-[0_4px_12px_rgba(0,0,0,0.15)] items-center justify-center text-neutral-800 hover:text-black hover:bg-white hover:scale-105 active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll("right")}
            aria-label="Next products"
            className="hidden sm:flex absolute right-2 md:right-4 top-[32%] -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/95 border border-neutral-100 shadow-[0_4px_12px_rgba(0,0,0,0.15)] items-center justify-center text-neutral-800 hover:text-black hover:bg-white hover:scale-105 active:scale-95 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
