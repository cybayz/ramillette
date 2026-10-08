"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";

interface PayLaterCartButtonProps {
  onPayLaterClick: () => void;
  subtotal?: number;
  currency?: string;
  isAr?: boolean;
  disabled?: boolean;
  showBadges?: boolean;
  className?: string;
}

/**
 * PayLater SVG Brand Mark matching the official PayLater logo
 */
export function PayLaterLogo({ className = "w-6 h-6", color = "#0066cc" }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PayLater"
    >
      <rect width="32" height="32" rx="7" fill={color} fillOpacity="0.08" />
      <path
        d="M9 7.5H18.5C21.8 7.5 24.5 10.2 24.5 13.5C24.5 16.8 21.8 19.5 18.5 19.5H14.5V24.5H9V7.5Z"
        fill={color}
      />
      <path
        d="M14.5 12H18.2C19.3 12 20.2 12.9 20.2 14C20.2 15.1 19.3 16 18.2 16H14.5V12Z"
        fill="#ffffff"
      />
      <circle cx="11.5" cy="19.5" r="2" fill="#38bdf8" />
    </svg>
  );
}

export function PayLaterCartButton({
  onPayLaterClick,
  subtotal,
  currency = "QAR",
  isAr = false,
  disabled = false,
  showBadges = true,
  className = "",
}: PayLaterCartButtonProps) {
  const instalmentAmount = subtotal && subtotal > 0 ? (subtotal / 4).toFixed(2) : null;

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Divider */}
      <div className="relative flex items-center justify-center my-1">
        <div className="w-full border-t border-[#e2e8f0]" />
        <span className="absolute bg-[#ffffff] px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
          {isAr ? "أو" : "OR"}
        </span>
      </div>

      {/* PayLater Action Button */}
      <button
        type="button"
        onClick={onPayLaterClick}
        disabled={disabled}
        className={`w-full group text-left rtl:text-right transition-all duration-200 rounded-[10px] p-3 sm:p-3.5 border border-[#bfdbfe] bg-[#f0f7ff] hover:bg-[#e3f0fe] active:scale-[0.99] shadow-2xs cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PayLaterLogo className="w-6 h-6 shrink-0" color="#0066cc" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-medium text-[#1c1c1c]">
                {isAr ? "اشتري الآن عبر" : "Buy with"}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#0066cc] tracking-tight">
                PayLater
              </span>
            </div>
          </div>

          <div className="w-6 h-6 rounded-full bg-white/80 border border-[#bfdbfe] flex items-center justify-center text-[#0066cc] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
            <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
          </div>
        </div>

        <div className="mt-1 pl-8.5 rtl:pl-0 rtl:pr-8.5 flex flex-wrap items-center justify-between text-[11px] text-[#475569]">
          <span>
            {isAr
              ? "قسم دفعاتك بسهولة. متاح في قطر."
              : "Split your payment. Available in Qatar."}
          </span>
          {instalmentAmount && (
            <span className="font-semibold text-[#0066cc]">
              {isAr ? `(4 دفعات × ${instalmentAmount} ${currency})` : `(4 × ${currency} ${instalmentAmount})`}
            </span>
          )}
        </div>
      </button>

      {/* Trust & Guarantee Badges matching Image 1 */}
      {showBadges && (
        <div className="grid grid-cols-2 gap-2 pt-1 pb-1">
          <div className="flex items-center gap-2 p-2 rounded-[6px] bg-neutral-50/70 border border-neutral-100 text-neutral-600">
            <ShieldCheck size={16} className="text-[#0d9d00] shrink-0" />
            <div className="text-[10px] leading-tight">
              <span className="font-bold text-[#1c1c1c] block">
                {isAr ? "دفع آمن ومحمي" : "Secure Checkout"}
              </span>
              <span className="text-neutral-400">
                {isAr ? "مشفر 100%" : "100% Safe & Encrypted"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-[6px] bg-neutral-50/70 border border-neutral-100 text-neutral-600">
            <Truck size={16} className="text-[#b6713e] shrink-0" />
            <div className="text-[10px] leading-tight">
              <span className="font-bold text-[#1c1c1c] block">
                {isAr ? "توصيل سريع" : "Fast Delivery"}
              </span>
              <span className="text-neutral-400">
                {isAr ? "في جميع أنحاء قطر" : "Across Qatar"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
