"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, Globe } from "lucide-react";
import { useLanguageStore } from "@/lib/store/useLanguageStore";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  const isArabicPath = pathname?.startsWith("/ar");
  const isAr = isArabicPath || (mounted && language === "ar");

  useEffect(() => {
    setMounted(true);
    if (isArabicPath && language !== "ar") {
      setLanguage("ar");
    } else if (!isArabicPath && language === "ar" && pathname === "/") {
      setLanguage("en");
    }
  }, [pathname, isArabicPath, language, setLanguage]);

  const handleLanguageSwitch = () => {
    if (isArabicPath) {
      setLanguage("en");
      const target = pathname.replace(/^\/ar(\/|$)/, "/") || "/";
      router.push(target);
    } else {
      setLanguage("ar");
      const target = pathname === "/" ? "/ar" : `/ar${pathname}`;
      router.push(target);
    }
  };

  const content = isAr
    ? {
        location: "سوق الوكرة، قطر",
        shippingNotice:
          "توصيل سريع مجاني خلال ساعتين في الدوحة للطلبات التي تزيد عن 900 ر.ق",
        languageToggle: "English",
      }
    : {
        location: "Souq Al Wakra, Qatar",
        shippingNotice:
          "Free 2-Hour Express Delivery across Doha on orders over QAR 900",
        languageToggle: "العربية",
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

        {/* Language Switcher & Instagram Link */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLanguageSwitch}
            className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer text-[12px] font-medium"
            aria-label="Toggle language"
          >
            <span>{content.languageToggle}</span>
            <Globe size={13} className="text-[#faedcd] flex-shrink-0" />
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
