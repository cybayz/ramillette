import { CountryCode, getCountryConfig } from "./config";

export interface CountryPriceStock {
  price: number;
  compareAtPrice: number | null;
  stock: number;
  currency: string;
  isAvailable: boolean;
}

/**
 * Resolves the effective price, compareAtPrice, and stock for a product in a given country.
 * Prioritizes explicit country override in ProductCountry if present,
 * otherwise dynamically calculates standardized GCC regional rates.
 */
export function resolveProductForCountry(
  product: {
    basePrice: number | string | { toString(): string };
    compareAtPrice?: number | string | { toString(): string } | null;
    stock?: number | null;
    countries?: Array<{
      country: string;
      price: number | string | { toString(): string };
      compareAtPrice?: number | string | { toString(): string } | null;
      stock: number;
      active: boolean;
    }> | null;
  },
  countryCode: string = "QA"
): CountryPriceStock {
  const config = getCountryConfig(countryCode);
  const baseNum = Number(product.basePrice) || 0;
  const compareNum = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const defaultStock = product.stock ?? 50;

  // Check explicit override
  if (product.countries && Array.isArray(product.countries)) {
    const override = product.countries.find((c) => c.country.toUpperCase() === countryCode);
    if (override && override.active) {
      const p = Number(override.price);
      const cp = override.compareAtPrice ? Number(override.compareAtPrice) : null;
      return {
        price: p,
        compareAtPrice: cp,
        stock: override.stock,
        currency: config.currency,
        isAvailable: override.stock > 0,
      };
    }
  }

  // Fallback: exchange rate calculation
  let calculatedPrice = baseNum;
  let calculatedCompare = compareNum;

  if (countryCode === "AE") {
    calculatedPrice = Math.round(baseNum * config.exchangeRate);
    calculatedCompare = compareNum ? Math.round(compareNum * config.exchangeRate) : null;
  } else if (countryCode === "BH") {
    calculatedPrice = Number((baseNum * config.exchangeRate).toFixed(3));
    calculatedCompare = compareNum ? Number((compareNum * config.exchangeRate).toFixed(3)) : null;
  }

  return {
    price: calculatedPrice,
    compareAtPrice: calculatedCompare,
    stock: defaultStock,
    currency: config.currency,
    isAvailable: defaultStock > 0,
  };
}

/**
 * Resolves the effective price, compareAtPrice, and stock for a variant in a given country.
 */
export function resolveVariantForCountry(
  variant: {
    price: number | string | { toString(): string };
    compareAtPrice?: number | string | { toString(): string } | null;
    stock?: number | null;
    countries?: Array<{
      country: string;
      price: number | string | { toString(): string };
      compareAtPrice?: number | string | { toString(): string } | null;
      stock: number;
      active: boolean;
    }> | null;
  },
  countryCode: string = "QA"
): CountryPriceStock {
  const config = getCountryConfig(countryCode);
  const baseNum = Number(variant.price) || 0;
  const compareNum = variant.compareAtPrice ? Number(variant.compareAtPrice) : null;
  const defaultStock = variant.stock ?? 30;

  if (variant.countries && Array.isArray(variant.countries)) {
    const override = variant.countries.find((c) => c.country.toUpperCase() === countryCode);
    if (override && override.active) {
      const p = Number(override.price);
      const cp = override.compareAtPrice ? Number(override.compareAtPrice) : null;
      return {
        price: p,
        compareAtPrice: cp,
        stock: override.stock,
        currency: config.currency,
        isAvailable: override.stock > 0,
      };
    }
  }

  // Fallback: exchange rate calculation
  let calculatedPrice = baseNum;
  let calculatedCompare = compareNum;

  if (countryCode === "AE") {
    calculatedPrice = Math.round(baseNum * config.exchangeRate);
    calculatedCompare = compareNum ? Math.round(compareNum * config.exchangeRate) : null;
  } else if (countryCode === "BH") {
    calculatedPrice = Number((baseNum * config.exchangeRate).toFixed(3));
    calculatedCompare = compareNum ? Number((compareNum * config.exchangeRate).toFixed(3)) : null;
  }

  return {
    price: calculatedPrice,
    compareAtPrice: calculatedCompare,
    stock: defaultStock,
    currency: config.currency,
    isAvailable: defaultStock > 0,
  };
}

/**
 * Calculates the exact price displayed on the ProductCard for a product,
 * taking into account:
 * 1. Selected size filter (e.g. "50ml", "30ml", "100ml", "80ml")
 * 2. Variant matching
 * 3. Country-specific currency and pricing overrides (QA, AE, BH, etc.)
 */
export function getDisplayedProductPrice(
  product: {
    basePrice: number | string | { toString(): string };
    compareAtPrice?: number | string | { toString(): string } | null;
    stock?: number | null;
    countries?: any[] | null;
    variants?: Array<{
      id: string;
      name: string;
      price: number | string | { toString(): string };
      compareAtPrice?: number | string | { toString(): string } | null;
      stock?: number | null;
      countries?: any[] | null;
    }> | null;
  },
  selectedSize?: string,
  countryCode: string = "QA"
): number {
  const isSizeSpecified =
    selectedSize && selectedSize !== "all" && selectedSize !== "All";

  if (product.variants && product.variants.length > 0) {
    if (isSizeSpecified) {
      const cleanSize = selectedSize.replace(/\s+/g, "").toLowerCase();
      const match = product.variants.find(
        (v) =>
          v.name.toLowerCase() === selectedSize.toLowerCase() ||
          v.name.toLowerCase().includes(selectedSize.toLowerCase()) ||
          v.name.replace(/\s+/g, "").toLowerCase().includes(cleanSize)
      );
      if (match) {
        return resolveVariantForCountry(match, countryCode).price;
      }
    }
    // If no size is specified or no matching variant, default to first variant
    return resolveVariantForCountry(product.variants[0], countryCode).price;
  }

  return resolveProductForCountry(product, countryCode).price;
}

