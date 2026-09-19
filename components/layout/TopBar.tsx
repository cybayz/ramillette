"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, Globe } from "lucide-react";
import { useLanguageStore } from "@/lib/store/useLanguageStore";
import { useCountryStore } from "@/lib/store/useCountryStore";
import { CountrySwitcher } from "@/components/layout/CountrySwitcher";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguageStore();
  const { config } = useCountryStore();
  const [mounted, setMounted] = useState(false);

  const isArabicPath = pathname?.startsWith("/ar");
  const isAr = isArabicPath;

  useEffect(() => {
    setMounted(true);
    if (isArabicPath) {
      if (language !== "ar") {
        setLanguage("ar");
      }
    } else {
      if (language !== "en") {
        setLanguage("en");
      }
    }
  }, [isArabicPath]);

  const handleLanguageSwitch = () => {
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

  const locationVal = isAr
    ? config.boutiqueLocationAr || config.boutiqueLocation
    : config.boutiqueLocation || config.boutiqueLocationAr || "Souq Al Wakra, Qatar";

  const shippingNoticeVal = isAr
    ? config.deliveryNoticeAr || config.deliveryNotice
    : config.deliveryNotice || config.deliveryNoticeAr || "Free 2-Hour Express Delivery on orders over threshold";

  const content = {
    location: locationVal,
    shippingNotice: shippingNoticeVal,
    languageToggle: isAr ? "English" : "العربية",
  };

  return (
    <div className="bg-[#0c0c0c] text-[#fbf9f5] text-xs py-2.5 border-b border-[#222222] transition-colors">
      <div className="ramillette-container flex items-center justify-between">
        {/* Boutique Location */}
        <div className="flex items-center gap-1.5 text-neutral-300">
          <MapPin size={13} className="text-[#faedcd] flex-shrink-0" />
          <span className="font-medium text-[12px]">{content.location}</span>
        </div>

        {/* Express Delivery Callout */}
        <div className="hidden md:flex items-center gap-2 text-center text-[12px] font-normal text-neutral-200">
          <span>{content.shippingNotice}</span>
        </div>

        {/* Country Switcher, Language Switcher & Instagram Link */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Country Selector Dropdown */}
          <CountrySwitcher />

          {/* Language Toggle */}
          <button
            type="button"
            onClick={handleLanguageSwitch}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:text-white hover:border-neutral-500 transition-all cursor-pointer text-[12px] font-medium"
            aria-label="Toggle language"
          >
            <Globe size={13} className="text-white flex-shrink-0" />
            <span>{content.languageToggle}</span>
          </button>

          <a
            href="https://www.instagram.com/ramillette_perfumes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white transition-colors"
            aria-label="Ramillette Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
