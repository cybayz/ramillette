import React from "react";
import Link from "next/link";
import { Sparkles, MapPin, Award, ShieldCheck, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Ramillette Perfumes Qatar",
  description:
    "Learn about Ramillette Perfumes Qatar. An upscale regional fragrance house rooted in Souq Al Wakra, crafting artisanal oud, amber, and designer-inspired scents.",
};

export default function AboutUsPage() {
  return (
    <div className="bg-[#ffffff] min-h-screen py-12">
      <div className="ramillette-container max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">About Us</span>
        </nav>

        {/* Header Banner */}
        <div className="text-center space-y-4 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b6713e]">
            Our Story & Heritage
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1c1c1c] tracking-tight">
            The Ramillette Fragrance Difference
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            An upscale regional fragrance house blending traditional Middle Eastern oud, amber, and musk with contemporary European perfumery.
          </p>
        </div>

        {/* Story Section */}
        <div className="prose prose-neutral max-w-none space-y-8 text-sm sm:text-base text-neutral-700 leading-relaxed">
          <div className="p-8 rounded-[8px] bg-[#fbf9f5] border border-[#ecdec1]">
            <h2 className="text-xl font-bold text-[#1c1c1c] mb-3 flex items-center gap-2">
              <Sparkles size={20} className="text-[#b6713e]" />
              <span>Rooted in Souq Al Wakra, Qatar</span>
            </h2>
            <p>
              Born in the historic maritime heritage of <strong>Souq Al Wakra</strong>, Ramillette was established to provide Qatar's fragrance connoisseurs with high-concentration perfumes that bridge timeless Arabian heritage and European elegance. From our boutique overlooking the Arabian Gulf, we formulate each scent with exceptional perfume oil ratios, guaranteeing 12+ hours of sillage and longevity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="p-6 rounded-[8px] border border-[#e5e5e5] text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#faedcd] text-[#b6713e] flex items-center justify-center mx-auto">
                <Award size={22} />
              </div>
              <h3 className="text-sm font-bold text-[#1c1c1c]">Parfum Concentration</h3>
              <p className="text-xs text-neutral-500">
                Formulated at high extrait concentration for intense projection that lasts throughout the day and evening.
              </p>
            </div>

            <div className="p-6 rounded-[8px] border border-[#e5e5e5] text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#faedcd] text-[#b6713e] flex items-center justify-center mx-auto">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-sm font-bold text-[#1c1c1c]">Authentic Oils</h3>
              <p className="text-xs text-neutral-500">
                Ethically sourced Cambodian and royal Assam oud, Spanish labdanum, and premium French botanical essences.
              </p>
            </div>

            <div className="p-6 rounded-[8px] border border-[#e5e5e5] text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#faedcd] text-[#b6713e] flex items-center justify-center mx-auto">
                <Heart size={22} />
              </div>
              <h3 className="text-sm font-bold text-[#1c1c1c]">2-Hour Doha Delivery</h3>
              <p className="text-xs text-neutral-500">
                Express courier delivery directly to your villa or office across Doha, Al Wakrah, and Lusail.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1c1c1c]">Our Flagship: Amber Code</h2>
            <p>
              Amber Code represents the pinnacle of Ramillette’s artisanal mastery. Designed specifically for the warm Qatar climate, it harmonizes crisp Italian bergamot and pink pepper with intense ambergris, aged agarwood, and Bourbon vanilla. It has become one of Doha’s most recognizable signature scents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
