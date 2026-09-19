"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useCountryStore } from "@/lib/store/useCountryStore";
import { COUNTRIES, CountryCode } from "@/lib/country/config";
import { useLanguageStore } from "@/lib/store/useLanguageStore";

interface CountrySwitcherProps {
  className?: string;
  variant?: "topbar" | "drawer" | "minimal";
}

export function CountrySwitcher({ className = "", variant = "topbar" }: CountrySwitcherProps) {
  const { country, setCountry, config, availableCountries } = useCountryStore();
  const { language } = useLanguageStore();
  const isAr = language === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const countryList = availableCountries && availableCountries.length > 0
    ? availableCountries
    : Object.values(COUNTRIES);

  const handleSelect = (code: string) => {
    setCountry(code);
    setIsOpen(false);
  };

  if (variant === "drawer") {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          {isAr ? "الدولة والعملة" : "Country & Currency"}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {countryList.map((item) => {
            const isSelected = country === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#b6713e]/15 border-[#b6713e] text-white shadow-sm"
                    : "bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                }`}
              >
                <span className="text-xl mb-1">{item.flag}</span>
                <span className="font-semibold text-[11px]">{item.currency}</span>
                <span className="text-[10px] text-neutral-400 truncate max-w-full">
                  {isAr ? item.nameAr || item.name : item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:text-white hover:border-neutral-500 transition-all cursor-pointer text-[12px] font-medium"
        aria-expanded={isOpen}
        aria-label="Select Country"
      >
        <span className="text-sm">{config?.flag || "🇶🇦"}</span>
        <span className="font-bold text-xs">{config?.currency || "QAR"}</span>
        <ChevronDown
          size={12}
          className={`text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            isAr ? "left-0" : "right-0"
          } mt-2 w-56 bg-[#1c1c1c] border border-neutral-700 rounded-lg shadow-2xl z-50 overflow-hidden py-1.5 backdrop-blur-md animate-in fade-in duration-100`}
        >
          <div className="px-3 py-1.5 border-b border-neutral-800 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {isAr ? "اختر الدولة و العملة" : "Shipping Destination"}
          </div>

          <div className="py-1">
            {countryList.map((item) => {
              const isSelected = country === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#b6713e]/20 text-white font-semibold"
                      : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{item.flag}</span>
                    <div className="text-left">
                      <div className="font-medium">{isAr ? item.nameAr || item.name : item.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {item.currency} ({isAr ? item.currencyAr || item.currency : item.currency})
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-[#b6713e]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
