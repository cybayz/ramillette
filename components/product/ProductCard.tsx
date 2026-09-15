"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
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
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [selectedVariant] = useState<CardVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const [isHovered, setIsHovered] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const primaryImage =
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600";
  const hoverImage = product.images[1]?.url || primaryImage;

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.basePrice;

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
        {/* Floating Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110",
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
            alt={product.name}
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
              alt={`${product.name} alternate view`}
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

      {/* Product Information */}
      <div className="flex flex-col flex-1 pt-3">
        {/* Product Title */}
        <Link
          href={`/product/${product.slug}`}
          className="text-[15px] font-bold text-[#1c1c1c] hover:text-[#4e6648] transition-colors line-clamp-1 block text-left"
        >
          {product.name}
        </Link>

        {/* Star Ratings: 5 Teal-Green Stars + reviews count */}
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
            {product.reviewsCount ?? 10} reviews
          </span>
        </div>

        {/* Price Row */}
        <div className="mt-1.5 text-left">
          <span className="text-[15px] sm:text-base font-bold text-[#1c1c1c]">
            QAR {currentPrice.toFixed(2)}
          </span>
        </div>

        {/* Action Buttons: Select options & Choose & Buy */}
        <div className="mt-3 flex flex-col gap-2">
          {/* 1. Select options button */}
          <Link
            href={`/product/${product.slug}`}
            className="w-full py-2 px-3 border border-[#d1d5db] hover:border-[#1c1c1c] rounded-[5px] text-[13px] font-medium text-[#1c1c1c] bg-white hover:bg-neutral-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
          >
            <ShoppingCart size={15} className="stroke-[1.8]" />
            <span>Select options</span>
          </Link>

          {/* 2. Choose & Buy button (Ramillette Olive Green) */}
          <button
            type="button"
            onClick={handleChooseAndBuy}
            className="w-full py-2 px-3 bg-[#4e6648] hover:bg-[#3d5239] text-white rounded-[5px] text-[13px] font-medium flex items-center justify-center transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
          >
            Choose & Buy
          </button>
        </div>
      </div>
    </div>
  );
}
