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
  compact?: boolean;
  className?: string;
}

/**
 * Official PayLater Brand Icon (Gradient Purple & Cyan Ribbon 'P')
 */
export function PayLaterIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PayLater Icon"
    >
      <defs>
        <linearGradient id="paylaterPurpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6924e2" />
          <stop offset="50%" stopColor="#4c14ba" />
          <stop offset="100%" stopColor="#320775" />
        </linearGradient>
        <linearGradient id="paylaterCyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#00b4d8" />
        </linearGradient>
      </defs>

      {/* Main Purple Loop & Stem of the P */}
      <path
        d="M7 8.5C7 5.46243 9.46243 3 12.5 3H19C22.866 3 26 6.13401 26 10C26 13.866 22.866 17 19 17H13.5V20.5C13.5 22.1569 12.1569 23.5 10.5 23.5H9.5C8.11929 23.5 7 22.3807 7 21V8.5Z"
        fill="url(#paylaterPurpleGradient)"
      />

      {/* Inner Cutout Hole */}
      <rect x="12" y="7.5" width="8" height="5.5" rx="2.75" fill="#ffffff" />

      {/* Cyan Ribbon Fold at Bottom-Left */}
      <path
        d="M5.5 19.5C5.5 17.8431 6.84315 16.5 8.5 16.5C10.1569 16.5 11.5 17.8431 11.5 19.5V22C11.5 23.6569 12.8431 25 14.5 25H15C15.8284 25 16.5 25.6716 16.5 26.5C16.5 27.3284 15.8284 28 15 28H10.5C7.73858 28 5.5 25.7614 5.5 23V19.5Z"
        fill="url(#paylaterCyanGradient)"
      />
    </svg>
  );
}

/**
 * PayLater Brand Lockup (Icon + Wordmark)
 */
export function PayLaterLogo({
  className = "",
  iconOnly = false,
  color,
}: {
  className?: string;
  iconOnly?: boolean;
  color?: string;
}) {
  if (iconOnly) {
    return <PayLaterIcon className={className || "w-6 h-6"} />;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`}>
      <PayLaterIcon className="w-7 h-7 shrink-0" />
      <span className="text-[17px] sm:text-[18px] font-black tracking-tight text-[#381180] leading-none select-none">
        Pay<span className="italic font-black">Later</span>
      </span>
    </div>
  );
}

export function PayLaterCartButton({
  onPayLaterClick,
  subtotal,
  currency = "QAR",
  isAr = false,
  disabled = false,
  showBadges = false,
  className = "",
}: PayLaterCartButtonProps) {
  const instalmentAmount = subtotal && subtotal > 0 ? (subtotal / 4).toFixed(2) : null;

  return (
    <div className={`w-full ${className}`}>
      {/* PayLater Button matching reference image */}
      <button
        type="button"
        onClick={onPayLaterClick}
        disabled={disabled}
        className={`w-full group text-left rtl:text-right transition-all duration-200 rounded-2xl h-13 py-3 px-4 sm:px-5 border border-[#cbd5e1] hover:border-[#94a3b8] bg-white hover:bg-neutral-50 active:scale-[0.99] flex items-center justify-between shadow-2xs cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <div className="flex items-center min-w-0">
          <PayLaterLogo className="shrink-0" />

          {/* Vertical Divider */}
          <div className="h-6 w-[1px] bg-[#cbd5e1] mx-3 sm:mx-4 shrink-0" />

          {/* Text: Pay in 4 installments */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs sm:text-sm font-medium text-[#1c1c1c] whitespace-nowrap">
              {isAr ? "ادفع على 4 دفعات" : "Pay in 4 installments"}
            </span>
            {instalmentAmount && (
              <span className="hidden md:inline text-[11px] font-semibold text-neutral-500 whitespace-nowrap">
                {isAr ? `(${instalmentAmount} ${currency})` : `(${currency} ${instalmentAmount})`}
              </span>
            )}
          </div>
        </div>

        {/* Right Arrow */}
        <ArrowRight
          size={18}
          className={`text-neutral-900 shrink-0 ml-2 transition-transform group-hover:translate-x-0.5 ${
            isAr ? "rotate-180 group-hover:-translate-x-0.5" : ""
          }`}
        />
      </button>

      {/* Trust & Guarantee Badges (optional) */}
      {showBadges && (
        <div className="grid grid-cols-2 gap-2 pt-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50/70 border border-neutral-100 text-neutral-600">
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

          <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50/70 border border-neutral-100 text-neutral-600">
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
