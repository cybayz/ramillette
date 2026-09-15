import React from "react";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number | string;
  compareAtPrice?: number | string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  showDiscountBadge?: boolean;
}

export function PriceDisplay({
  price,
  compareAtPrice,
  className,
  size = "md",
  showDiscountBadge = false,
}: PriceDisplayProps) {
  const numPrice = typeof price === "string" ? parseFloat(price) : Number(price);
  const numCompare =
    compareAtPrice != null
      ? typeof compareAtPrice === "string"
        ? parseFloat(compareAtPrice)
        : Number(compareAtPrice)
      : null;

  const discountPercent = numCompare
    ? calculateDiscount(numPrice, numCompare)
    : null;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base font-semibold",
    lg: "text-xl font-bold md:text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className={cn("text-[#1c1c1c]", sizeClasses[size])}>
        {formatPrice(numPrice)}
      </span>

      {numCompare && numCompare > numPrice && (
        <span className="text-neutral-400 line-through text-xs md:text-sm">
          {formatPrice(numCompare)}
        </span>
      )}

      {showDiscountBadge && discountPercent && discountPercent > 0 && (
        <span className="bg-[#db0000] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-[3px]">
          -{discountPercent}%
        </span>
      )}
    </div>
  );
}
