"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}

export function QuantityStepper({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  size = "md",
}: QuantityStepperProps) {
  const isSm = size === "sm";

  return (
    <div
      className={`inline-flex items-center border border-[#e5e5e5] rounded-[5px] bg-white ${
        isSm ? "h-8" : "h-11"
      }`}
    >
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= min}
        className={`flex items-center justify-center text-neutral-600 hover:text-[#1c1c1c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
          isSm ? "w-7 h-full" : "w-10 h-full"
        }`}
        aria-label="Decrease quantity"
      >
        <Minus size={isSm ? 12 : 14} />
      </button>

      <span
        className={`font-semibold text-[#1c1c1c] text-center select-none ${
          isSm ? "w-8 text-xs" : "w-10 text-sm"
        }`}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={quantity >= max}
        className={`flex items-center justify-center text-neutral-600 hover:text-[#1c1c1c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
          isSm ? "w-7 h-full" : "w-10 h-full"
        }`}
        aria-label="Increase quantity"
      >
        <Plus size={isSm ? 12 : 14} />
      </button>
    </div>
  );
}
