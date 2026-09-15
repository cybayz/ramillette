"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { Heart, ShoppingBag, Zap, Check, Truck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VariantData {
  id: string;
  name: string;
  sku?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stock?: number;
}

interface ProductPurchaseFormProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    compareAtPrice?: number | null;
    stock: number;
    images: { url: string }[];
  };
  variants: VariantData[];
}

export function ProductPurchaseForm({
  product,
  variants,
}: ProductPurchaseFormProps) {
  const router = useRouter();
  const { addItem, openCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [selectedVariant, setSelectedVariant] = useState<VariantData>(
    variants.length > 0
      ? variants[0]
      : {
          id: "default",
          name: "Standard",
          price: product.basePrice,
          compareAtPrice: product.compareAtPrice,
          stock: product.stock,
        }
  );

  const [quantity, setQuantity] = useState(1);
  const isWishlisted = isInWishlist(product.id);

  const currentPrice = selectedVariant.price;
  const currentComparePrice = selectedVariant.compareAtPrice;
  const inStock = (selectedVariant.stock ?? product.stock) > 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant.id !== "default" ? selectedVariant.id : undefined,
      name: product.name,
      variantName: selectedVariant.name,
      slug: product.slug,
      price: currentPrice,
      image: product.images[0]?.url || "",
      quantity,
      maxStock: selectedVariant.stock ?? 50,
    });
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant.id !== "default" ? selectedVariant.id : undefined,
      name: product.name,
      variantName: selectedVariant.name,
      slug: product.slug,
      price: currentPrice,
      image: product.images[0]?.url || "",
      quantity,
      maxStock: selectedVariant.stock ?? 50,
    });
    router.push("/checkout");
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Price Display */}
      <div className="flex items-center gap-3">
        <PriceDisplay
          price={currentPrice}
          compareAtPrice={currentComparePrice}
          size="lg"
          showDiscountBadge={true}
        />
        <span className="text-xs text-neutral-500 font-medium">
          (VAT included in Qatar)
        </span>
      </div>

      {/* Variant Selector (Bottle Sizes) */}
      {variants.length > 1 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
            Select Bottle Size:{" "}
            <span className="text-[#b6713e] font-semibold">{selectedVariant.name}</span>
          </label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {variants.map((v) => {
              const isSelected = selectedVariant.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={cn(
                    "px-4 py-2 text-xs font-semibold rounded-[5px] border transition-all cursor-pointer",
                    isSelected
                      ? "border-[#b6713e] bg-[#faedcd] text-[#1c1c1c] shadow-xs"
                      : "border-[#e5e5e5] bg-white text-neutral-700 hover:border-neutral-400"
                  )}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Status Indicator */}
      <div className="flex items-center gap-2 text-xs">
        {inStock ? (
          <>
            <span className="w-2 h-2 rounded-full bg-[#0d9d00] animate-pulse" />
            <span className="text-[#0d9d00] font-semibold">
              In Stock — Ready for Express Delivery in Qatar
            </span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-500 font-semibold">
              Out of stock — Pre-order available
            </span>
          </>
        )}
      </div>

      {/* Quantity & CTA Actions */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <span className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
              Quantity
            </span>
            <QuantityStepper
              quantity={quantity}
              onIncrease={() => setQuantity((q) => q + 1)}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
              max={selectedVariant.stock ?? 50}
            />
          </div>

          <div className="flex-1 self-end">
            <Button
              variant="primary"
              size="lg"
              disabled={!inStock}
              onClick={handleAddToCart}
              className="w-full h-12 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              <span>Add to Cart</span>
            </Button>
          </div>

          <div className="self-end">
            <button
              type="button"
              onClick={() =>
                toggleWishlist({
                  productId: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: currentPrice,
                  image: product.images[0]?.url || "",
                })
              }
              className={cn(
                "h-12 w-12 rounded-[5px] border flex items-center justify-center transition-colors cursor-pointer",
                isWishlisted
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "border-[#e5e5e5] bg-white text-neutral-700 hover:text-[#b6713e] hover:border-[#b6713e]"
              )}
              aria-label="Wishlist"
            >
              <Heart
                size={20}
                className={isWishlisted ? "fill-current text-red-500" : ""}
              />
            </button>
          </div>
        </div>

        {/* Instant Buy Now Button */}
        <button
          type="button"
          disabled={!inStock}
          onClick={handleBuyNow}
          className="btn-dark w-full h-12 text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Zap size={16} className="text-[#faedcd]" />
          <span>Buy It Now</span>
        </button>
      </div>

      {/* Service Highlights Box */}
      <div className="p-4 rounded-[6px] bg-[#fbf9f5] border border-[#ecdec1] space-y-2 text-xs text-neutral-700">
        <div className="flex items-center gap-2.5">
          <Clock size={16} className="text-[#b6713e] shrink-0" />
          <span>
            <strong>Express 2-Hour Delivery</strong> available for orders within Doha.
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Truck size={16} className="text-[#b6713e] shrink-0" />
          <span>
            <strong>Free Shipping:</strong> On all orders exceeding QAR 900.
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Check size={16} className="text-[#0d9d00] shrink-0" />
          <span>
            <strong>Cash on Delivery (COD)</strong> accepted across Qatar.
          </span>
        </div>
      </div>
    </div>
  );
}
