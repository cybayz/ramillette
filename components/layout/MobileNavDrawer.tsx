"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const { getTotalItems, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { language, toggleLanguage, t } = useLanguageStore();

  const cartCount = getTotalItems();
  const wishlistCount = wishlistItems.length;
  const content = t();

  const navLinks = [
    { label: content.header.home, href: "/", icon: Home },
    { label: content.header.ownBrand, href: "/shop/own-brand", icon: Crown, highlight: true },
    { label: content.header.inspired, href: "/shop/inspired", icon: Sparkles },
    { label: "Luxury Perfumes", href: "/shop/luxury-perfumes", icon: Crown },
    { label: "Best Sellers", href: "/shop/best-sellers", icon: Flame },
    { label: "New Arrivals", href: "/shop/new-arrivals", icon: Sparkles },
    { label: content.header.contact, href: "/pages/contact", icon: Phone },
    { label: "FAQ & Help", href: "/pages/faqs", icon: HelpCircle },
  ];

  const policyLinks = [
    { label: "Cancellation Policy", href: "/pages/cancellation-policy" },
    { label: "Returns Policy", href: "/pages/returns-policy" },
    { label: "Refund Policy", href: "/pages/refund-policy" },
    { label: "Exchange Policy", href: "/pages/exchange-policy" },
    { label: "Terms of Service", href: "/pages/term-and-services" },
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
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#b6713e] hover:text-[#8c4c1d]"
            >
              <Globe size={14} />
              <span>{content.topBar.languageToggle}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 py-3 mb-4 border-b border-[#e5e5e5] text-center">
            <Link
              href="/account"
              onClick={onClose}
              className="flex flex-col items-center py-2 px-1 rounded-md hover:bg-[#fbf9f5] text-[#1c1c1c] text-xs font-medium"
            >
              <User size={18} className="text-[#b6713e] mb-1" />
              <span>Account</span>
            </Link>

            <Link
              href="/wishlist"
              onClick={onClose}
              className="relative flex flex-col items-center py-2 px-1 rounded-md hover:bg-[#fbf9f5] text-[#1c1c1c] text-xs font-medium"
            >
              <Heart size={18} className="text-[#b6713e] mb-1" />
              <span>Wishlist</span>
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
