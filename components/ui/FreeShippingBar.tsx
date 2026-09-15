"use client";

import React from "react";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, Truck } from "lucide-react";

interface FreeShippingBarProps {
  currentAmount: number;
  threshold?: number;
  className?: string;
}

export function FreeShippingBar({
  currentAmount,
  threshold = 900,
  className,
}: FreeShippingBarProps) {
  const percentage = Math.min(100, Math.round((currentAmount / threshold) * 100));
  const remaining = Math.max(0, threshold - currentAmount);
  const isFree = remaining === 0;

  return (
    <div className={`w-full bg-[#fbf9f5] p-3 rounded-[5px] border border-[#ecdec1] ${className || ""}`}>
      <div className="flex items-center gap-2 mb-1.5 text-xs text-[#1c1c1c]">
        {isFree ? (
          <>
            <CheckCircle2 size={16} className="text-[#0d9d00]" />
            <span className="font-semibold text-[#0d9d00]">
              Congratulations! You've unlocked Free Shipping across Qatar!
            </span>
          </>
        ) : (
          <>
            <Truck size={16} className="text-[#b6713e]" />
            <span>
              Add <strong className="text-[#b6713e]">{formatPrice(remaining)}</strong> more to get{" "}
              <strong>FREE SHIPPING</strong>!
            </span>
          </>
        )}
      </div>

      <div className="w-full bg-[#e5e5e5] h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#b6713e] h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
