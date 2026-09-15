"use client";

import React, { useState } from "react";
import { MapPin, Globe, Sparkles } from "lucide-react";

export function TopBar() {
  const [lang, setLang] = useState<"en" | "ar">("en");

  return (
    <div className="bg-[#1c1c1c] text-[#fbf9f5] text-xs py-2 border-b border-[#2d2d2d]">
      <div className="ramillette-container flex items-center justify-between">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-neutral-300">
          <MapPin size={13} className="text-[#faedcd]" />
          <span className="font-medium">Souq Al Wakra, Qatar</span>
        </div>

        {/* Center Promotion Announcement */}
        <div className="hidden md:flex items-center gap-2 text-center text-xs font-medium">
          <Sparkles size={13} className="text-[#faedcd]" />
          <span>
            Free 2-Hour Express Delivery across Doha on orders over{" "}
            <strong className="text-[#faedcd]">QAR 900</strong>
          </span>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="flex items-center gap-1 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <Globe size={13} className="text-[#faedcd]" />
            <span className="font-medium">
              {lang === "en" ? "العربية" : "English"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
