import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "new" | "sale" | "discount" | "outline" | "neutral";
}

export function Badge({
  variant = "new",
  className,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    new: "badge-new",
    sale: "badge-sale",
    discount: "bg-[#b6713e] text-white text-[11px] font-bold px-2 py-0.5 rounded-[3px]",
    outline: "border border-[#1c1c1c] text-[#1c1c1c] text-[11px] font-medium px-2 py-0.5 rounded-[3px]",
    neutral: "bg-neutral-100 text-neutral-800 text-[11px] font-medium px-2 py-0.5 rounded-[3px]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
