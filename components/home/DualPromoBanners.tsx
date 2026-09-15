"use client";

import React from "react";
import Link from "next/link";

export function DualPromoBanners() {
  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="ramillette-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Promo 1: Amber Code Spotlight */}
          <Link
            href="/products/amber-code-45"
            className="group relative block w-full aspect-[16/10] sm:aspect-[16/9] rounded-[20px] md:rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <picture className="w-full h-full">
              <source
                media="(max-width: 767px)"
                srcSet="/banners/amber_code_mob.png"
              />
              <img
                src="/banners/amber_code_desk.png"
                alt="Ramillette Amber Code Eau De Parfum"
                className="w-full h-full object-cover object-center transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </picture>
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
          </Link>

          {/* Promo 2: 10% OFF Promotion */}
          <Link
            href="/shop"
            className="group relative block w-full aspect-[16/10] sm:aspect-[16/9] rounded-[20px] md:rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <picture className="w-full h-full">
              <source
                media="(max-width: 767px)"
                srcSet="/banners/promo_10off_mob.png"
              />
              <img
                src="/banners/promo_10off_desk.png"
                alt="Purchase For QAR 200+ Get 10% OFF"
                className="w-full h-full object-cover object-center transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </picture>
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
          </Link>
        </div>
      </div>
    </section>
  );
}
