"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductCard, CardProduct } from "@/components/product/ProductCard";
import {
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { useLanguageStore } from "@/lib/store/useLanguageStore";
import { useCountryStore } from "@/lib/store/useCountryStore";
import { getDisplayedProductPrice } from "@/lib/country/productResolver";

export interface CategoryInfo {
  name: string;
  slug: string;
  description?: string | null;
  count?: number;
}

export interface ShopListingProps {
  category: CategoryInfo;
  products: CardProduct[];
  allCategories?: CategoryInfo[];
  categoryCounts?: Record<string, number>;
  initialSize?: string;
  isArabic?: boolean;
}

const SIZE_OPTIONS = ["All", "80ml", "30ml", "50ml", "100ml"];

export function ShopListing({
  category,
  products,
  allCategories = [],
  categoryCounts = {},
  initialSize,
  isArabic,
}: ShopListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { language } = useLanguageStore();
  const { country } = useCountryStore();

  const isAr = isArabic !== undefined ? isArabic : Boolean(pathname?.startsWith("/ar"));

  // URL query search params
  const urlSize = searchParams?.get("size") || initialSize || "All";
  const urlSort =
    searchParams?.get("sort") || searchParams?.get("sort_by") || "name-asc";
  const [selectedSize, setSelectedSize] = useState<string>(urlSize);
  const [sortOption, setSortOption] = useState<string>(urlSort);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileFiltersOpen]);

  // Accordion open/close states
  const [categoryOpen, setCategoryOpen] = useState<boolean>(true);
  const [availabilityOpen, setAvailabilityOpen] = useState<boolean>(true);
  const [priceOpen, setPriceOpen] = useState<boolean>(true);

  // Stock filter: "all" | "in-stock" | "out-of-stock"
  const [selectedStock, setSelectedStock] = useState<"all" | "in-stock" | "out-of-stock">("all");

  // Determine min & max prices from products
  const productPrices = useMemo(() => {
    return products.map((p) => p.basePrice).filter((pr) => !isNaN(pr) && pr > 0);
  }, [products]);

  const sliderMax = 200;

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(sliderMax);
  const [minPriceInput, setMinPriceInput] = useState<string>("0");
  const [maxPriceInput, setMaxPriceInput] = useState<string>(String(sliderMax));
  const [appliedPriceRange, setAppliedPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: sliderMax,
  });

  // Keep search params in sync with selectedSize and sortOption
  useEffect(() => {
    const s = searchParams?.get("size");
    if (s && SIZE_OPTIONS.map((x) => x.toLowerCase()).includes(s.toLowerCase())) {
      const matched = SIZE_OPTIONS.find((x) => x.toLowerCase() === s.toLowerCase());
      if (matched) setSelectedSize(matched);
    }
    const sort = searchParams?.get("sort") || searchParams?.get("sort_by");
    if (sort) {
      setSortOption(sort);
    }
  }, [searchParams]);

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (size === "All" || size === "all") {
        url.searchParams.delete("size");
      } else {
        url.searchParams.set("size", size);
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleMinSliderChange = (newVal: number) => {
    const val = Math.min(newVal, maxPrice - 1);
    setMinPrice(val);
    setMinPriceInput(String(val));
  };

  const handleMaxSliderChange = (newVal: number) => {
    const val = Math.max(newVal, minPrice + 1);
    setMaxPrice(val);
    setMaxPriceInput(String(val));
  };

  const handleMinInputChange = (str: string) => {
    setMinPriceInput(str);
    const num = parseFloat(str);
    if (!isNaN(num)) {
      setMinPrice(Math.max(0, Math.min(num, maxPrice - 1)));
    }
  };

  const handleMaxInputChange = (str: string) => {
    setMaxPriceInput(str);
    const num = parseFloat(str);
    if (!isNaN(num)) {
      setMaxPrice(Math.max(minPrice + 1, Math.min(num, sliderMax)));
    }
  };

  const handleApplyPrice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const minVal = parseFloat(minPriceInput) || 0;
    const maxVal = parseFloat(maxPriceInput) || sliderMax;
    const finalMin = Math.max(0, Math.min(minVal, maxVal));
    const finalMax = Math.max(finalMin, maxVal);
    setMinPrice(finalMin);
    setMaxPrice(finalMax);
    setAppliedPriceRange({ min: finalMin, max: finalMax });
  };

  const isPriceFiltered =
    appliedPriceRange.min > 0 || appliedPriceRange.max < sliderMax;
  const isSizeFiltered = selectedSize !== "All" && selectedSize !== "all";
  const isStockFiltered = selectedStock !== "all";

  const hasActiveFilters = isSizeFiltered || isPriceFiltered || isStockFiltered;

  const resetAllFilters = () => {
    handleSizeChange("All");
    setSelectedStock("all");
    setMinPrice(0);
    setMaxPrice(sliderMax);
    setMinPriceInput("0");
    setMaxPriceInput(String(sliderMax));
    setAppliedPriceRange({ min: 0, max: sliderMax });
  };

  // Precomputed Category Counts
  const counts = useMemo(() => {
    const cMap: Record<string, number> = {
      all: products.length,
      "best-sellers": products.filter((p) => p.bestseller).length,
      inspired: products.filter(
        (p) =>
          p.categoryName?.toLowerCase() === "inspired" ||
          p.slug.includes("inspired") ||
          !p.bestseller
      ).length,
      "luxury-perfumes": products.filter(
        (p) =>
          p.categoryName?.toLowerCase().includes("luxury") ||
          p.basePrice >= 80 ||
          p.slug.includes("oud")
      ).length,
      "new-arrivals": products.filter((p) => p.newArrival).length,
      "own-brand": products.filter(
        (p) =>
          p.categoryName?.toLowerCase().includes("own") ||
          p.slug.includes("amber-code") ||
          p.slug.includes("ramillette")
      ).length,
      ...categoryCounts,
    };
    return cMap;
  }, [products, categoryCounts]);

  const categoryPrefix = isAr ? "/ar/collections" : "/collections";

  // Standard category links list matching reference site screenshots
  const categoryLinks = [
    {
      name: isAr ? "جميع المنتجات" : "All Products",
      slug: "all",
      href: `${categoryPrefix}/all`,
      count: counts.all ?? products.length,
    },
    {
      name: isAr ? "الأكثر مبيعاً" : "Best Sellers",
      slug: "best-sellers",
      href: `${categoryPrefix}/best-sellers`,
      count: counts["best-sellers"] ?? 13,
    },
    {
      name: isAr ? "مستوحى" : "Inspired",
      slug: "inspired",
      href: `${categoryPrefix}/inspired`,
      count: counts.inspired ?? 38,
    },
    {
      name: isAr ? "عطور فاخرة" : "Luxury Perfumes",
      slug: "luxury-perfumes",
      href: `${categoryPrefix}/luxury-perfumes`,
      count: counts["luxury-perfumes"] ?? 15,
    },
    {
      name: isAr ? "وصل حديثاً" : "New Arrivals",
      slug: "new-arrivals",
      href: `${categoryPrefix}/new-arrivals`,
      count: counts["new-arrivals"] ?? 11,
    },
    {
      name: isAr ? "علامتنا التجارية" : "Own brand",
      slug: "own-brand",
      href: `${categoryPrefix}/own-brand`,
      count: counts["own-brand"] ?? 1,
    },
  ];

  // In-stock & out-of-stock counts
  const stockCounts = useMemo(() => {
    let inStock = 0;
    let outOfStock = 0;
    products.forEach((p) => {
      const hasStock =
        p.variants && p.variants.length > 0
          ? p.variants.some((v) => (v.stock ?? 1) > 0)
          : true;
      if (hasStock) inStock++;
      else outOfStock++;
    });
    return {
      inStock: inStock || products.length,
      outOfStock: outOfStock || 0,
    };
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Size Filter
        if (selectedSize !== "All" && selectedSize !== "all") {
          const lowerSize = selectedSize.toLowerCase();
          const cleanSize = selectedSize.replace(/\s+/g, "").toLowerCase();
          const hasVariant = p.variants?.some(
            (v) =>
              v.name.toLowerCase().includes(lowerSize) ||
              v.name.replace(/\s+/g, "").toLowerCase().includes(cleanSize)
          );
          // If variants exist, require match
          if (p.variants && p.variants.length > 0 && !hasVariant) {
            return false;
          }
        }

        // Price Filter based on effective displayed price
        const effectivePrice = getDisplayedProductPrice(p, selectedSize, country);
        if (effectivePrice < appliedPriceRange.min) return false;
        if (effectivePrice > appliedPriceRange.max) return false;

        // Stock Filter
        if (selectedStock === "in-stock") {
          const hasStock =
            p.variants && p.variants.length > 0
              ? p.variants.some((v) => (v.stock ?? 1) > 0)
              : true;
          if (!hasStock) return false;
        } else if (selectedStock === "out-of-stock") {
          const hasStock =
            p.variants && p.variants.length > 0
              ? p.variants.some((v) => (v.stock ?? 1) > 0)
              : true;
          if (hasStock) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "price-low") {
          const priceA = getDisplayedProductPrice(a, selectedSize, country);
          const priceB = getDisplayedProductPrice(b, selectedSize, country);
          if (priceA !== priceB) return priceA - priceB;
          return a.name.localeCompare(b.name);
        }
        if (sortOption === "price-high") {
          const priceA = getDisplayedProductPrice(a, selectedSize, country);
          const priceB = getDisplayedProductPrice(b, selectedSize, country);
          if (priceA !== priceB) return priceB - priceA;
          return a.name.localeCompare(b.name);
        }
        if (sortOption === "name-asc") return a.name.localeCompare(b.name);
        if (sortOption === "name-desc") return b.name.localeCompare(a.name);
        if (sortOption === "bestseller")
          return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
        return 0; // Default: relevant / featured
      });
  }, [products, selectedSize, appliedPriceRange, selectedStock, sortOption, country]);

  // Collection Title
  const displayTitle = useMemo(() => {
    if (category.slug === "all") return isAr ? "المنتجات" : "Products";
    if (category.slug === "best-sellers")
      return isAr ? "الأكثر مبيعاً" : "Best Sellers";
    if (category.slug === "inspired") return isAr ? "مستوحى" : "Inspired";
    if (category.slug === "luxury-perfumes")
      return isAr ? "عطور فاخرة" : "Luxury Perfumes";
    if (category.slug === "new-arrivals")
      return isAr ? "وصل حديثاً" : "New Arrivals";
    if (category.slug === "own-brand")
      return isAr ? "علامتنا التجارية" : "Own brand";
    return category.name;
  }, [category, isAr]);

  // Item count label text
  const itemCountText = useMemo(() => {
    const count = filteredProducts.length;
    let label = displayTitle;
    if (isSizeFiltered) {
      label = `${displayTitle} • ${selectedSize}`;
    }
    return {
      count,
      label,
    };
  }, [filteredProducts.length, displayTitle, isSizeFiltered, selectedSize]);

  return (
    <div className="bg-white min-h-screen pb-16">
      {/* 1. Top Hero Banner: Deep Forest/Olive Green with Bold White Title */}
      <div className="w-full bg-[#374b33] py-12 sm:py-16 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight">
          {displayTitle}
        </h1>
      </div>

      {/* 2. Sub-bar: Breadcrumbs on Left + Preserved Sort dropdown on Right */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="ramillette-container px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb badge (Grey pill badge) */}
          <nav
            aria-label="Breadcrumb"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f0ee] rounded-[4px] text-[11px] font-bold uppercase tracking-wider text-neutral-500 select-none"
          >
            <Link href={isAr ? "/ar" : "/"} className="hover:text-neutral-900 transition-colors">
              {isAr ? "الرئيسية" : "HOME"}
            </Link>
            <span className="text-neutral-400 font-normal">›</span>
            <span className="text-neutral-900">{displayTitle}</span>
          </nav>

          {/* Sort dropdown (Preserved as explicitly requested: "the design of current sort is good. keep that") */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-neutral-600 font-medium whitespace-nowrap">
              {isAr ? "ترتيب حسب :" : "Sort by :"}
            </span>
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => {
                  const newSort = e.target.value;
                  setSortOption(newSort);
                  if (typeof window !== "undefined") {
                    const url = new URL(window.location.href);
                    if (newSort === "name-asc") {
                      url.searchParams.delete("sort");
                      url.searchParams.delete("sort_by");
                    } else {
                      url.searchParams.set("sort", newSort);
                    }
                    window.history.pushState({}, "", url.toString());
                  }
                }}
                className="appearance-none bg-white border border-[#d1d5db] hover:border-neutral-400 rounded-[5px] pl-3 pr-8 py-1.5 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-[#374b33] cursor-pointer shadow-2xs"
              >
                <option value="name-asc">
                  {isAr ? "أبجدياً، أ-ي" : "Alphabetically, A-Z"}
                </option>
                <option value="name-desc">
                  {isAr ? "أبجدياً، ي-أ" : "Alphabetically, Z-A"}
                </option>
                <option value="price-low">
                  {isAr ? "السعر: من الأقل للأعلى" : "Price, low to high"}
                </option>
                <option value="price-high">
                  {isAr ? "السعر: من الأعلى للأقل" : "Price, high to low"}
                </option>
                <option value="featured">
                  {isAr ? "الأكثر صلة" : "Most relevant"}
                </option>
                <option value="bestseller">
                  {isAr ? "الأكثر مبيعاً" : "Best Selling"}
                </option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Filter Sidebar + Right Product Column */}
      <div className="ramillette-container px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 min-w-0 max-w-full overflow-hidden">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-800 bg-white hover:bg-neutral-50 shadow-2xs"
          >
            <SlidersHorizontal size={14} />
            <span>{isAr ? "تصفية المنتجات" : "Filter"}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#374b33]" />
            )}
          </button>

          <span className="text-xs text-neutral-500">
            <strong className="text-neutral-900 font-bold">
              {filteredProducts.length}
            </strong>{" "}
            {isAr ? "منتج" : "items"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* 3. Left Filter Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 pr-2 select-none">
            {/* Filter Header & Clear all */}
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-[20px] font-extrabold text-neutral-900 tracking-tight">
                {isAr ? "تصفية" : "Filter"}
              </h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-bold text-[#374b33] hover:underline cursor-pointer"
                >
                  {isAr ? "مسح الكل" : "Clear all"}
                </button>
              )}
            </div>

            {/* Selected Filter Badge Chips (e.g. [ 30ml × ], [ QAR ... × ]) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4 pt-1">
                {isSizeFiltered && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eef3ec] text-[#2c3d28] border border-[#d2dfd0] rounded-full text-xs font-bold shadow-2xs">
                    <span>{selectedSize}</span>
                    <button
                      type="button"
                      onClick={() => handleSizeChange("All")}
                      className="hover:text-red-600 transition-colors cursor-pointer"
                      aria-label="Remove size filter"
                    >
                      <X size={13} className="stroke-[2.5]" />
                    </button>
                  </span>
                )}

                {isPriceFiltered && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eef3ec] text-[#2c3d28] border border-[#d2dfd0] rounded-full text-xs font-bold shadow-2xs">
                    <span>
                      QAR {appliedPriceRange.min.toLocaleString()} - {appliedPriceRange.max.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice(0);
                        setMaxPrice(sliderMax);
                        setMinPriceInput("0");
                        setMaxPriceInput(String(sliderMax));
                        setAppliedPriceRange({ min: 0, max: sliderMax });
                      }}
                      className="hover:text-red-600 transition-colors cursor-pointer"
                      aria-label="Remove price filter"
                    >
                      <X size={13} className="stroke-[2.5]" />
                    </button>
                  </span>
                )}

                {isStockFiltered && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eef3ec] text-[#2c3d28] border border-[#d2dfd0] rounded-full text-xs font-bold shadow-2xs">
                    <span>
                      {selectedStock === "in-stock"
                        ? isAr
                          ? "متوفر بالمخزون"
                          : "In stock"
                        : isAr
                          ? "نفذت الكمية"
                          : "Out of stock"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedStock("all")}
                      className="hover:text-red-600 transition-colors cursor-pointer"
                      aria-label="Remove stock filter"
                    >
                      <X size={13} className="stroke-[2.5]" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Accordion 1: Category */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="w-full flex items-center justify-between py-2 text-start font-bold text-[15px] text-neutral-900 cursor-pointer"
              >
                <span>{isAr ? "الفئة" : "Category"}</span>
                {categoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {categoryOpen && (
                <ul className="mt-2 space-y-1">
                  {categoryLinks.map((cat) => {
                    const isActive = category.slug === cat.slug;
                    return (
                      <li key={cat.slug}>
                        <Link
                          href={cat.href}
                          className={`flex items-center justify-between text-xs py-2 px-3 rounded-lg transition-all ${isActive
                              ? "bg-[#eef3ec] text-[#2c3d28] font-bold shadow-2xs"
                              : "text-neutral-700 hover:text-neutral-950 font-semibold hover:bg-neutral-50"
                            }`}
                        >
                          <span>{cat.name}</span>
                          {cat.slug !== "all" && (
                            <span className="text-neutral-500 font-semibold">
                              ({cat.count})
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-neutral-200 my-4" />

            {/* Accordion 2: Availability */}
            <div>
              <button
                type="button"
                onClick={() => setAvailabilityOpen(!availabilityOpen)}
                className="w-full flex items-center justify-between py-2 text-start font-bold text-[15px] text-neutral-900 cursor-pointer"
              >
                <span>{isAr ? "التوفر" : "Availability"}</span>
                {availabilityOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>

              {availabilityOpen && (
                <div className="mt-2 space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedStock(
                        selectedStock === "in-stock" ? "all" : "in-stock"
                      )
                    }
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-start transition-all cursor-pointer ${selectedStock === "in-stock"
                        ? "bg-[#eef3ec] text-[#2c3d28] font-bold"
                        : "text-neutral-700 hover:text-neutral-950 font-semibold hover:bg-neutral-50"
                      }`}
                  >
                    <span>{isAr ? "متوفر بالمخزون" : "In stock"}</span>
                    <span className="text-neutral-500">
                      ({stockCounts.inStock})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedStock(
                        selectedStock === "out-of-stock" ? "all" : "out-of-stock"
                      )
                    }
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-start transition-all cursor-pointer ${selectedStock === "out-of-stock"
                        ? "bg-[#eef3ec] text-[#2c3d28] font-bold"
                        : "text-neutral-700 hover:text-neutral-950 font-semibold hover:bg-neutral-50"
                      }`}
                  >
                    <span>{isAr ? "نفذت الكمية" : "Out of stock"}</span>
                    <span className="text-neutral-500">
                      ({stockCounts.outOfStock})
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-neutral-200 my-4" />

            {/* Accordion 3: Price */}
            <div>
              <button
                type="button"
                onClick={() => setPriceOpen(!priceOpen)}
                className="w-full flex items-center justify-between py-2 text-start font-bold text-[15px] text-neutral-900 cursor-pointer"
              >
                <span>{isAr ? "السعر" : "Price"}</span>
                {priceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {priceOpen && (
                <div className="mt-2 space-y-4">
                  {/* Dual price badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-[#eef3ec] text-[#2c3d28] font-bold text-xs rounded-md px-2.5 py-1">
                      QAR {minPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="bg-[#eef3ec] text-[#2c3d28] font-bold text-xs rounded-md px-2.5 py-1">
                      QAR {maxPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Two-way Dual Range Slider */}
                  <div className="relative w-full h-8 flex items-center dual-range-slider select-none">
                    {/* Inactive base grey track */}
                    <div className="absolute w-full h-1 bg-[#dcdcdc] rounded-full" />

                    {/* Active olive green track between min and max */}
                    <div
                      className="absolute h-1 bg-[#4e6648] rounded-full pointer-events-none"
                      style={{
                        left: `${(minPrice / sliderMax) * 100}%`,
                        width: `${Math.max(0, ((maxPrice - minPrice) / sliderMax) * 100)}%`,
                      }}
                    />

                    {/* Min handle slider */}
                    <input
                      type="range"
                      min={0}
                      max={sliderMax}
                      step={1}
                      value={minPrice}
                      onChange={(e) => handleMinSliderChange(Number(e.target.value))}
                      className={`z-20 ${minPrice > sliderMax * 0.9 ? "z-30" : ""}`}
                      aria-label={isAr ? "الحد الأدنى للسعر" : "Minimum price"}
                    />

                    {/* Max handle slider */}
                    <input
                      type="range"
                      min={0}
                      max={sliderMax}
                      step={1}
                      value={maxPrice}
                      onChange={(e) => handleMaxSliderChange(Number(e.target.value))}
                      className="z-20"
                      aria-label={isAr ? "الحد الأقصى للسعر" : "Maximum price"}
                    />
                  </div>

                  {/* Inputs & Apply Button */}
                  <form onSubmit={handleApplyPrice} className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={sliderMax}
                      value={minPriceInput}
                      onChange={(e) => handleMinInputChange(e.target.value)}
                      placeholder="0"
                      className="w-20 px-2 py-1.5 border border-neutral-300 rounded-md text-xs font-semibold text-center text-neutral-900 focus:outline-none focus:border-[#374b33]"
                    />
                    <span className="text-neutral-400 font-bold">—</span>
                    <input
                      type="number"
                      min={0}
                      max={sliderMax}
                      value={maxPriceInput}
                      onChange={(e) => handleMaxInputChange(e.target.value)}
                      placeholder={String(sliderMax)}
                      className="w-20 px-2 py-1.5 border border-neutral-300 rounded-md text-xs font-semibold text-center text-neutral-900 focus:outline-none focus:border-[#374b33]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-[#233324] hover:bg-[#1a281b] text-white font-bold text-xs rounded-md transition-colors cursor-pointer"
                    >
                      {isAr ? "تطبيق" : "Apply"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </aside>

          {/* 4. Right Main Column: Horizontal Size Segmented Bar + Product Grid */}
          <main className="lg:col-span-9 min-w-0 max-w-full">
            {/* Horizontal Size Segmented Control Bar */}
            <div className="w-full bg-[#f0f0ee] p-1 rounded-lg flex items-center gap-1 overflow-x-auto select-none no-scrollbar">
              {SIZE_OPTIONS.map((size) => {
                const isActive =
                  selectedSize.toLowerCase() === size.toLowerCase();
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeChange(size)}
                    className={`flex-1 min-w-[58px] sm:min-w-[70px] py-1.5 px-2 sm:px-5 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center whitespace-nowrap ${isActive
                        ? "bg-white text-neutral-900 font-bold shadow-xs"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50"
                      }`}
                  >
                    {size === "All" && isAr ? "الكل" : size}
                  </button>
                );
              })}
            </div>

            {/* Product Count Header */}
            <div className="mt-4 mb-6">
              <p className="text-sm sm:text-[15px] text-neutral-700">
                <strong className="font-extrabold text-neutral-900">
                  {itemCountText.count} {isAr ? "منتج" : "items"}
                </strong>{" "}
                <span className="text-neutral-500 font-normal">
                  {isAr ? "في" : "in"} {itemCountText.label}
                </span>
              </p>
            </div>

            {/* Product Cards Grid: 4 columns on large screens matching reference screenshots */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-[#fafafa] rounded-xl border border-neutral-200 p-8">
                <h3 className="text-base font-bold text-neutral-900 mb-2">
                  {isAr ? "لم يتم العثور على منتجات" : "No Fragrances Found"}
                </h3>
                <p className="text-xs text-neutral-500 mb-6 max-w-sm mx-auto">
                  {isAr
                    ? "لا توجد نتائج تطابق معايير التصفية المحددة. جرب مسح عوامل التصفية."
                    : "No products matched your selected filters. Try clearing your filters or changing the size."}
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 bg-[#233324] text-white rounded-lg text-xs font-bold hover:bg-[#1a281b] transition-colors cursor-pointer"
                >
                  {isAr ? "مسح جميع الفلاتر" : "Clear all filters"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="collection"
                    selectedSize={selectedSize}
                    isArabic={isAr}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Slideout Filter Drawer */}
      {mounted &&
        mobileFiltersOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
                <h3 className="font-extrabold text-base text-neutral-900 uppercase">
                  {isAr ? "تصفية المنتجات" : "Filters"}
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-neutral-500 hover:text-neutral-900"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  {isAr ? "الفئات" : "Categories"}
                </h4>
                <div className="space-y-1 text-xs">
                  {categoryLinks.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={cat.href}
                      onClick={() => setMobileFiltersOpen(false)}
                      className={`block py-2 px-2 rounded-md ${category.slug === cat.slug
                          ? "bg-[#eef3ec] text-[#2c3d28] font-bold"
                          : "text-neutral-700 hover:text-neutral-950 font-medium"
                        }`}
                    >
                      {cat.name} {cat.slug !== "all" && `(${cat.count})`}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  {isAr ? "التوفر" : "Availability"}
                </h4>
                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedStock(
                        selectedStock === "in-stock" ? "all" : "in-stock"
                      )
                    }
                    className={`w-full text-start py-2 px-2 rounded-md ${selectedStock === "in-stock"
                        ? "bg-[#eef3ec] text-[#2c3d28] font-bold"
                        : "text-neutral-700"
                      }`}
                  >
                    {isAr ? "متوفر بالمخزون" : "In stock"} ({stockCounts.inStock})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedStock(
                        selectedStock === "out-of-stock" ? "all" : "out-of-stock"
                      )
                    }
                    className={`w-full text-start py-2 px-2 rounded-md ${selectedStock === "out-of-stock"
                        ? "bg-[#eef3ec] text-[#2c3d28] font-bold"
                        : "text-neutral-700"
                      }`}
                  >
                    {isAr ? "نفذت الكمية" : "Out of stock"} (
                    {stockCounts.outOfStock})
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  {isAr ? "السعر" : "Price Range"}
                </h4>
                <div className="space-y-4">
                  {/* Dual price badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-[#eef3ec] text-[#2c3d28] font-bold text-xs rounded-md px-2 py-1">
                      QAR {minPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="bg-[#eef3ec] text-[#2c3d28] font-bold text-xs rounded-md px-2 py-1">
                      QAR {maxPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Two-way Dual Range Slider */}
                  <div className="relative w-full h-8 flex items-center dual-range-slider select-none">
                    <div className="absolute w-full h-1 bg-[#dcdcdc] rounded-full" />
                    <div
                      className="absolute h-1 bg-[#4e6648] rounded-full pointer-events-none"
                      style={{
                        left: `${(minPrice / sliderMax) * 100}%`,
                        width: `${Math.max(0, ((maxPrice - minPrice) / sliderMax) * 100)}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={sliderMax}
                      step={1}
                      value={minPrice}
                      onChange={(e) => handleMinSliderChange(Number(e.target.value))}
                      className={`z-20 ${minPrice > sliderMax * 0.9 ? "z-30" : ""}`}
                      aria-label={isAr ? "الحد الأدنى للسعر" : "Minimum price"}
                    />
                    <input
                      type="range"
                      min={0}
                      max={sliderMax}
                      step={1}
                      value={maxPrice}
                      onChange={(e) => handleMaxSliderChange(Number(e.target.value))}
                      className="z-20"
                      aria-label={isAr ? "الحد الأقصى للسعر" : "Maximum price"}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={sliderMax}
                      value={minPriceInput}
                      onChange={(e) => handleMinInputChange(e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1.5 border border-neutral-300 rounded-md text-xs font-semibold text-center"
                    />
                    <span>—</span>
                    <input
                      type="number"
                      min={0}
                      max={sliderMax}
                      value={maxPriceInput}
                      onChange={(e) => handleMaxInputChange(e.target.value)}
                      placeholder={String(sliderMax)}
                      className="w-full px-2 py-1.5 border border-neutral-300 rounded-md text-xs font-semibold text-center"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleApplyPrice();
                      setMobileFiltersOpen(false);
                    }}
                    className="w-full py-2 bg-[#233324] text-white font-bold text-xs rounded-md cursor-pointer"
                  >
                    {isAr ? "تطبيق السعر" : "Apply Price"}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 space-y-2">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-2.5 bg-[#233324] text-white font-bold text-xs rounded-md shadow-xs"
              >
                {isAr ? "عرض النتائج" : "Show Results"} ({filteredProducts.length})
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="w-full py-2 border border-neutral-300 text-neutral-600 font-bold text-xs rounded-md"
                >
                  {isAr ? "إعادة تعيين الكل" : "Reset All"}
                </button>
              )}
            </div>
          </div>
          </div>,
          document.body
        )}
    </div>
  );
}
