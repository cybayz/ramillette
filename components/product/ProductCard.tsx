"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { RatingStars } from "@/components/ui/RatingStars";
import { Badge } from "@/components/ui/Badge";
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

  const [selectedVariant, setSelectedVariant] = useState<CardVariant | null>(
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
  const currentComparePrice = selectedVariant
    ? selectedVariant.compareAtPrice
    : product.compareAtPrice;

  const handleQuickAdd = (e: React.MouseEvent) => {
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
      className={cn(
        "group relative flex flex-col bg-white rounded-[5px] border border-[#eaeaea] hover:border-[#ecdec1] hover:shadow-lg transition-all duration-300 p-3",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges Container */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
        {product.newArrival && <Badge variant="new">New</Badge>}
        {product.bestseller && (
          <Badge variant="discount" className="bg-[#b6713e]">
            Best Seller
          </Badge>
        )}
        {currentComparePrice && currentComparePrice > currentPrice && (
          <Badge variant="sale">Sale</Badge>
        )}
      </div>

      {/* Floating Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer",
          isWishlisted
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-white/90 text-neutral-600 hover:text-[#b6713e] hover:bg-white"
        )}
      >
        <Heart
          size={18}
          className={cn("transition-transform duration-200 active:scale-125", {
            "fill-current text-red-500": isWishlisted,
          })}
        />
      </button>

      {/* Product Image Area */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block w-full aspect-square bg-[#fbf9f5] rounded-[4px] overflow-hidden mb-3"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          className={cn(
            "object-contain p-2 transition-all duration-500 ease-in-out",
            isHovered && hoverImage !== primaryImage
              ? "opacity-0 scale-95"
              : "opacity-100 scale-100"
          )}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {hoverImage !== primaryImage && (
          <Image
            src={hoverImage}
            alt={`${product.name} alternate`}
            fill
            className={cn(
              "object-contain p-2 transition-all duration-500 ease-in-out absolute inset-0",
              isHovered ? "opacity-100 scale-105" : "opacity-0 scale-95"
            )}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        )}
      </Link>

      {/* Product Information */}
      <div className="flex flex-col flex-1">
        {/* Brand / Fragrance Category */}
        <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium mb-1">
          {product.brand || "Ramillette Perfumes"}
        </span>

        {/* Product Title */}
        <Link
          href={`/product/${product.slug}`}
          className="text-sm font-semibold text-[#1c1c1c] hover:text-[#b6713e] transition-colors line-clamp-1 mb-1.5"
        >
          {product.name}
        </Link>

        {/* Ratings */}
        <div className="mb-2">
          <RatingStars
            rating={product.rating ?? 5}
            reviewsCount={product.reviewsCount ?? 12}
            size={13}
          />
        </div>

        {/* Variant Size Pills */}
        {product.variants && product.variants.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {product.variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVariant(variant);
                  }}
                  className={cn(
                    "px-2 py-0.5 text-[11px] font-medium rounded-[3px] border transition-all cursor-pointer",
                    isSelected
                      ? "border-[#b6713e] bg-[#faedcd] text-[#1c1c1c] font-semibold"
                      : "border-[#e5e5e5] bg-white text-neutral-600 hover:border-neutral-400"
                  )}
                >
                  {variant.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Price & Action Row */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-[#f5f5f5]">
          <PriceDisplay
            price={currentPrice}
            compareAtPrice={currentComparePrice}
            size="md"
            showDiscountBadge={true}
          />

          <button
            onClick={handleQuickAdd}
            aria-label="Add to cart"
            className="btn-primary h-9 px-3 text-xs font-semibold flex items-center gap-1.5"
          >
            <ShoppingBag size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
