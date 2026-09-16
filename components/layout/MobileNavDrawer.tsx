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
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

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

  const cartCount = getTotalItems();
  const wishlistCount = wishlistItems.length;
  const isArabicPath = pathname?.startsWith("/ar");
  const isAr = isArabicPath;
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

  const prefix = isAr ? "/ar" : "";
  const collectionsPrefix = isAr ? "/ar/collections" : "/collections";

  const navLinks = [
    { label: content.header.home, href: isAr ? "/ar" : "/", icon: Home },
    { label: content.header.ownBrand, href: `${collectionsPrefix}/own-brand`, icon: Crown, highlight: true },
    { label: content.header.inspired, href: `${collectionsPrefix}/inspired`, icon: Sparkles },
    { label: isAr ? "عطور فاخرة" : "Luxury Perfumes", href: `${collectionsPrefix}/luxury-perfumes`, icon: Crown },
    { label: isAr ? "الأكثر مبيعاً" : "Best Sellers", href: `${collectionsPrefix}/best-sellers`, icon: Flame },
    { label: isAr ? "وصل حديثاً" : "New Arrivals", href: `${collectionsPrefix}/new-arrivals`, icon: Sparkles },
    { label: content.header.contact, href: `${prefix}/pages/contact`, icon: Phone },
    { label: isAr ? "الأسئلة الشائعة" : "FAQ & Help", href: `${prefix}/pages/faqs`, icon: HelpCircle },
  ];

  const policyLinks = [
    { label: isAr ? "سياسة الإلغاء" : "Cancellation Policy", href: `${prefix}/pages/cancellation-policy` },
    { label: isAr ? "سياسة الإرجاع" : "Returns Policy", href: `${prefix}/pages/returns-policy` },
    { label: isAr ? "سياسة الاسترداد" : "Refund Policy", href: `${prefix}/pages/refund-policy` },
    { label: isAr ? "سياسة الاستبدال" : "Exchange Policy", href: `${prefix}/pages/exchange-policy` },
    { label: isAr ? "الشروط والأحكام" : "Terms of Service", href: `${prefix}/pages/term-and-services` },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position={language === "ar" ? "right" : "left"}
      maxWidth="max-w-xs"
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
          {/* Quick Language Toggle & Account / Wishlist / Cart Bar */}
          <div className="flex items-center justify-between px-2 py-2 mb-3 bg-[#fbf9f5] rounded-md border border-[#ecdec1]">
            <span className="text-xs text-neutral-600 font-medium">Language / اللغة</span>
            <button
              type="button"
              onClick={handleLanguageSwitch}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#b6713e] hover:text-[#8c4c1d]"
            >
              <Globe size={14} />
              <span>{content.topBar.languageToggle}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 py-3 mb-4 border-b border-[#e5e5e5] text-center">
            <Link
              href={user ? (isAr ? "/ar/account" : "/account") : (isAr ? "/ar/account/login" : "/account/login")}
              onClick={onClose}
              className="flex flex-col items-center py-2 px-1 rounded-md hover:bg-[#fbf9f5] text-[#1c1c1c] text-xs font-medium"
            >
              <User size={18} className="text-[#b6713e] mb-1" />
              <span>
                {user
                  ? (user.firstName ? (isAr ? user.firstName : `Hi, ${user.firstName}`) : (isAr ? "حسابي" : "My Account"))
                  : (isAr ? "تسجيل / دخول" : "Sign In")}
              </span>
            </Link>

            <Link
              href={isAr ? "/ar/wishlist" : "/wishlist"}
              scroll={true}
              onClick={onClose}
              className="relative flex flex-col items-center py-2 px-1 rounded-md hover:bg-[#fbf9f5] text-[#1c1c1c] text-xs font-medium"
            >
              <Heart size={18} className="text-[#b6713e] mb-1" />
              <span>{isAr ? "المفضلة" : "Wishlist"}</span>
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-3 bg-[#b6713e] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => {
                onClose();
                openCart();
              }}
              className="relative flex flex-col items-center py-2 px-1 rounded-md hover:bg-[#fbf9f5] text-[#1c1c1c] text-xs font-medium cursor-pointer"
            >
              <ShoppingBag size={18} className="text-[#b6713e] mb-1" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-3 bg-[#1c1c1c] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
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
