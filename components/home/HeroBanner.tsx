import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Clock, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HeroBanner() {
  return (
    <section className="relative bg-[#0d0d0d] text-white overflow-hidden py-20 lg:py-32 border-b border-[#2a2a2a]">
      {/* Background Ambient Glow & Gradient */}
      <div className="absolute inset-0 bg-radial from-[#382313]/40 via-transparent to-transparent opacity-80 pointer-events-none" />
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-[#b6713e]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-0 w-[500px] h-[500px] bg-[#faedcd]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="ramillette-container relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#241c16] border border-[#b6713e]/40 text-xs font-semibold text-[#faedcd]">
            <Sparkles size={14} className="text-[#faedcd]" />
            <span>Souq Al Wakra Flagship Perfumery • Doha, Qatar</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Luxury Fragrances <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#faedcd] via-[#e5c292] to-[#b6713e]">
              Crafted for Royalty
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Experience Ramillette's signature Arabian blends and world-class designer inspirations. Formulated with high-concentration perfume oils for unparalleled longevity and sillage.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/shop/best-sellers">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto h-13 px-8 text-base font-semibold shadow-lg shadow-[#b6713e]/20 flex items-center gap-2"
              >
                <span>Shop Best Sellers</span>
                <ArrowRight size={18} />
              </Button>
            </Link>

            <Link href="/product/amber-code-45">
              <button className="btn-secondary w-full sm:w-auto h-13 px-8 text-base font-semibold bg-white/10 text-white border-white/20 hover:bg-white hover:text-[#1c1c1c] transition-all">
                Discover Amber Code 80ml
              </button>
            </Link>
          </div>

          {/* Highlights Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 border-t border-[#262626] text-left">
            <div className="flex items-center gap-3 p-3 rounded-md bg-[#161616] border border-[#262626]">
              <Clock size={22} className="text-[#faedcd] shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">2-Hour Delivery</p>
                <p className="text-[11px] text-neutral-400">Express delivery in Doha</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-md bg-[#161616] border border-[#262626]">
              <Truck size={22} className="text-[#faedcd] shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Free Qatar Shipping</p>
                <p className="text-[11px] text-neutral-400">On all orders over QAR 900</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-md bg-[#161616] border border-[#262626]">
              <ShieldCheck size={22} className="text-[#faedcd] shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">100% Authentic</p>
                <p className="text-[11px] text-neutral-400">Premium fragrance oils</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
