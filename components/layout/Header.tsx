"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useLanguageStore } from "@/lib/store/useLanguageStore";
import { SearchModal } from "./SearchModal";
import { MobileNavDrawer } from "./MobileNavDrawer";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  LogOut,
} from "lucide-react";
import { translations } from "@/lib/i18n";
import { useAuthStore } from "@/lib/store/useAuthStore";

export function Header() {
  const pathname = usePathname();
  const { getTotalItems, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user, checkAuth, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAr = Boolean(pathname?.startsWith("/ar"));
  const totalCartItems = mounted ? getTotalItems() : 0;
  const totalWishlistItems = mounted ? wishlistItems.length : 0;
  const content = isAr ? translations.ar.header : translations.en.header;

  const homeHref = isAr ? "/ar" : "/";
  const ownBrandHref = isAr ? "/ar/collections/own-brand" : "/collections/own-brand";
  const inspiredHref = isAr ? "/ar/collections/inspired" : "/collections/inspired";
  const contactHref = isAr ? "/ar/pages/contact" : "/pages/contact";
  const wishlistHref = isAr ? "/ar/wishlist" : "/wishlist";
  const accountHref = isAr ? "/ar/account" : "/account";

  const navLinks = [
    { label: content.home, href: homeHref },
    { label: content.ownBrand, href: ownBrandHref },
    { label: content.inspired, href: inspiredHref },
    { label: content.contact, href: contactHref },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 bg-white ${
          isScrolled
            ? "shadow-sm border-b border-[#e5e5e5]"
            : "border-b border-[#efefef]"
        }`}
      >
        <div className="ramillette-container">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Left: Mobile Menu & Desktop Search Pill */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-2 text-[#1c1c1c] hover:text-[#b6713e] transition-colors cursor-pointer"
                aria-label="Open mobile menu"
              >
                <Menu size={24} />
              </button>

              {/* Desktop Rounded Search Pill */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex items-center gap-2.5 px-4 py-2 border border-[#d1d5db] rounded-full text-sm text-[#737373] bg-[#fafafa] hover:bg-white hover:border-[#1c1c1c] transition-all cursor-pointer w-52 xl:w-64 text-left group shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                aria-label="Search products"
              >
                <Search size={16} className="text-[#9ca3af] group-hover:text-[#1c1c1c] transition-colors flex-shrink-0" />
                <span className="truncate text-[13px]">{content.searchPlaceholder}</span>
              </button>

              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2 text-[#1c1c1c] hover:text-[#b6713e] transition-colors cursor-pointer"
                aria-label="Search fragrances"
              >
                <Search size={20} />
              </button>
            </div>

            {/* Center: Official Ramillette Script Logo Image */}
            <div className="flex items-center justify-center flex-1 lg:flex-initial">
              <Link href={homeHref} className="inline-block relative py-1" aria-label="Ramillette Home">
                <Image
                  src="/ramillette-logo-black.svg"
                  alt="Ramillette"
                  width={160}
                  height={43}
                  className="h-10 md:h-11 w-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
                  priority
                />
              </Link>
            </div>

            {/* Right: Nav Links + Vertical Icon Action Stack */}
            <div className="flex items-center gap-6 xl:gap-8">
              {/* Main Desktop Navigation */}
              <nav className="hidden xl:flex items-center space-x-6 rtl:space-x-reverse">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-[14px] font-medium transition-colors hover:text-[#b6713e] relative py-1 ${
                        isActive ? "text-[#1c1c1c] font-semibold" : "text-[#333333]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Action Icons Stack (Wishlist, My Cart, Register/Login) */}
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Wishlist with Vertical Label */}
                <Link
                  href={wishlistHref}
                  scroll={true}
                  className="hidden sm:flex flex-col items-center justify-center text-[#1c1c1c] hover:text-[#b6713e] transition-colors group relative cursor-pointer"
                  aria-label="Wishlist"
                >
                  <div className="relative">
                    <Heart size={20} className="stroke-[1.6] group-hover:scale-110 transition-transform" />
                    {totalWishlistItems > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#b6713e] text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                        {totalWishlistItems}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-[#444444] mt-1 group-hover:text-[#b6713e]">
                    {content.wishlist}
                  </span>
                </Link>

                {/* My Cart with Vertical Label & Badge */}
                <button
                  type="button"
                  onClick={openCart}
                  className="flex flex-col items-center justify-center text-[#1c1c1c] hover:text-[#b6713e] transition-colors group relative cursor-pointer"
                  aria-label="My Cart"
                >
                  <div className="relative">
                    <ShoppingBag size={20} className="stroke-[1.6] group-hover:scale-110 transition-transform" />
                    {totalCartItems > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#1c1c1c] text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                        {totalCartItems}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-[#444444] mt-1 group-hover:text-[#b6713e]">
                    {content.myCart}
                  </span>
                </button>

                {/* Account / Login Action */}
                {mounted && user ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsAccountDropdownOpen(true)}
                    onMouseLeave={() => setIsAccountDropdownOpen(false)}
                  >
                    <Link
                      href={accountHref}
                      className="flex flex-col items-center justify-center text-[#1c1c1c] hover:text-[#b6713e] transition-colors group relative cursor-pointer"
                      aria-label="My Account"
                    >
                      <div className="relative">
                        <User size={20} className="stroke-[1.6] text-[#b6713e] group-hover:scale-110 transition-transform" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#b6713e] mt-1 whitespace-nowrap">
                        {user.firstName ? (isAr ? user.firstName : `Hi, ${user.firstName}`) : content.account}
                      </span>
                    </Link>

                    {/* Dropdown Menu */}
                    {isAccountDropdownOpen && (
                      <div
                        className={`absolute top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-[#e5e5e5] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
                          isAr ? "left-0" : "right-0"
                        }`}
                      >
                        <div className="px-3.5 py-2 border-b border-[#f0f0f0]">
                          <p className="text-xs font-bold text-[#1c1c1c] truncate">
                            {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.email}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                        </div>
                        <Link
                          href={accountHref}
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-xs text-neutral-700 hover:bg-[#fbf9f5] hover:text-[#b6713e] transition-colors"
                        >
                          <User size={13} />
                          <span>{content.account}</span>
                        </Link>
                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setIsAccountDropdownOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#b6713e] font-semibold hover:bg-[#fbf9f5] transition-colors"
                          >
                            <span>Admin Portal</span>
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountDropdownOpen(false);
                            logout(isAr ? "ar" : "en");
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left rtl:text-right border-t border-[#f0f0f0]"
                        >
                          <LogOut size={13} />
                          <span>{content.logout}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={isAr ? "/ar/account/login" : "/account/login"}
                    className="flex flex-col items-center justify-center text-[#1c1c1c] hover:text-[#b6713e] transition-colors group relative cursor-pointer"
                    aria-label="Register or Login"
                  >
                    <User size={20} className="stroke-[1.6] group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-medium text-[#444444] mt-1 group-hover:text-[#b6713e] whitespace-nowrap">
                      {content.registerLogin}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </>
  );
}
