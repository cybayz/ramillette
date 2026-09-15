"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ProductCard, CardProduct } from "@/components/product/ProductCard";
import { SlidersHorizontal, ChevronDown, X, RotateCcw } from "lucide-react";

interface CategoryInfo {
  name: string;
  slug: string;
  description?: string | null;
}

interface ShopListingProps {
  category: CategoryInfo;
  products: CardProduct[];
  allCategories: CategoryInfo[];
}

export function ShopListing({
  category,
  products,
  allCategories,
}: ShopListingProps) {
  const [sortOption, setSortOption] = useState<string>("featured");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Price filter ranges
  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under QAR 50", value: "under-50", max: 50 },
    { label: "QAR 50 – QAR 80", value: "50-80", min: 50, max: 80 },
    { label: "QAR 80 – QAR 120", value: "80-120", min: 80, max: 120 },
    { label: "QAR 120 and above", value: "above-120", min: 120 },
  ];

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Price Filter
        if (selectedPriceRange !== "all") {
          const range = priceRanges.find((r) => r.value === selectedPriceRange);
          if (range) {
            if (range.min !== undefined && p.basePrice < range.min) return false;
            if (range.max !== undefined && p.basePrice > range.max) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "price-low") return a.basePrice - b.basePrice;
        if (sortOption === "price-high") return b.basePrice - a.basePrice;
        if (sortOption === "name-asc") return a.name.localeCompare(b.name);
        if (sortOption === "bestseller")
          return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
        return 0; // Default: featured
      });
  }, [products, selectedPriceRange, inStockOnly, sortOption]);

  const activeFilterCount = (selectedPriceRange !== "all" ? 1 : 0) + (inStockOnly ? 1 : 0);

  const resetFilters = () => {
    setSelectedPriceRange("all");
    setInStockOnly(false);
  };

  return (
    <div className="bg-[#ffffff] min-h-screen py-8">
      <div className="ramillette-container">
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#b6713e]">
            Shop
          </Link>
          {category.slug !== "all" && (
            <>
              <span>/</span>
              <span className="text-[#1c1c1c] font-semibold">{category.name}</span>
            </>
          )}
        </nav>

        {/* Collection Header Banner */}
        <div className="mb-10 p-6 sm:p-10 rounded-[8px] bg-gradient-to-r from-[#fbf9f5] via-[#faedcd]/30 to-[#fbf9f5] border border-[#ecdec1]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b6713e] block mb-1">
            Ramillette Perfumes Collection
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1c1c1c] tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {/* Action Bar (Filter trigger & Sort) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#e5e5e5]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden btn-secondary h-10 px-4 text-xs font-semibold flex items-center gap-2"
            >
              <SlidersHorizontal size={15} />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>

            <span className="text-xs text-neutral-500">
              Showing <strong className="text-[#1c1c1c]">{filteredProducts.length}</strong> fragrances
            </span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs text-neutral-500 font-medium">Sort by:</span>
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none bg-white border border-[#e5e5e5] rounded-[5px] pl-3 pr-8 py-2 text-xs font-semibold text-[#1c1c1c] focus:outline-none focus:border-[#b6713e] cursor-pointer"
              >
                <option value="featured">Featured Collection</option>
                <option value="bestseller">Best Selling</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Main Grid Layout (Sidebar + Products) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 pr-4">
            {/* Category Navigation */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c] mb-4 pb-2 border-b border-[#e5e5e5]">
                Fragrance Categories
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/shop"
                    className={`block py-1 transition-colors ${
                      category.slug === "all"
                        ? "text-[#b6713e] font-bold"
                        : "text-neutral-600 hover:text-[#1c1c1c]"
                    }`}
                  >
                    All Products
                  </Link>
                </li>
                {allCategories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/shop/${c.slug}`}
                      className={`block py-1 transition-colors ${
                        category.slug === c.slug
                          ? "text-[#b6713e] font-bold"
                          : "text-neutral-600 hover:text-[#1c1c1c]"
                      }`}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c] mb-4 pb-2 border-b border-[#e5e5e5]">
                Price Range
              </h3>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <label
                    key={range.value}
                    className="flex items-center gap-2.5 text-xs text-neutral-600 hover:text-[#1c1c1c] cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="priceRange"
                      value={range.value}
                      checked={selectedPriceRange === range.value}
                      onChange={() => setSelectedPriceRange(range.value)}
                      className="text-[#b6713e] focus:ring-[#b6713e]"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Active Filters Reset */}
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="w-full btn-secondary h-9 text-xs flex items-center justify-center gap-2 text-neutral-600 hover:text-red-600"
              >
                <RotateCcw size={13} />
                <span>Reset All Filters</span>
              </button>
            )}
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-[#fbf9f5] rounded-[8px] border border-[#e5e5e5] p-8">
                <h3 className="text-lg font-semibold text-[#1c1c1c] mb-2">
                  No Fragrances Found
                </h3>
                <p className="text-xs text-neutral-500 mb-6 max-w-sm mx-auto">
                  We couldn't find any products matching your selected filter criteria. Try adjusting your filters.
                </p>
                <button onClick={resetFilters} className="btn-primary h-10 px-6 text-xs">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slideout Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e5] mb-6">
                <h3 className="font-bold text-sm text-[#1c1c1c] uppercase">
                  Filters & Categories
                </h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-neutral-500 hover:text-[#1c1c1c]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Categories */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  Categories
                </h4>
                <div className="space-y-1 text-xs">
                  <Link
                    href="/shop"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="block py-1 text-neutral-700 hover:text-[#b6713e]"
                  >
                    All Products
                  </Link>
                  {allCategories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/shop/${c.slug}`}
                      onClick={() => setMobileFiltersOpen(false)}
                      className="block py-1 text-neutral-700 hover:text-[#b6713e]"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Price */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  Price Filter
                </h4>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label
                      key={range.value}
                      className="flex items-center gap-2 text-xs text-neutral-600"
                    >
                      <input
                        type="radio"
                        name="mobilePriceRange"
                        value={range.value}
                        checked={selectedPriceRange === range.value}
                        onChange={() => setSelectedPriceRange(range.value)}
                        className="text-[#b6713e]"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e5e5e5] space-y-2">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="btn-primary w-full h-11 text-xs font-semibold"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="btn-secondary w-full h-9 text-xs text-neutral-500"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
