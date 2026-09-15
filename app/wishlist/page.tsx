"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleMoveToCart = (item: any) => {
    addItem({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    removeItem(item.productId);
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#ffffff] min-h-[70vh] flex items-center justify-center py-16">
        <div className="ramillette-container text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-[#fbf9f5] border border-[#e5e5e5] flex items-center justify-center text-neutral-400 mx-auto mb-5">
            <Heart size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1c] mb-2">
            Your Wishlist is Empty
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mb-8 leading-relaxed">
            Save your favorite artisanal perfumes and inspired fragrances so you can easily find them later.
          </p>
          <Link href="/shop/best-sellers">
            <Button variant="primary" size="lg" className="px-8 text-sm">
              Explore Best Sellers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ffffff] min-h-screen py-10">
      <div className="ramillette-container">
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">Wishlist</span>
        </nav>

        <div className="flex items-center justify-between pb-4 mb-8 border-b border-[#e5e5e5]">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1c1c1c]">
              My Wishlist ({items.length})
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Fragrances you love and plan to add to your collection.
            </p>
          </div>

          <button
            onClick={clearWishlist}
            className="text-xs text-neutral-500 hover:text-red-600 underline font-medium"
          >
            Clear All
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.productId}
              className="group relative flex flex-col bg-white rounded-[5px] border border-[#eaeaea] hover:border-[#b6713e] p-4 transition-all duration-300"
            >
              <button
                onClick={() => removeItem(item.productId)}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 text-neutral-400 hover:text-red-600 shadow-xs transition-colors"
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>

              <Link
                href={`/product/${item.slug}`}
                className="relative block w-full aspect-square bg-[#fbf9f5] rounded-[4px] overflow-hidden mb-3"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 250px"
                  />
                ) : null}
              </Link>

              <div className="flex flex-col flex-1">
                {item.categoryName && (
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium mb-1">
                    {item.categoryName}
                  </span>
                )}

                <Link
                  href={`/product/${item.slug}`}
                  className="text-sm font-semibold text-[#1c1c1c] hover:text-[#b6713e] transition-colors line-clamp-1 mb-2"
                >
                  {item.name}
                </Link>

                <div className="text-sm font-bold text-[#1c1c1c] mb-4">
                  {formatPrice(item.price)}
                </div>

                <div className="mt-auto space-y-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleMoveToCart(item)}
                    className="w-full text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={14} />
                    <span>Move to Cart</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
