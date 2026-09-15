"use client";

import React from "react";
import Link from "next/link";

export function FeaturedCollectionsBanners() {
  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="ramillette-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Card 1: Own Brand Collection */}
          <Link
            href="/shop/own-brand"
            className="group relative block w-full aspect-[16/10] sm:aspect-[16/9] rounded-[20px] md:rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <picture className="w-full h-full">
              <source
                media="(max-width: 767px)"
                srcSet="/banners/own_brand_mob.png"
              />
              <img
                src="/banners/own_brand_desk.png"
                alt="Own Brand Collection"
                className="w-full h-full object-cover object-center transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </picture>
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
          </Link>

          {/* Card 2: Inspired Collection */}
          <Link
            href="/shop/inspired"
            className="group relative block w-full aspect-[16/10] sm:aspect-[16/9] rounded-[20px] md:rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <picture className="w-full h-full">
              <source
                media="(max-width: 767px)"
                srcSet="/banners/inspired_mob.png"
              />
              <img
                src="/banners/inspired_desk.png"
                alt="Inspired Collection"
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
