import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating?: number;
  reviewsCount?: number;
  size?: number;
  showCount?: boolean;
  className?: string;
}

export function RatingStars({
  rating = 5,
  reviewsCount,
  size = 14,
  showCount = true,
  className,
}: RatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center text-[#eab308]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={cn(
              "fill-current",
              star <= Math.round(rating)
                ? "text-[#fbcd0a] fill-[#fbcd0a]"
                : "text-neutral-200 fill-neutral-200"
            )}
          />
        ))}
      </div>
      {showCount && reviewsCount !== undefined && (
        <span className="text-xs text-neutral-500 font-medium">
          ({reviewsCount})
        </span>
      )}
    </div>
  );
}
