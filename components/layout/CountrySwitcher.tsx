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
  const { country, setCountry, config } = useCountryStore();
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

  const countryList: CountryCode[] = ["QA", "AE", "BH"];

  const handleSelect = (code: CountryCode) => {
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
          {countryList.map((code) => {
            const item = COUNTRIES[code];
            const isSelected = country === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-[#b6713e]/15 border-[#b6713e] text-white shadow-sm"
                    : "bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                }`}
              >
                <span className="text-xl mb-1">{item.flag}</span>
                <span className="font-semibold text-[11px]">{item.currency}</span>
                <span className="text-[10px] text-neutral-400 truncate max-w-full">
                  {isAr ? item.nameAr : item.name}
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
        <span className="text-sm leading-none">{config.flag}</span>
        <span className="font-semibold tracking-wide">{config.currency}</span>
        <ChevronDown
          size={12}
          className={`text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-[#242424] bg-[#181818]/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              {isAr ? "اختر الدولة والتسوق" : "Select Shopping Region"}
            </p>
          </div>
          <div className="p-1">
            {countryList.map((code) => {
              const item = COUNTRIES[code];
              const isSelected = country === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelect(code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left rtl:text-right ${
                    isSelected
                      ? "bg-[#b6713e]/20 text-white font-semibold"
                      : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-medium">
                        {isAr ? item.nameAr : item.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {item.currency} ({isAr ? item.currencyAr : item.currency})
                      </span>
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
