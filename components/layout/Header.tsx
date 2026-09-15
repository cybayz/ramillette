"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { SearchModal } from "./SearchModal";
import { MobileNavDrawer } from "./MobileNavDrawer";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  Sparkles,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { getTotalItems, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalCartItems = mounted ? getTotalItems() : 0;
  const totalWishlistItems = mounted ? wishlistItems.length : 0;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Own brand", href: "/shop/own-brand" },
    { label: "Inspired", href: "/shop/inspired" },
    { label: "Luxury Perfumes", href: "/shop/luxury-perfumes" },
    { label: "Best Sellers", href: "/shop/best-sellers" },
    { label: "New Arrivals", href: "/shop/new-arrivals" },
    { label: "Contact", href: "/pages/contact" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#e5e5e5]"
            : "bg-white border-b border-[#f0ece1]"
        }`}
      >
        <div className="ramillette-container">
          <div className="flex items-center justify-between h-20">
            {/* Left: Mobile Menu Trigger & Logo */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-2 text-[#1c1c1c] hover:text-[#b6713e] transition-colors cursor-pointer"
                aria-label="Open mobile menu"
              >
                <Menu size={24} />
              </button>

              <Link href="/" className="flex flex-col items-start group">
                <span className="font-extrabold text-2xl tracking-[0.18em] text-[#1c1c1c] uppercase font-heading group-hover:text-[#b6713e] transition-colors">
                  Ramillette
                </span>
                <span className="text-[9px] tracking-[0.25em] text-[#b6713e] uppercase font-semibold">
                  Perfumes • Qatar
                </span>
              </Link>
            </div>

            {/* Middle: Desktop Navigation Bar */}
            <nav className="hidden lg:flex items-center space-x-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[14px] font-medium transition-colors relative py-1 hover:text-[#b6713e] ${
                      isActive ? "text-[#b6713e] font-semibold" : "text-[#1c1c1c]"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#b6713e] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Header Actions (Search, Wishlist, Account, Cart) */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Search Trigger */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#1c1c1c] hover:text-[#b6713e] transition-colors cursor-pointer"
                aria-label="Search fragrances"
              >
                <Search size={20} />
              </button>

              {/* Wishlist Link with Badge */}
              <Link
                href="/wishlist"
                className="relative p-2 text-[#1c1c1c] hover:text-[#b6713e] transition-colors hidden sm:flex items-center"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {totalWishlistItems > 0 && (
                  <span className="absolute top-1 right-0 bg-[#b6713e] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {totalWishlistItems}
                  </span>
                )}
              </Link>

              {/* Customer Account */}
              <Link
                href="/account"
                className="p-2 text-[#1c1c1c] hover:text-[#b6713e] transition-colors hidden sm:flex items-center"
                aria-label="Account"
              >
                <User size={20} />
              </Link>

              {/* Shopping Cart Trigger with Total Count Badge */}
              <button
                type="button"
                onClick={openCart}
                className="relative flex items-center gap-2 btn-primary h-10 px-3.5 rounded-[5px] text-xs font-semibold cursor-pointer"
                aria-label="View shopping bag"
              >
                <ShoppingBag size={17} />
                <span className="hidden sm:inline">My Cart</span>
                <span className="bg-[#1c1c1c] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {totalCartItems}
                </span>
              </button>
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
