"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Crown, Sparkles, Check, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/useCartStore";

interface OwnBrandSpotlightProps {
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    compareAtPrice?: number | null;
    images: { url: string }[];
    variants?: { id: string; name: string; price: number; stock: number }[];
  };
}

export function OwnBrandSpotlight({ product }: OwnBrandSpotlightProps) {
  const { addItem, openCart } = useCartStore();

  const amberCodeProduct = product || {
    id: "amber-code-45",
    name: "Amber Code",
    slug: "amber-code-45",
    description:
      "Amber Code is Ramillette's premier 80ml parfum, handcrafted in Qatar. A bold, opulent fragrance featuring rich amber, royal oud, and warm woody notes, crafted to leave an unforgettable trail.",
    basePrice: 110.0,
    images: [
      {
        url: "https://cdn.shopify.com/s/files/1/0754/5323/5383/files/ChatGPT_Image_Aug_18_2026_04_09_56_PM.png?v=1788027159",
      },
    ],
    variants: [{ id: "v-amber-80", name: "80ml", price: 110.0, stock: 40 }],
  };

  const handleAddToCart = () => {
    addItem({
      productId: amberCodeProduct.id,
      variantId: amberCodeProduct.variants?.[0]?.id,
      name: amberCodeProduct.name,
      variantName: "80ml",
      slug: amberCodeProduct.slug,
      price: amberCodeProduct.basePrice,
      image: amberCodeProduct.images[0]?.url || "",
      quantity: 1,
      maxStock: 40,
    });
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#141414] via-[#1c1c1c] to-[#141414] text-white overflow-hidden relative border-y border-[#2a2a2a]">
      {/* Background accents */}
      <div className="absolute top-1/2 -left-32 -translate-y-1/2 w-96 h-96 bg-[#b6713e]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 -translate-y-1/2 w-96 h-96 bg-[#faedcd]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="ramillette-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Bottle Showcase */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-[12px] bg-gradient-to-br from-[#242424] to-[#171717] p-8 border border-[#383838] shadow-2xl flex items-center justify-center group">
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faedcd] text-[#1c1c1c] text-xs font-bold shadow-md">
                <Crown size={14} className="text-[#b6713e]" />
                <span>Ramillette Signature</span>
              </div>

              <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                <Image
                  src={
                    amberCodeProduct.images[0]?.url ||
                    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600"
                  }
                  alt={amberCodeProduct.name}
                  fill
                  className="object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Details & Olfactory Notes */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#faedcd]">
              <Sparkles size={14} />
              <span>Own Brand Flagship</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Amber Code <span className="text-[#faedcd]">80ml Parfum</span>
            </h2>

            <div className="text-2xl font-bold text-[#faedcd]">
              {formatPrice(amberCodeProduct.basePrice)}
            </div>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
              {amberCodeProduct.description}
            </p>

            {/* Olfactory Pyramid */}
            <div className="grid grid-cols-3 gap-3 py-4 border-y border-[#2e2e2e]">
              <div className="bg-[#242424] p-3 rounded-[5px] border border-[#333333]">
                <span className="text-[10px] text-[#faedcd] font-bold uppercase tracking-wider block">
                  Top Notes
                </span>
                <span className="text-xs text-neutral-200 mt-1 block">
                  Bergamot & Lemon
                </span>
              </div>

              <div className="bg-[#242424] p-3 rounded-[5px] border border-[#333333]">
                <span className="text-[10px] text-[#faedcd] font-bold uppercase tracking-wider block">
                  Heart Notes
                </span>
                <span className="text-xs text-neutral-200 mt-1 block">
                  Rose & Lavender
                </span>
              </div>

              <div className="bg-[#242424] p-3 rounded-[5px] border border-[#333333]">
                <span className="text-[10px] text-[#faedcd] font-bold uppercase tracking-wider block">
                  Base Notes
                </span>
                <span className="text-xs text-neutral-200 mt-1 block">
                  Amber & Royal Oud
                </span>
              </div>
            </div>

            {/* Quick Benefits */}
            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-[#faedcd]" />
                <span>Extrait de Parfum concentration (12+ hours sillage)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-[#faedcd]" />
                <span>Fast 2-Hour Express Delivery in Doha</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                className="flex-1 h-12 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                <span>Add Amber Code to Bag</span>
              </Button>

              <Link href={`/product/${amberCodeProduct.slug}`} className="flex-1">
                <button className="btn-secondary w-full h-12 text-sm font-semibold bg-white/10 text-white border-white/20 hover:bg-white hover:text-[#1c1c1c] transition-all flex items-center justify-center gap-2">
                  <span>View Product Details</span>
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
