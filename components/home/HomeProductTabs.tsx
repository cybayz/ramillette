"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
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
  const [activeTab, setActiveTab] = useState<TabKey>("best-sellers");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguageStore();

  const tabs: { key: TabKey; labelEn: string; labelAr: string; href: string }[] = [
    {
      key: "best-sellers",
      labelEn: "Best Sellers",
      labelAr: "الأكثر مبيعاً",
      href: "/shop/best-sellers",
    },
    {
      key: "own-brand",
      labelEn: "Own brand",
      labelAr: "علامة خاصة",
      href: "/shop/own-brand",
    },
    {
      key: "inspired",
      labelEn: "Inspired",
      labelAr: "مستوحى",
      href: "/shop/inspired",
    },
    {
      key: "luxury-perfumes",
      labelEn: "Luxury Perfumes",
      labelAr: "عطور فاخرة",
      href: "/shop/luxury-perfumes",
    },
    {
      key: "new-arrivals",
      labelEn: "New Arrivals",
      labelAr: "وصل حديثاً",
      href: "/shop/new-arrivals",
    },
  ];

  const getActiveProducts = (): CardProduct[] => {
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

  const activeProducts = getActiveProducts();
  const currentTabObj = tabs.find((t) => t.key === activeTab) || tabs[0];
  const currentTabLabel = language === "ar" ? currentTabObj.labelAr : currentTabObj.labelEn;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full py-8 sm:py-12 bg-white" aria-label="Featured Products Showcase">
      <div className="ramillette-container">
        {/* Pill Tabs Header (Clicking switches tab inline) */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-full text-[13px] sm:text-[14px] font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-[#253021] text-white shadow-sm border border-[#253021]"
                    : "bg-white text-[#1c1c1c] border border-[#d1d5db] hover:border-[#1c1c1c]"
                }`}
                aria-selected={isActive}
                role="tab"
              >
                {language === "ar" ? tab.labelAr : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* Product Cards Row with Navigation Arrows */}
        <div className="relative group/carousel">
          {/* Previous Arrow Button (Centered on Image Height ~120px) */}
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute left-1 sm:left-2 top-[120px] -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-md border border-neutral-100 flex items-center justify-center text-neutral-800 hover:scale-105 transition-all cursor-pointer"
            aria-label="Previous products"
          >
            <ChevronLeft size={18} className="stroke-[2.2]" />
          </button>

          {/* Cards Track (Single Row with exactly 5 visible on desktop) */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-1"
          >
            {activeProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(20%-13px)]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Next Arrow Button (Centered on Image Height ~120px) */}
          <button
            type="button"
            onClick={scrollRight}
            className="absolute right-1 sm:right-2 top-[120px] -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-md border border-neutral-100 flex items-center justify-center text-neutral-800 hover:scale-105 transition-all cursor-pointer"
            aria-label="Next products"
          >
            <ChevronRight size={18} className="stroke-[2.2]" />
          </button>
        </div>

        {/* View All Link at Bottom */}
        <div className="mt-8 flex items-center justify-start">
          <Link
            href={currentTabObj.href}
            className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#1c1c1c] hover:text-[#4e6648] transition-colors group"
          >
            <span>
              {language === "ar"
                ? `عرض جميع ${currentTabLabel}`
                : `View all ${currentTabLabel}`}
            </span>
            <ArrowUpRight
              size={17}
              className="stroke-[2.2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
