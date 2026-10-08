"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlistStore, WishlistItem } from "@/lib/store/useWishlistStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { useLanguageStore } from "@/lib/store/useLanguageStore";
import { getProductTitle } from "@/lib/i18n";
import { Heart, X, ShoppingBag } from "lucide-react";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const { language, t } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Instantly scroll to top when page mounts
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setMounted(true);
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 20);
    return () => clearTimeout(timer);
  }, []);

  const isArabic = language === "ar";
  const tWishlist = mounted
    ? t().wishlistPage
    : {
        breadcrumbHome: "Home",
        breadcrumbWishlist: "Wishlist",
        title: "My Wishlist",
        emptyTitle: "Your Wishlist is Empty",
        emptySubtitle: "Save your favorite artisanal perfumes and inspired fragrances so you can easily find them later.",
        exploreBestSellers: "Explore Best Sellers",
        clearAll: "Clear All",
        moveToCart: "Move to Cart",
        viewProduct: "View Product",
        currency: "QAR",
      };

  const handleMoveToCart = (item: WishlistItem) => {
    addItem({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    removeItem(item.productId);
    openCart();
  };

  // While mounting on client, render the complete container shell to prevent 0-height scroll jumps
  if (!mounted) {
    return (
      <div className="bg-[#ffffff] min-h-[75vh] py-8 sm:py-10">
        <div className="ramillette-container">
          {/* Breadcrumb */}
          <nav className="text-[13px] text-neutral-500 mb-5 flex items-center gap-1.5">
            <span>{tWishlist.breadcrumbHome}</span>
            <span>›</span>
            <span className="text-[#1c1c1c] font-semibold">{tWishlist.breadcrumbWishlist}</span>
          </nav>

          <div className="pb-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1c1c1c] tracking-tight">
              {tWishlist.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            <div className="h-[380px] bg-neutral-50 rounded-[14px] border border-[#e5e5e5] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Empty wishlist state
  if (items.length === 0) {
    return (
      <div className="bg-[#ffffff] min-h-[75vh] flex items-center justify-center py-16">
        <div className="ramillette-container text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-[#fbf9f5] border border-[#e5e5e5] flex items-center justify-center text-neutral-400 mx-auto mb-5">
            <Heart size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1c1c1c] mb-2.5 tracking-tight">
            {tWishlist.emptyTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mb-8 leading-relaxed">
            {tWishlist.emptySubtitle}
          </p>
          <Link
            href={isArabic ? "/ar" : "/shop/best-sellers"}
            className="inline-block py-2.5 px-8 rounded-[6px] border border-neutral-800 bg-white text-[#1c1c1c] text-[13.5px] font-semibold transition-all duration-200 hover:bg-[#4e6648] hover:border-[#4e6648] hover:text-white"
          >
            {tWishlist.exploreBestSellers}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ffffff] min-h-[75vh] py-8 sm:py-10">
      <div className="ramillette-container">
        {/* Breadcrumb */}
        <nav className="text-[13px] text-neutral-500 mb-5 flex items-center gap-1.5">
          <Link
            href={isArabic ? "/ar" : "/"}
            className="hover:text-[#4e6648] transition-colors"
          >
            {tWishlist.breadcrumbHome}
          </Link>
          <span>›</span>
          <span className="text-[#1c1c1c] font-semibold">
            {tWishlist.breadcrumbWishlist}
          </span>
        </nav>

        {/* Header with Title & Clear All */}
        <div className="flex items-center justify-between pb-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1c1c1c] tracking-tight">
              {tWishlist.title}
            </h1>
          </div>

          <button
            onClick={clearWishlist}
            className="text-xs text-neutral-500 hover:text-red-600 underline font-medium cursor-pointer"
          >
            {tWishlist.clearAll}
          </button>
        </div>

        {/* Wishlist Grid: 2 columns on mobile (4 tiles fit on screen), 6-8 columns on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-8 gap-2.5 sm:gap-3.5 md:gap-4">
          {items.map((item) => {
            const productName = getProductTitle(item.name, item.slug, language);

            return (
              <div
                key={item.productId}
                className="group relative flex flex-col bg-white rounded-[10px] sm:rounded-[12px] border border-[#e5e5e5] p-2.5 sm:p-3 transition-all duration-200 shadow-none hover:shadow-xs hover:border-[#b6713e]/40"
              >
                {/* Product Image Area */}
                <div className="relative w-full aspect-square bg-[#fbf9f5] rounded-[8px] overflow-hidden mb-2">
                  {/* Floating Remove Button × at Top Right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeItem(item.productId);
                    }}
                    className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/95 border border-neutral-200 shadow-2xs flex items-center justify-center text-neutral-500 hover:text-red-600 hover:scale-105 transition-all cursor-pointer"
                    aria-label="Remove item"
                  >
                    <X size={12} strokeWidth={2.2} />
                  </button>

                  <Link
                    href={`/product/${item.slug}`}
                    className="block w-full h-full relative cursor-pointer"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={productName}
                        fill
                        className="object-contain p-1.5 sm:p-2 group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1536px) 16vw, 12vw"
                      />
                    ) : null}
                  </Link>
                </div>

                {/* Product Title */}
                <Link
                  href={`/product/${item.slug}`}
                  className="text-xs sm:text-[13px] font-bold text-[#1c1c1c] hover:text-[#b6713e] transition-colors line-clamp-1 mb-0.5 leading-tight"
                  title={productName}
                >
                  {productName}
                </Link>

                {/* Price Display */}
                <div className="text-xs sm:text-[13.5px] font-extrabold text-[#1c1c1c] mb-2">
                  {isArabic
                    ? `${Number(item.price).toFixed(2)} ر.ق`
                    : `QAR ${Number(item.price).toFixed(2)}`}
                </div>

                {/* Action Buttons: Move to Cart & View Product */}
                <div className="mt-auto flex flex-col gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(item)}
                    className="w-full py-1.5 sm:py-2 px-1.5 rounded-[5px] border border-neutral-900 bg-[#1c1c1c] text-white text-[11px] sm:text-xs font-semibold hover:bg-[#b6713e] hover:border-[#b6713e] transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <ShoppingBag size={12} className="shrink-0" />
                    <span className="truncate">{tWishlist.moveToCart}</span>
                  </button>

                  <Link
                    href={`/product/${item.slug}`}
                    className="w-full py-1 px-1 rounded-[4px] text-neutral-500 hover:text-[#1c1c1c] text-[10.5px] sm:text-[11px] font-medium text-center transition-colors block cursor-pointer"
                  >
                    {tWishlist.viewProduct}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
