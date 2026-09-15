"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlistStore, WishlistItem } from "@/lib/store/useWishlistStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { useLanguageStore } from "@/lib/store/useLanguageStore";
import { getProductTitle } from "@/lib/i18n";
import { Heart, X } from "lucide-react";

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

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {items.map((item) => {
            const productName = getProductTitle(item.name, item.slug, language);

            return (
              <div
                key={item.productId}
                className="group relative flex flex-col bg-white rounded-[14px] border border-[#e5e5e5] p-3.5 sm:p-4 transition-all duration-200 shadow-none hover:shadow-xs"
              >
                {/* Product Image Area */}
                <div className="relative w-full aspect-square bg-[#fbf9f5] rounded-[10px] overflow-hidden mb-3">
                  {/* Floating Remove Button × at Top Right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeItem(item.productId);
                    }}
                    className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/95 border border-neutral-200 shadow-xs flex items-center justify-center text-neutral-600 hover:text-black hover:scale-105 transition-all cursor-pointer"
                    aria-label="Remove item"
                  >
                    <X size={14} strokeWidth={2.2} />
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
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 280px"
                      />
                    ) : null}
                  </Link>
                </div>

                {/* Product Title */}
                <Link
                  href={`/product/${item.slug}`}
                  className="text-[14.5px] font-bold text-[#1c1c1c] hover:text-[#4e6648] transition-colors line-clamp-1 mb-1"
                >
                  {productName}
                </Link>

                {/* Price Display */}
                <div className="text-[15px] font-bold text-[#1c1c1c] mb-3.5">
                  {isArabic
                    ? `${Number(item.price).toFixed(2)} ر.ق`
                    : `QAR ${Number(item.price).toFixed(2)}`}
                </div>

                {/* Two Action Buttons: Move to Cart & View Product */}
                <div className="mt-auto flex flex-col gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(item)}
                    className="w-full py-2.5 px-4 rounded-[6px] border border-neutral-800 bg-white text-[#1c1c1c] text-[13px] sm:text-[13.5px] font-semibold transition-all duration-200 text-center hover:bg-[#4e6648] hover:border-[#4e6648] hover:text-white cursor-pointer"
                  >
                    {tWishlist.moveToCart}
                  </button>

                  <Link
                    href={`/product/${item.slug}`}
                    className="w-full py-2.5 px-4 rounded-[6px] border border-neutral-800 bg-white text-[#1c1c1c] text-[13px] sm:text-[13.5px] font-semibold transition-all duration-200 text-center hover:bg-[#4e6648] hover:border-[#4e6648] hover:text-white block cursor-pointer"
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
