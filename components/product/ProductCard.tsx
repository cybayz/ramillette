"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useLanguageStore } from "@/lib/store/useLanguageStore";
import { productArabicNames } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface CardVariant {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  stock?: number;
}

export interface CardProduct {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  categoryName?: string;
  basePrice: number;
  compareAtPrice?: number | null;
  bestseller?: boolean;
  newArrival?: boolean;
  images: { url: string; alt?: string | null }[];
  variants?: CardVariant[];
  rating?: number;
  reviewsCount?: number;
}

interface ProductCardProps {
  product: CardProduct;
  className?: string;
  isArabic?: boolean;
  variant?: "standard" | "collection";
  selectedSize?: string;
}

export function ProductCard({
  product,
  className,
  isArabic,
  variant = "standard",
  selectedSize,
}: ProductCardProps) {
  const pathname = usePathname();
  const { addItem, openCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { language } = useLanguageStore();

  // Find variant matching selectedSize, or default to first variant
  const activeVariant = React.useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    if (selectedSize && selectedSize !== "all" && selectedSize !== "All") {
      const match = product.variants.find(
        (v) =>
          v.name.toLowerCase() === selectedSize.toLowerCase() ||
          v.name.toLowerCase().includes(selectedSize.toLowerCase())
      );
      if (match) return match;
    }
    return product.variants[0];
  }, [product.variants, selectedSize]);

  const [selectedVariant, setSelectedVariant] = useState<CardVariant | null>(activeVariant);

  React.useEffect(() => {
    if (activeVariant) {
      setSelectedVariant(activeVariant);
    }
  }, [activeVariant]);

  const [isHovered, setIsHovered] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const primaryImage =
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600";
  const hoverImage = product.images[1]?.url || primaryImage;

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.basePrice;

  // Size badge text
  const sizeBadge =
    selectedSize && selectedSize !== "all" && selectedSize !== "All"
      ? selectedSize
      : selectedVariant?.name || product.variants?.[0]?.name || "30ml";

  // Localized product name
  const isAr = isArabic || pathname?.startsWith("/ar") || language === "ar";
  const displayName = isAr
    ? productArabicNames[product.slug] ||
      productArabicNames[product.name] ||
      product.name
    : product.name;

  const selectOptionsText = isAr ? "اختر الخيارات" : "Select options";
  const chooseAndBuyText = isAr ? "اختر واشترِ" : "Choose & Buy";
  const addToCartText = isAr ? "أضف إلى السلة" : "Add to cart";
  const brandName = isAr ? "راميليت" : (product.brand || "RAMILLETTE");
  const reviewsText = isAr ? "10 reviews" : "10 reviews";

  const handleChooseAndBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: selectedVariant?.name,
      slug: product.slug,
      price: currentPrice,
      image: primaryImage,
      quantity: 1,
      maxStock: selectedVariant?.stock ?? 50,
    });
    openCart();
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      image: primaryImage,
      categoryName: product.categoryName,
    });
  };

  return (
    <div
      className={cn("group relative flex flex-col bg-white", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area with Hover Effect */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#f7f5f0]">
        {/* Size Badge (e.g. 30ml / 80ml) on Top Left */}
        {sizeBadge && (
          <span className="absolute top-2.5 start-2.5 z-10 bg-white/95 text-neutral-900 text-[11px] font-bold px-2 py-0.5 rounded-[4px] shadow-xs">
            {sizeBadge}
          </span>
        )}

        {/* Floating Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-2.5 end-2.5 z-10 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110",
            isWishlisted ? "text-red-500" : "text-neutral-700 hover:text-[#4e6648]"
          )}
        >
          <Heart
            size={16}
            className={cn("transition-transform duration-200 active:scale-125", {
              "fill-current text-red-500": isWishlisted,
            })}
          />
        </button>

        {/* Primary and Hover Image Cross-Fade */}
        <Link href={`/product/${product.slug}`} className="block w-full h-full relative cursor-pointer">
          <Image
            src={primaryImage}
            alt={displayName}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={cn(
              "object-cover transition-all duration-500 ease-in-out",
              isHovered && hoverImage !== primaryImage
                ? "opacity-0 scale-105"
                : "opacity-100 scale-100"
            )}
          />

          {hoverImage !== primaryImage && (
            <Image
              src={hoverImage}
              alt={`${displayName} alternate view`}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className={cn(
                "object-cover transition-all duration-500 ease-in-out absolute inset-0",
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              )}
            />
          )}
        </Link>
      </div>

      {variant === "collection" ? (
        /* Collection View Card Details (matching reference site exactly) */
        <div className="flex flex-col flex-1 pt-2.5 text-start">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
            {brandName}
          </span>
          <Link
            href={`/product/${product.slug}`}
            className="text-[14px] sm:text-[15px] font-bold text-neutral-900 hover:text-[#4e6648] transition-colors line-clamp-1 block text-start"
          >
            {displayName}
          </Link>
          <div className="mt-1 text-start">
            <span className="text-[14px] sm:text-[15px] font-bold text-neutral-900">
              QAR {currentPrice.toFixed(2)}
            </span>
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={handleChooseAndBuy}
              className="w-full py-2 px-3 border border-neutral-200 hover:border-[#233324] hover:bg-[#233324] hover:text-white rounded-[6px] text-xs font-semibold text-neutral-900 bg-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <ShoppingCart size={14} className="stroke-[2]" />
              <span>{addToCartText}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Standard View Card Details (Star ratings + dual action buttons) */
        <div className="flex flex-col flex-1 pt-3 text-start">
          <Link
            href={`/product/${product.slug}`}
            className="text-[15px] font-bold text-[#1c1c1c] hover:text-[#4e6648] transition-colors line-clamp-1 block text-start"
          >
            {displayName}
          </Link>

          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center text-[#108475]">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>
            <span className="text-[12px] text-neutral-600 font-normal">
              {reviewsText}
            </span>
          </div>

          <div className="mt-1.5 text-start">
            <span className="text-[15px] sm:text-base font-bold text-[#1c1c1c]">
              QAR {currentPrice.toFixed(2)}
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <Link
              href={`/product/${product.slug}`}
              className="w-full py-2 px-3 border border-[#d1d5db] hover:border-[#1c1c1c] rounded-[5px] text-[13px] font-medium text-[#1c1c1c] bg-white hover:bg-neutral-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
            >
              <ShoppingCart size={15} className="stroke-[1.8]" />
              <span>{selectOptionsText}</span>
            </Link>

            <button
              type="button"
              onClick={handleChooseAndBuy}
              className="w-full py-2 px-3 bg-[#4e6648] hover:bg-[#3d5239] text-white rounded-[5px] text-[13px] font-medium flex items-center justify-center transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
            >
              {chooseAndBuyText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

