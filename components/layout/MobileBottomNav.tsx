"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useLanguageStore } from "@/lib/store/useLanguageStore";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { getTotalItems, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAr = Boolean(pathname?.startsWith("/ar") || language === "ar");
  const cartCount = mounted ? getTotalItems() : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  const homeHref = isAr ? "/ar" : "/";
  const wishlistHref = isAr ? "/ar/wishlist" : "/wishlist";
  const shopHref = isAr ? "/ar/shop" : "/shop";
  const accountHref = user
    ? isAr
      ? "/ar/account"
      : "/account"
    : isAr
    ? "/ar/account/login"
    : "/account/login";

  const isHome = pathname === "/" || pathname === "/ar";
  const isWishlist = pathname === "/wishlist" || pathname === "/ar/wishlist";
  const isShop =
    pathname.startsWith("/shop") ||
    pathname.startsWith("/ar/shop") ||
    pathname.startsWith("/collections") ||
    pathname.startsWith("/ar/collections");
  const isAccount =
    pathname.startsWith("/account") || pathname.startsWith("/ar/account");

  const labels = isAr
    ? {
        home: "الرئيسية",
        wishlist: "المفضلة",
        shop: "المتجر",
        cart: "السلة",
        account: "حسابي",
      }
    : {
        home: "Home",
        wishlist: "Wishlist",
        shop: "Shop",
        cart: "Cart",
        account: "Account",
      };

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200/90 shadow-[0_-3px_12px_rgba(0,0,0,0.06)] pb-[max(env(safe-area-inset-bottom),0px)] select-none"
    >
      <div className="flex items-center justify-around h-[62px] px-2 relative">
        {/* 1. Home */}
        <Link
          href={homeHref}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isHome ? "text-[#465947]" : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <Home
            size={22}
            className={`stroke-[1.8] ${
              isHome ? "stroke-[2.2] text-[#465947]" : ""
            }`}
          />
          <span
            className={`text-[11px] mt-0.5 ${
              isHome ? "font-bold text-[#465947]" : "font-medium"
            }`}
          >
            {labels.home}
          </span>
        </Link>

        {/* 2. Wishlist */}
        <Link
          href={wishlistHref}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
            isWishlist ? "text-[#465947]" : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <div className="relative">
            <Heart
              size={22}
              className={`stroke-[1.8] ${
                isWishlist ? "stroke-[2.2] text-[#465947]" : ""
              }`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#b6713e] text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center ring-2 ring-white">
                {wishlistCount}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] mt-0.5 ${
              isWishlist ? "font-bold text-[#465947]" : "font-medium"
            }`}
          >
            {labels.wishlist}
          </span>
        </Link>

        {/* 3. Shop - Elevated Center Button */}
        <Link
          href={shopHref}
          className="flex flex-col items-center justify-center flex-1 relative group -mt-5"
        >
          <div className="w-[48px] h-[48px] rounded-full bg-[#465947] text-white shadow-[0_4px_14px_rgba(70,89,71,0.45)] border-[3.5px] border-white flex items-center justify-center active:scale-95 transition-transform">
            <ShoppingBag size={21} className="stroke-[2.2] text-white" />
          </div>
          <span className="text-[11px] font-bold text-[#465947] mt-0.5">
            {labels.shop}
          </span>
        </Link>

        {/* 4. Cart */}
        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center justify-center flex-1 py-1 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer relative"
        >
          <div className="relative">
            <ShoppingCart size={22} className="stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#1c1c1c] text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium mt-0.5">
            {labels.cart}
          </span>
        </button>

        {/* 5. Account */}
        <Link
          href={accountHref}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isAccount ? "text-[#465947]" : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <User
            size={22}
            className={`stroke-[1.8] ${
              isAccount ? "stroke-[2.2] text-[#465947]" : ""
            }`}
          />
          <span
            className={`text-[11px] mt-0.5 ${
              isAccount ? "font-bold text-[#465947]" : "font-medium"
            }`}
          >
            {labels.account}
          </span>
        </Link>
      </div>
    </nav>
  );
}
