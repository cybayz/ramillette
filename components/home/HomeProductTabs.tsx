"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { ProductCard, CardProduct } from "@/components/product/ProductCard";
import { useLanguageStore } from "@/lib/store/useLanguageStore";

interface HomeProductTabsProps {
  bestSellers: CardProduct[];
  ownBrand: CardProduct[];
  inspired: CardProduct[];
  luxuryPerfumes: CardProduct[];
  newArrivals: CardProduct[];
}

type TabKey = "best-sellers" | "own-brand" | "inspired" | "luxury-perfumes" | "new-arrivals";

export function HomeProductTabs({
  bestSellers,
  ownBrand,
  inspired,
  luxuryPerfumes,
  newArrivals,
}: HomeProductTabsProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabKey>("best-sellers");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguageStore();

  const isAr = pathname?.startsWith("/ar") || language === "ar";

  const tabs: { key: TabKey; labelEn: string; labelAr: string; href: string }[] = [
    {
      key: "best-sellers",
      labelEn: "Best Sellers",
      labelAr: "الأكثر مبيعًا",
      href: isAr ? "/ar/shop/best-sellers" : "/shop/best-sellers",
    },
    {
      key: "own-brand",
      labelEn: "Own brand",
      labelAr: "علامة تجارية خاصة",
      href: isAr ? "/ar/shop/own-brand" : "/shop/own-brand",
    },
    {
      key: "inspired",
      labelEn: "Inspired",
      labelAr: "مُلهم",
      href: isAr ? "/ar/shop/inspired" : "/shop/inspired",
    },
    {
      key: "luxury-perfumes",
      labelEn: "Luxury Perfumes",
      labelAr: "عطور فاخرة",
      href: isAr ? "/ar/shop/luxury-perfumes" : "/shop/luxury-perfumes",
    },
    {
      key: "new-arrivals",
      labelEn: "New Arrivals",
      labelAr: "وصل حديثًا",
      href: isAr ? "/ar/shop/new-arrivals" : "/shop/new-arrivals",
    },
  ];

  const getActiveProducts = () => {
    switch (activeTab) {
      case "best-sellers":
        return bestSellers;
      case "own-brand":
        return ownBrand;
      case "inspired":
        return inspired;
      case "luxury-perfumes":
        return luxuryPerfumes;
      case "new-arrivals":
        return newArrivals;
      default:
        return bestSellers;
    }
  };

  const activeTabObj = tabs.find((t) => t.key === activeTab) || tabs[0];
  const activeProducts = getActiveProducts();

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const isRtl = isAr;
      const scrollAmount = Math.min(scrollContainerRef.current.clientWidth * 0.8, 380);
      const moveLeft =
        direction === "left"
          ? (isRtl ? scrollAmount : -scrollAmount)
          : (isRtl ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollBy({
        left: moveLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="ramillette-container">
        {/* Tab Selection Buttons Bar */}
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto no-scrollbar py-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#1c1c1c] text-white shadow-sm"
                    : "bg-white text-neutral-800 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50"
                }`}
              >
                {isAr ? tab.labelAr : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* Carousel Container with Products */}
        <div className="relative group/carousel -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* Scrollable Row with Mobile Peeking Card */}
          <div
            ref={scrollContainerRef}
            className="grid grid-flow-col auto-cols-[calc(43.5%-6px)] sm:auto-cols-[calc(33.333%-12px)] md:auto-cols-[calc(25%-12px)] lg:auto-cols-[calc(20%-13px)] gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {activeProducts.map((product) => (
              <div key={product.id} className="min-w-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Left Navigation Arrow */}
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Previous products"
            className="flex absolute left-1 sm:left-2 md:left-4 top-[32%] -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/95 border border-neutral-200/80 shadow-[0_3px_10px_rgba(0,0,0,0.15)] items-center justify-center text-neutral-800 hover:text-black hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isAr ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Right Navigation Arrow */}
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Next products"
            className="flex absolute right-1 sm:right-2 md:right-4 top-[32%] -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/95 border border-neutral-200/80 shadow-[0_3px_10px_rgba(0,0,0,0.15)] items-center justify-center text-neutral-800 hover:text-black hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isAr ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Bottom Link: View all [Tab Name] (matching Screenshot) */}
        <div className="mt-8 flex justify-end">
          <Link
            href={activeTabObj.href}
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1c1c1c] hover:text-[#4e6648] transition-colors"
          >
            <span>
              View all {isAr ? activeTabObj.labelAr : activeTabObj.labelEn}
            </span>
            <span className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              {isAr ? "↖" : "↗"}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
