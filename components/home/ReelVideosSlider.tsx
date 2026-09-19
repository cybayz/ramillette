"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { ReelModalPlayer } from "./ReelModalPlayer";
import { useCountryStore } from "@/lib/store/useCountryStore";
import { useLanguageStore } from "@/lib/store/useLanguageStore";

interface ReelItem {
  id: number;
  thumb: string;
  video: string;
  title: string;
  desc?: string;
  country?: "QA" | "AE" | "BH" | "ALL";
}

const ALL_REELS: ReelItem[] = [
  // Qatar Reels
  {
    id: 0,
    thumb: "/reels/reel_thumb_0.jpeg",
    video: "/reels/reel_0.mp4",
    title: "School’s Back Savings 🎒✨",
    desc: "Time to smell fresh, feel confident & start the new school year in style! Enjoy 10% OFF on all perfumes in Qatar.",
    country: "QA",
  },
  {
    id: 1,
    thumb: "/reels/reel_thumb_1.jpeg",
    video: "/reels/reel_1.mp4",
    title: "Customer Love at Al Wakra Souq 🤍✨",
    desc: "Nothing means more to us than hearing from our wonderful customers. Visit us at Al Wakra Old Souq, Qatar.",
    country: "QA",
  },
  {
    id: 5,
    thumb: "/reels/reel_thumb_5.jpeg",
    video: "/reels/reel_5.mp4",
    title: "The Spirit of Qatar 🇶🇦",
    desc: "Traditional aromatic Arabian heritage infused with fine French perfumery notes.",
    country: "QA",
  },
  {
    id: 7,
    thumb: "/reels/reel_thumb_7.jpeg",
    video: "/reels/reel_7.mp4",
    title: "Exclusive Boutique Experience 🏛️",
    desc: "Step inside our marquee showroom at historic Souq Al Wakra, Qatar.",
    country: "QA",
  },

  // UAE Reels
  {
    id: 10,
    thumb: "/reels/reel_thumb_2.jpeg",
    video: "/reels/reel_2.mp4",
    title: "The Spirit of the Emirates 🇦🇪✨",
    desc: "Crafted in the UAE with exceptional French perfume oils. Turning heads from Downtown Dubai to Palm Jumeirah.",
    country: "AE",
  },
  {
    id: 11,
    thumb: "/reels/reel_thumb_1.jpeg",
    video: "/reels/reel_1.mp4",
    title: "Customer Love across Dubai & Abu Dhabi 🤍✨",
    desc: "Unboxing luxury with our patrons in Dubai, Abu Dhabi & Sharjah. Extreme sillage that lasts all day.",
    country: "AE",
  },
  {
    id: 12,
    thumb: "/reels/reel_thumb_6.jpeg",
    video: "/reels/reel_6.mp4",
    title: "Next-Day UAE Delivery 🚀",
    desc: "Dispatched promptly across all 7 Emirates with easy Tabby split-payments and card checkout.",
    country: "AE",
  },

  // Bahrain Reels
  {
    id: 20,
    thumb: "/reels/reel_thumb_5.jpeg",
    video: "/reels/reel_5.mp4",
    title: "The Heritage of Bahrain 🇧🇭✨",
    desc: "Timeless Arabian perfumery heritage meeting contemporary French sillage in the heart of the Kingdom.",
    country: "BH",
  },
  {
    id: 21,
    thumb: "/reels/reel_thumb_1.jpeg",
    video: "/reels/reel_1.mp4",
    title: "Customer Love across Manama & Riffa 🤍✨",
    desc: "Delighted fragrance collectors across Bahrain praising Ramillette's intense projection and luxury packaging.",
    country: "BH",
  },
  {
    id: 22,
    thumb: "/reels/reel_thumb_6.jpeg",
    video: "/reels/reel_6.mp4",
    title: "BenefitPay & Fast Bahrain Delivery 📦",
    desc: "Instant QR checkout with BenefitPay and same-day express delivery across Manama and Riffa.",
    country: "BH",
  },

  // Universal Fragrance Reels
  {
    id: 2,
    thumb: "/reels/reel_thumb_2.jpeg",
    video: "/reels/reel_2.mp4",
    title: "Unboxing Everyday Luxury ✨",
    desc: "At Ramillette Perfumes, every fragrance is crafted to leave a lasting impression.",
    country: "ALL",
  },
  {
    id: 3,
    thumb: "/reels/reel_thumb_3.jpeg",
    video: "/reels/reel_3.mp4",
    title: "AMBER CODE by Ramillette 🖤✨",
    desc: "Bold. Warm. Unforgettable. A signature scent made to leave a lasting impression.",
    country: "ALL",
  },
  {
    id: 4,
    thumb: "/reels/reel_thumb_4.jpeg",
    video: "/reels/reel_4.mp4",
    title: "Signature Sillage & Elegance 🌸",
    desc: "Pure concentrated fragrance oils formulated for exceptional longevity throughout the day.",
    country: "ALL",
  },
  {
    id: 8,
    thumb: "/reels/reel_thumb_8.jpeg",
    video: "/reels/reel_8.mp4",
    title: "Discover Your Signature Scent ✨",
    desc: "Over 50+ exquisite perfumes designed for every season and occasion.",
    country: "ALL",
  },
];

export function ReelVideosSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const { country } = useCountryStore();
  const { language } = useLanguageStore();
  const isAr = language === "ar";

  // Filter reels for active country or universal reels
  const reels = ALL_REELS.filter(
    (r) => r.country === country || r.country === "ALL"
  );

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -350 : 350;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const openReel = (index: number) => {
    setActiveModalIndex(index);
  };

  const closeReel = () => {
    setActiveModalIndex(null);
  };

  return (
    <section className="py-6 md:py-8 bg-white relative">
      <div className="ramillette-container">
        <div className="relative group">
          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {reels.map((reel, idx) => (
              <div
                key={reel.id}
                onClick={() => openReel(idx)}
                className="snap-start flex-none w-[170px] sm:w-[190px] md:w-[210px] aspect-[9/16] rounded-2xl overflow-hidden relative cursor-pointer group/card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-neutral-900 border border-neutral-800"
              >
                {/* Thumbnail Image */}
                <img
                  src={reel.thumb}
                  alt={reel.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                  loading="lazy"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

                {/* Play Button Icon */}
                <div className="absolute top-3.5 right-3.5 z-10 w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover/card:bg-white group-hover/card:text-black transition-colors">
                  <Play size={12} className="fill-current ml-0.5" />
                </div>

                {/* Video Info Overlay at Bottom */}
                <div className="absolute bottom-0 inset-x-0 p-3 text-white z-10">
                  <h4 className="font-heading font-semibold text-xs sm:text-sm line-clamp-1 drop-shadow-sm">
                    {reel.title}
                  </h4>
                  {reel.desc && (
                    <p className="text-[10px] sm:text-[11px] text-neutral-300 line-clamp-2 mt-0.5 leading-snug drop-shadow-xs">
                      {reel.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="hidden md:flex items-center justify-center absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 text-neutral-900 shadow-md border border-neutral-200 hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-0 group-hover:opacity-100 duration-200"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="hidden md:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 text-neutral-900 shadow-md border border-neutral-200 hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-0 group-hover:opacity-100 duration-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Full Screen Story / Reel Modal Player */}
      <ReelModalPlayer
        isOpen={activeModalIndex !== null}
        items={reels}
        initialIndex={activeModalIndex ?? 0}
        onClose={closeReel}
      />
    </section>
  );
}
