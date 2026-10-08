"use client";

import React, { useState } from "react";
import { Sparkles, Gift, ArrowRight, X } from "lucide-react";

interface ProfileCelebrationBannerProps {
  hasBirthday: boolean;
  hasAnniversary: boolean;
  isAr?: boolean;
}

export function ProfileCelebrationBanner({
  hasBirthday,
  hasAnniversary,
  isAr = false,
}: ProfileCelebrationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // If user has provided both, do not show this banner
  if (hasBirthday && hasAnniversary) {
    return null;
  }

  if (isDismissed) {
    return null;
  }

  const handleScrollToCard = () => {
    const el = document.getElementById("celebration-dates-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="mb-6 p-3 sm:p-3.5 bg-[#fbf9f5] border border-[#ecdac1] rounded-[8px] flex items-center justify-between gap-3 text-xs shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-full bg-[#faedcd] flex items-center justify-center text-[#b6713e] shrink-0">
          <Gift size={14} />
        </div>
        <p className="text-neutral-700 truncate sm:whitespace-normal">
          <strong className="text-[#1c1c1c] font-semibold">
            {isAr ? "أكمل ملفك الشخصي:" : "Complete your profile:"}
          </strong>{" "}
          <span className="text-neutral-600">
            {isAr
              ? "أضف تاريخ ميلادك أو ذكرى زواجك لتحصل على عروض وهدايا فاخرة في مناسباتك."
              : "Add your birthday or anniversary to receive bespoke celebration gifts and exclusive offers."}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleScrollToCard}
          className="text-xs font-bold text-[#b6713e] hover:text-[#8f4f22] bg-white border border-[#ecdec1] px-2.5 py-1 rounded-[5px] transition-colors flex items-center gap-1 cursor-pointer shadow-3xs"
        >
          <span>{isAr ? "إضافة التواريخ" : "Add Dates"}</span>
          <ArrowRight size={12} className={isAr ? "rotate-180" : ""} />
        </button>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 text-neutral-400 hover:text-neutral-600 rounded transition-colors"
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
