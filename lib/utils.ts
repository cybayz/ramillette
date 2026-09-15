import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string | { toString(): string } | null | undefined
): string {
  if (price === null || price === undefined) return "QAR 0.00";
  const num =
    typeof price === "object"
      ? parseFloat(price.toString())
      : typeof price === "string"
      ? parseFloat(price)
      : Number(price);
  if (isNaN(num)) return "QAR 0.00";
  return `QAR ${num.toFixed(2)}`;
}

export function calculateDiscount(price: number, compareAtPrice?: number | null): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
