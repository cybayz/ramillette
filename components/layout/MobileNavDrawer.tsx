"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useLanguageStore } from "@/lib/store/useLanguageStore";
import {
  Home,
  Sparkles,
  Flame,
  Crown,
  Heart,
  ShoppingBag,
  User,
  Phone,
  HelpCircle,
  MapPin,
  Globe,
  LogOut,
  Package,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useCountryStore } from "@/lib/store/useCountryStore";
import { CountrySwitcher } from "@/components/layout/CountrySwitcher";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const pathname = usePathname();
  const { getTotalItems, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { language, setLanguage, t } = useLanguageStore();
  const { user, logout } = useAuthStore();
  const { config } = useCountryStore();

  const cartCount = getTotalItems();
  const wishlistCount = wishlistItems.length;
  const isAr = Boolean(pathname?.startsWith("/ar"));
  const prefix = isAr ? "/ar" : "";
  const content = t();

  const handleLanguageSwitch = () => {
    onClose();
    if (isAr) {
      setLanguage("en");
      let target = pathname.replace(/^\/ar(\/|$)/, "/") || "/";
      if (!target.startsWith("/")) target = "/" + target;
      window.location.href = target;
    } else {
      setLanguage("ar");
      const target = pathname.startsWith("/ar")
        ? pathname
        : pathname === "/"
        ? "/ar"
        : `/ar${pathname}`;
      window.location.href = target;
    }
  };

  const navLinks = [
    { label: content.header.home, href: `${prefix}/`, icon: Home },
    { label: isAr ? "طلباتي" : "My Orders", href: user ? `${prefix}/account#orders` : `${prefix}/account/login?redirect=${prefix}/account`, icon: Package },
    { label: content.header.ownBrand, href: `${prefix}/collections/own-brand`, icon: Crown, highlight: true },
    { label: content.header.inspired, href: `${prefix}/collections/inspired`, icon: Sparkles },
    { label: content.header.bestSellers, href: `${prefix}/collections/best-sellers`, icon: Flame },
    { label: content.header.luxuryPerfumes, href: `${prefix}/collections/luxury-perfumes`, icon: Crown },
    { label: content.header.newArrivals, href: `${prefix}/collections/new-arrivals`, icon: Sparkles },
    { label: isAr ? "جميع العطور" : "All Perfumes", href: `${prefix}/shop`, icon: ShoppingBag },
  ];

  const policyLinks = [
    { label: isAr ? "نبذة عنا" : "About Us", href: `${prefix}/pages/about-us` },
    { label: isAr ? "اتصل بنا" : "Contact Us", href: `${prefix}/pages/contact` },
    { label: isAr ? "الأسئلة الشائعة" : "FAQs", href: `${prefix}/pages/faqs` },
    { label: isAr ? "سياسة الإلغاء" : "Cancellation Policy", href: `${prefix}/pages/cancellation-policy` },
    { label: isAr ? "سياسة الإرجاع" : "Return Policy", href: `${prefix}/pages/return-policy` },
    { label: isAr ? "سياسة الاسترداد" : "Refund Policy", href: `${prefix}/pages/refund-policy` },
    { label: isAr ? "سياسة الاستبدال" : "Exchange Policy", href: `${prefix}/pages/exchange-policy` },
    { label: isAr ? "الشروط والأحكام" : "Terms of Service", href: `${prefix}/pages/term-and-services` },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position={language === "ar" ? "right" : "left"}
      maxWidth="max-w-[340px] sm:max-w-sm"
      title={
        <div className="flex items-center gap-2">
          <Image
            src="/ramillette-logo-black.svg"
            alt="Ramillette"
            width={120}
            height={32}
            className="h-7 w-auto object-contain"
          />
        </div>
      }
    >
      <div className="flex flex-col h-full justify-between pb-6">
        <div>
          {/* Country Selection for Mobile */}
          <div className="mb-4">
            <CountrySwitcher variant="drawer" />
          </div>

          {/* Quick Language Toggle */}
          <div className="flex items-center justify-between px-3 py-2.5 mb-4 bg-[#fbf9f5] rounded-lg border border-[#ecdec1]">
            <div className="flex items-center gap-2">
              <Globe size={15} className="text-[#465947]" />
              <span className="text-xs text-neutral-700 font-medium">Language / اللغة</span>
            </div>
            <button
              type="button"
              onClick={handleLanguageSwitch}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#ecdec1] text-xs font-bold text-[#465947] hover:bg-[#465947] hover:text-white transition-colors cursor-pointer shadow-2xs"
            >
              <span>{content.topBar.languageToggle}</span>
            </button>
          </div>

          {/* Quick Action Grid: 4 items (Account, Orders, Wishlist, Cart) */}
          <div className="grid grid-cols-4 gap-1.5 py-3 mb-4 border-b border-[#e5e5e5] text-center">
            {/* 1. Account */}
            <Link
              href={user ? (isAr ? "/ar/account" : "/account") : (isAr ? "/ar/account/login" : "/account/login")}
              onClick={onClose}
              className="flex flex-col items-center py-2 px-1 rounded-lg hover:bg-[#fbf9f5] text-[#1c1c1c] text-[11px] font-medium transition-colors"
            >
              <User size={18} className="text-[#b6713e] mb-1" />
              <span className="truncate max-w-full">
                {user
                  ? (user.firstName ? (isAr ? user.firstName : user.firstName) : (isAr ? "حسابي" : "Account"))
                  : (isAr ? "دخول" : "Sign In")}
              </span>
            </Link>

            {/* 2. My Orders */}
            <Link
              href={user ? (isAr ? "/ar/account#orders" : "/account#orders") : (isAr ? "/ar/account/login?redirect=/ar/account" : "/account/login?redirect=/account")}
              onClick={onClose}
              className="flex flex-col items-center py-2 px-1 rounded-lg hover:bg-[#fbf9f5] text-[#1c1c1c] text-[11px] font-medium transition-colors"
            >
              <Package size={18} className="text-[#b6713e] mb-1" />
              <span className="truncate max-w-full">{isAr ? "طلباتي" : "Orders"}</span>
            </Link>

            {/* 3. Wishlist */}
            <Link
              href={isAr ? "/ar/wishlist" : "/wishlist"}
              scroll={true}
              onClick={onClose}
              className="relative flex flex-col items-center py-2 px-1 rounded-lg hover:bg-[#fbf9f5] text-[#1c1c1c] text-[11px] font-medium transition-colors"
            >
              <div className="relative">
                <Heart size={18} className="text-[#b6713e] mb-1" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#b6713e] text-white text-[9px] font-bold h-3.5 min-w-[14px] px-0.5 rounded-full flex items-center justify-center ring-2 ring-white">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="truncate max-w-full">{isAr ? "المفضلة" : "Wishlist"}</span>
            </Link>

            {/* 4. Cart */}
            <button
              type="button"
              onClick={() => {
                onClose();
                openCart();
              }}
              className="relative flex flex-col items-center py-2 px-1 rounded-lg hover:bg-[#fbf9f5] text-[#1c1c1c] text-[11px] font-medium cursor-pointer transition-colors"
            >
              <div className="relative">
                <ShoppingBag size={18} className="text-[#b6713e] mb-1" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#1c1c1c] text-white text-[9px] font-bold h-3.5 min-w-[14px] px-0.5 rounded-full flex items-center justify-center ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="truncate max-w-full">{isAr ? "السلة" : "Cart"}</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-[5px] text-sm font-medium transition-colors ${
                    link.highlight
                      ? "bg-[#faedcd]/40 text-[#b6713e] font-semibold border border-[#ecdec1]"
                      : "text-[#1c1c1c] hover:bg-[#fbf9f5] hover:text-[#b6713e]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{link.label}</span>
                  </div>
                  {link.highlight && (
                    <span className="text-[10px] bg-[#b6713e] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                      Exclusive
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Store Policies */}
          <div className="mt-6 pt-4 border-t border-[#e5e5e5]">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Store Information
            </p>
            <div className="space-y-1">
              {policyLinks.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  onClick={onClose}
                  className="block px-3 py-1.5 text-xs text-neutral-600 hover:text-[#b6713e] transition-colors"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>

          {user && (
            <div className="px-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout(isAr ? "ar" : "en");
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>{isAr ? "تسجيل الخروج" : "Sign Out"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info inside Drawer */}
        <div className="pt-4 border-t border-[#e5e5e5] px-3">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <MapPin size={14} className="text-[#b6713e]" />
            <span>Souq Al Wakra, Doha, Qatar</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
