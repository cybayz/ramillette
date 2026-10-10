"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductCard, CardProduct } from "@/components/product/ProductCard";
import {
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  Check,
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

const SIZE_OPTIONS = ["All", "30ml", "50ml", "80ml", "100ml"];

const SORT_OPTIONS = [
  { value: "name-asc", labelEn: "Alphabetically, A-Z", labelAr: "أبجدياً، أ-ي" },
  { value: "name-desc", labelEn: "Alphabetically, Z-A", labelAr: "أبجدياً، ي-أ" },
  { value: "price-low", labelEn: "Price: Low to High", labelAr: "السعر: من الأقل للأعلى" },
  { value: "price-high", labelEn: "Price: High to Low", labelAr: "السعر: من الأعلى للأقل" },
  { value: "featured", labelEn: "Most Relevant", labelAr: "الأكثر صلة" },
  { value: "bestseller", labelEn: "Best Selling", labelAr: "الأكثر مبيعاً" },
];

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
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mounted, setMounted] = useState<boolean>(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (filterDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [filterDrawerOpen]);

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

  const handleSortSelect = (newSort: string) => {
    setSortOption(newSort);
    setSortDropdownOpen(false);
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
      {/* Compact Top Filter & Navigation Section matching reference design */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="ramillette-container px-4 sm:px-6 lg:px-8 pt-4 pb-3 sm:pt-6 sm:pb-4">
          {/* Row 1: Breadcrumb (Left) + Fragrance Count (Right) */}
          <div className="flex items-center justify-between gap-3">
            {/* Breadcrumb Pill */}
            <nav
              aria-label="Breadcrumb"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f0ee] rounded-lg text-xs font-semibold text-neutral-500 select-none"
            >
              <Link
                href={isAr ? "/ar" : "/"}
                className="hover:text-neutral-900 transition-colors"
              >
                {isAr ? "الرئيسية" : "Home"}
              </Link>
              <span className="text-neutral-400 font-normal">›</span>
              <h1 className="text-neutral-900 font-bold inline text-xs m-0 p-0">
                {displayTitle}
              </h1>
            </nav>

            {/* Fragrance Count */}
            <span className="text-xs sm:text-sm font-semibold text-neutral-800">
              {filteredProducts.length}{" "}
              {isAr
                ? "عطر"
                : filteredProducts.length === 1
                ? "fragrance"
                : "fragrances"}
            </span>
          </div>

          {/* Row 2: Filter Button | Sort Button (Left) & Grid/List View Toggle (Right) */}
          <div className="flex items-center justify-between gap-3 mt-3 sm:mt-4">
            {/* Left: Filter | Sort */}
            <div className="flex items-center">
              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 border border-neutral-200 hover:border-neutral-400 bg-white rounded-2xl text-xs sm:text-sm font-semibold text-neutral-900 shadow-2xs hover:bg-neutral-50 transition-all cursor-pointer"
              >
                <SlidersHorizontal size={15} className="text-neutral-900 shrink-0" />
                <span>{isAr ? "تصفية" : "Filter"}</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-[#374b33]" />
                )}
              </button>

              {/* Vertical Divider */}
              <div className="h-5 w-[1px] bg-neutral-200 mx-2.5 sm:mx-3 shrink-0" />

              {/* Sort Button with Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  type="button"
                  onClick={() => setSortDropdownOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 border border-neutral-200 hover:border-neutral-400 bg-white rounded-2xl text-xs sm:text-sm font-semibold text-neutral-900 shadow-2xs hover:bg-neutral-50 transition-all cursor-pointer"
                >
                  <ArrowUpDown size={15} className="text-neutral-900 shrink-0" />
                  <span>{isAr ? "ترتيب" : "Sort"}</span>
                  <ChevronDown
                    size={14}
                    className={`text-neutral-500 transition-transform ${
                      sortDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Sort Dropdown Menu */}
                {sortDropdownOpen && (
                  <div className="absolute top-full mt-2 start-0 z-40 w-56 sm:w-60 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSortSelect(opt.value)}
                        className={`w-full px-4 py-2 text-start text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                          sortOption === opt.value
                            ? "bg-[#eef3ec] text-[#2c3d28] font-bold"
                            : "text-neutral-700 hover:bg-neutral-50 font-medium"
                        }`}
                      >
                        <span>{isAr ? opt.labelAr : opt.labelEn}</span>
                        {sortOption === opt.value && (
                          <Check size={14} className="text-[#374b33]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: View Toggle (Grid / List) */}
            <div className="inline-flex items-center bg-[#f0f0ee] p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label={isAr ? "عرض الشبكة" : "Grid view"}
                className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#374b33] text-white shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <LayoutGrid size={17} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label={isAr ? "عرض القائمة" : "List view"}
                className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#374b33] text-white shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <List size={17} />
              </button>
            </div>
          </div>

          {/* Row 3: Size Filter Pills */}
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar pt-3 pb-1 select-none">
            {SIZE_OPTIONS.map((size) => {
              const isActive = selectedSize.toLowerCase() === size.toLowerCase();
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeChange(size)}
                  className={`px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-[#374b33] text-white font-bold shadow-xs"
                      : "bg-[#f0f0ee] hover:bg-[#e4e4e0] text-neutral-800 hover:text-neutral-950 font-semibold"
                  }`}
                >
                  {size === "All" && isAr ? "الكل" : size}
                </button>
              );
            })}
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 pb-1">
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

              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-bold text-[#374b33] hover:underline cursor-pointer ms-1"
              >
                {isAr ? "مسح الكل" : "Clear all"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout: Products Grid / List */}
      <div className="ramillette-container px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 min-w-0 max-w-full">
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
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="collection"
                selectedSize={selectedSize}
                isArabic={isAr}
                layout="grid"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4 max-w-4xl mx-auto">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="collection"
                selectedSize={selectedSize}
                isArabic={isAr}
                layout="list"
              />
            ))}
          </div>
        )}
      </div>

      {/* Slideout Filter Drawer (available on mobile & desktop) */}
      {mounted &&
        filterDrawerOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setFilterDrawerOpen(false)}
            />
            <div
              className={`fixed inset-y-0 ${
                isAr ? "left-0" : "right-0"
              } max-w-sm w-full bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in duration-200`}
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
                  <h3 className="font-extrabold text-base text-neutral-900 uppercase">
                    {isAr ? "تصفية المنتجات" : "Filters"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setFilterDrawerOpen(false)}
                    className="p-1 text-neutral-500 hover:text-neutral-900 cursor-pointer"
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
                        onClick={() => setFilterDrawerOpen(false)}
                        className={`block py-2 px-2 rounded-md ${
                          category.slug === cat.slug
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
                      className={`w-full text-start py-2 px-2 rounded-md cursor-pointer ${
                        selectedStock === "in-stock"
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
                      className={`w-full text-start py-2 px-2 rounded-md cursor-pointer ${
                        selectedStock === "out-of-stock"
                          ? "bg-[#eef3ec] text-[#2c3d28] font-bold"
                          : "text-neutral-700"
                      }`}
                    >
                      {isAr ? "نفذت الكمية" : "Out of stock"} ({stockCounts.outOfStock})
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
                        QAR{" "}
                        {minPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="bg-[#eef3ec] text-[#2c3d28] font-bold text-xs rounded-md px-2 py-1">
                        QAR{" "}
                        {maxPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {/* Two-way Dual Range Slider */}
                    <div className="relative w-full h-8 flex items-center dual-range-slider select-none">
                      <div className="absolute w-full h-1 bg-[#dcdcdc] rounded-full" />
                      <div
                        className="absolute h-1 bg-[#4e6648] rounded-full pointer-events-none"
                        style={{
                          left: `${(minPrice / sliderMax) * 100}%`,
                          width: `${Math.max(
                            0,
                            ((maxPrice - minPrice) / sliderMax) * 100
                          )}%`,
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={sliderMax}
                        step={1}
                        value={minPrice}
                        onChange={(e) =>
                          handleMinSliderChange(Number(e.target.value))
                        }
                        className={`z-20 ${
                          minPrice > sliderMax * 0.9 ? "z-30" : ""
                        }`}
                        aria-label={isAr ? "الحد الأدنى للسعر" : "Minimum price"}
                      />
                      <input
                        type="range"
                        min={0}
                        max={sliderMax}
                        step={1}
                        value={maxPrice}
                        onChange={(e) =>
                          handleMaxSliderChange(Number(e.target.value))
                        }
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
                        setFilterDrawerOpen(false);
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
                  onClick={() => setFilterDrawerOpen(false)}
                  className="w-full py-2.5 bg-[#233324] text-white font-bold text-xs rounded-md shadow-xs cursor-pointer"
                >
                  {isAr ? "عرض النتائج" : "Show Results"} ({filteredProducts.length})
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="w-full py-2 border border-neutral-300 text-neutral-600 font-bold text-xs rounded-md cursor-pointer"
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
