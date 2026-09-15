"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Share2, Heart, Check } from "lucide-react";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { cn } from "@/lib/utils";

interface ImageItem {
  url: string;
  alt?: string | null;
}

interface ProductGalleryProps {
  images: ImageItem[];
  productName: string;
  productId?: string;
  slug?: string;
  price?: number;
}

export function ProductGallery({
  images,
  productName,
  productId,
  slug,
  price = 49,
}: ProductGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const isWishlisted = productId ? isInWishlist(productId) : false;

  const activeImage =
    images[selectedIdx]?.url ||
    images[0]?.url ||
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600";

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWishlist = () => {
    if (productId) {
      toggleWishlist({
        productId,
        name: productName,
        slug: slug || "",
        price,
        image: activeImage,
      });
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3.5 sm:gap-4 items-start">
      {/* Left Vertical Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto shrink-0 w-full md:w-[76px] sm:md:w-[84px] py-1">
          {images.map((img, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={cn(
                  "relative w-16 h-16 sm:w-[76px] sm:h-[76px] rounded-[10px] bg-[#fbf9f5] transition-all overflow-hidden cursor-pointer shrink-0",
                  isSelected
                    ? "border-2 border-[#1c1c1c] shadow-xs"
                    : "border border-[#e5e5e5] hover:border-neutral-400"
                )}
                aria-label={`View image ${idx + 1}`}
              >
                <Image
                  src={img.url}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  className="object-contain p-1.5"
                  sizes="84px"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Large Image */}
      <div className="relative flex-1 w-full aspect-square bg-[#fbf9f5] rounded-[16px] border border-[#e5e5e5] overflow-hidden">
        {/* Floating Action Buttons: Share & Wishlist */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-white/95 border border-neutral-200/90 shadow-xs flex items-center justify-center text-neutral-700 hover:text-black hover:scale-105 transition-all cursor-pointer"
            aria-label="Share product"
            title={copied ? "Link copied!" : "Share product"}
          >
            {copied ? (
              <Check size={14} className="text-green-600" />
            ) : (
              <Share2 size={15} />
            )}
          </button>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlist}
            className="w-8 h-8 rounded-full bg-white/95 border border-neutral-200/90 shadow-xs flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={15}
              className={cn("transition-colors", {
                "fill-red-500 text-red-500": isWishlisted,
                "text-neutral-700 hover:text-[#4E6548]": !isWishlisted,
              })}
            />
          </button>
        </div>

        {/* Large Product Image */}
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          className="object-contain p-4 sm:p-6 transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>
    </div>
  );
}
