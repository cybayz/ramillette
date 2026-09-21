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
  const { getTotalItems, openCart, isOpen: isCartOpen } = useCartStore();
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
    pathname.startsWith("/ar/collections") ||
    pathname.startsWith("/product") ||
    pathname.startsWith("/ar/product") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/ar/products");
  const isCart =
    pathname === "/cart" ||
    pathname === "/ar/cart" ||
    (mounted && isCartOpen);
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
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-[0_-3px_14px_rgba(0,0,0,0.06)] pb-[max(env(safe-area-inset-bottom),0px)] select-none"
    >
      <div className="flex items-center justify-around h-[62px] px-1 relative w-full max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          href={homeHref}
          className="flex flex-col items-center justify-center flex-1 min-w-0 h-full py-1 relative group active:scale-95 transition-transform"
        >
          {isHome && (
            <span className="absolute top-0 w-8 h-[2.5px] bg-[#465947] rounded-b-full shadow-[0_1px_4px_rgba(70,89,71,0.35)] transition-all" />
          )}
          <div
            className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              isHome
                ? "bg-[#465947] text-white shadow-[0_2px_8px_rgba(70,89,71,0.3)]"
                : "text-neutral-400 group-hover:text-neutral-600 group-hover:bg-neutral-100/70"
            }`}
          >
            <Home
              size={18}
              className={`transition-all duration-200 ${
                isHome
                  ? "fill-white text-white stroke-white stroke-[1.5]"
                  : "stroke-[1.8] fill-none text-current"
              }`}
            />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full transition-colors duration-200 ${
              isHome ? "font-bold text-[#465947]" : "font-medium text-neutral-400"
            }`}
          >
            {labels.home}
          </span>
        </Link>

        {/* 2. Wishlist */}
        <Link
          href={wishlistHref}
          className="flex flex-col items-center justify-center flex-1 min-w-0 h-full py-1 relative group active:scale-95 transition-transform"
        >
          {isWishlist && (
            <span className="absolute top-0 w-8 h-[2.5px] bg-[#465947] rounded-b-full shadow-[0_1px_4px_rgba(70,89,71,0.35)] transition-all" />
          )}
          <div
            className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 relative ${
              isWishlist
                ? "bg-[#465947] text-white shadow-[0_2px_8px_rgba(70,89,71,0.3)]"
                : "text-neutral-400 group-hover:text-neutral-600 group-hover:bg-neutral-100/70"
            }`}
          >
            <Heart
              size={18}
              className={`transition-all duration-200 ${
                isWishlist
                  ? "fill-white text-white stroke-white stroke-[1.5]"
                  : "stroke-[1.8] fill-none text-current"
              }`}
            />
            {wishlistCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 text-[9px] font-bold h-3.5 min-w-[15px] px-1 rounded-full flex items-center justify-center shadow-xs transition-all ${
                  isWishlist
                    ? "bg-[#b6713e] text-white ring-2 ring-[#465947]"
                    : "bg-[#b6713e] text-white ring-2 ring-white"
                }`}
              >
                {wishlistCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full transition-colors duration-200 ${
              isWishlist ? "font-bold text-[#465947]" : "font-medium text-neutral-400"
            }`}
          >
            {labels.wishlist}
          </span>
        </Link>

        {/* 3. Shop - Elevated Center Button */}
        <Link
          href={shopHref}
          className="flex flex-col items-center justify-center flex-1 min-w-0 h-full relative group active:scale-95 transition-transform -mt-3"
        >
          <div
            className={`w-[44px] h-[44px] rounded-full border-[3px] border-white flex items-center justify-center transition-all duration-200 ${
              isShop
                ? "bg-[#465947] text-white shadow-[0_4px_14px_rgba(70,89,71,0.45)] ring-2 ring-[#465947]/40 scale-105"
                : "bg-neutral-100 text-neutral-400 shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover:bg-neutral-200 group-hover:text-neutral-700"
            }`}
          >
            <ShoppingBag
              size={20}
              className={`transition-all duration-200 ${
                isShop
                  ? "stroke-[2.2] stroke-white fill-white/20 text-white"
                  : "stroke-[1.8] stroke-neutral-400 fill-none text-neutral-400"
              }`}
            />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full transition-colors duration-200 ${
              isShop ? "font-bold text-[#465947]" : "font-medium text-neutral-400"
            }`}
          >
            {labels.shop}
          </span>
        </Link>

        {/* 4. Cart */}
        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center justify-center flex-1 min-w-0 h-full py-1 relative group active:scale-95 transition-transform cursor-pointer"
        >
          {isCart && (
            <span className="absolute top-0 w-8 h-[2.5px] bg-[#465947] rounded-b-full shadow-[0_1px_4px_rgba(70,89,71,0.35)] transition-all" />
          )}
          <div
            className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 relative ${
              isCart
                ? "bg-[#465947] text-white shadow-[0_2px_8px_rgba(70,89,71,0.3)]"
                : "text-neutral-400 group-hover:text-neutral-600 group-hover:bg-neutral-100/70"
            }`}
          >
            <ShoppingCart
              size={18}
              className={`transition-all duration-200 ${
                isCart
                  ? "stroke-[2.2] stroke-white text-white fill-none"
                  : "stroke-[1.8] stroke-neutral-400 fill-none text-neutral-400"
              }`}
            />
            {cartCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 text-[9px] font-bold h-3.5 min-w-[15px] px-1 rounded-full flex items-center justify-center shadow-xs transition-all ${
                  isCart
                    ? "bg-[#b6713e] text-white ring-2 ring-[#465947]"
                    : "bg-[#1c1c1c] text-white ring-2 ring-white"
                }`}
              >
                {cartCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full transition-colors duration-200 ${
              isCart ? "font-bold text-[#465947]" : "font-medium text-neutral-400"
            }`}
          >
            {labels.cart}
          </span>
        </button>

        {/* 5. Account */}
        <Link
          href={accountHref}
          className="flex flex-col items-center justify-center flex-1 min-w-0 h-full py-1 relative group active:scale-95 transition-transform"
        >
          {isAccount && (
            <span className="absolute top-0 w-8 h-[2.5px] bg-[#465947] rounded-b-full shadow-[0_1px_4px_rgba(70,89,71,0.35)] transition-all" />
          )}
          <div
            className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              isAccount
                ? "bg-[#465947] text-white shadow-[0_2px_8px_rgba(70,89,71,0.3)]"
                : "text-neutral-400 group-hover:text-neutral-600 group-hover:bg-neutral-100/70"
            }`}
          >
            <User
              size={18}
              className={`transition-all duration-200 ${
                isAccount
                  ? "fill-white text-white stroke-white stroke-[1.5]"
                  : "stroke-[1.8] fill-none text-current"
              }`}
            />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full transition-colors duration-200 ${
              isAccount ? "font-bold text-[#465947]" : "font-medium text-neutral-400"
            }`}
          >
            {labels.account}
          </span>
        </Link>
      </div>
    </nav>
  );
}
