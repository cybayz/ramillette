import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CountryCode, getCountryConfig } from "./country/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string | { toString(): string } | null | undefined,
  countryCode?: CountryCode | string | null
): string {
  const config = getCountryConfig(countryCode);
  if (price === null || price === undefined) return `${config.currency} 0.00`;
  const num =
    typeof price === "object"
      ? parseFloat(price.toString())
      : typeof price === "string"
      ? parseFloat(price)
      : Number(price);
  if (isNaN(num)) return `${config.currency} 0.00`;

  return `${config.currency} ${num.toFixed(config.currencyDecimals)}`;
}

export function calculateDiscount(price: number, compareAtPrice?: number | null): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

