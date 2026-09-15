"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Volume2, VolumeX, Play, Pause } from "lucide-react";

interface ReelItem {
  id: number;
  thumb: string;
  video: string;
  title: string;
  desc?: string;
}

const REELS: ReelItem[] = [
  {
    id: 0,
    thumb: "/reels/reel_thumb_0.jpeg",
    video: "/reels/reel_0.mp4",
    title: "School’s Back Savings 🎒✨",
    desc: "Time to smell fresh, feel confident & start the new school year in style! Enjoy 10% OFF on all perfumes.",
  },
  {
    id: 1,
    thumb: "/reels/reel_thumb_1.jpeg",
    video: "/reels/reel_1.mp4",
    title: "Customer Love at Al Wakra Souq 🤍✨",
    desc: "Nothing means more to us than hearing from our wonderful customers. Visit us at Al Wakra Old Souq, Qatar.",
  },
  {
    id: 2,
    thumb: "/reels/reel_thumb_2.jpeg",
    video: "/reels/reel_2.mp4",
    title: "Unboxing Everyday Luxury ✨",
    desc: "At Ramillette Perfumes, every fragrance is crafted to leave a lasting impression.",
  },
  {
    id: 3,
    thumb: "/reels/reel_thumb_3.jpeg",
    video: "/reels/reel_3.mp4",
    title: "AMBER CODE by Ramillette 🖤✨",
    desc: "Bold. Warm. Unforgettable. A signature scent made to leave a lasting impression.",
  },
  {
    id: 4,
    thumb: "/reels/reel_thumb_4.jpeg",
    video: "/reels/reel_4.mp4",
    title: "Signature Sillage & Elegance 🌸",
    desc: "Pure concentrated fragrance oils formulated for exceptional longevity throughout the day.",
  },
  {
    id: 5,
    thumb: "/reels/reel_thumb_5.jpeg",
    video: "/reels/reel_5.mp4",
    title: "The Spirit of Qatar 🇶🇦",
    desc: "Traditional aromatic Arabian heritage infused with fine French perfumery notes.",
  },
  {
    id: 6,
    thumb: "/reels/reel_thumb_6.jpeg",
    video: "/reels/reel_6.mp4",
    title: "Artisanal Blends & Packaging 🎁",
    desc: "Every order is packaged with utmost care and dispatched quickly across Qatar.",
  },
  {
    id: 7,
    thumb: "/reels/reel_thumb_7.jpeg",
    video: "/reels/reel_7.mp4",
    title: "Exclusive Boutique Experience 🏛️",
    desc: "Step inside our marquee showroom at historic Souq Al Wakra.",
  },
  {
    id: 8,
    thumb: "/reels/reel_thumb_8.jpeg",
    video: "/reels/reel_8.mp4",
    title: "Discover Your Signature Scent ✨",
    desc: "Over 50+ exquisite perfumes designed for every season and occasion.",
  },
];

export function ReelVideosSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -350 : 350;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const openReel = (index: number) => {
    setActiveModalIndex(index);
    setIsMuted(false);
    setIsPlaying(true);
  };

  const closeReel = () => {
    setActiveModalIndex(null);
  };

  // Keyboard navigation for reel modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModalIndex === null) return;
      if (e.key === "Escape") closeReel();
      if (e.key === "ArrowRight") {
        setActiveModalIndex((prev) =>
          prev !== null ? (prev + 1) % REELS.length : null
        );
      }
      if (e.key === "ArrowLeft") {
        setActiveModalIndex((prev) =>
          prev !== null ? (prev - 1 + REELS.length) % REELS.length : null
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalIndex]);

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
            {REELS.map((reel, idx) => (
              <div
                key={reel.id}
                onClick={() => openReel(idx)}
                className="relative flex-shrink-0 w-[150px] sm:w-[185px] md:w-[210px] aspect-[9/16] rounded-[16px] overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group/card snap-start bg-[#1a1a1a]"
              >
                {/* Background Video (muted autoplay loop) */}
                <video
                  src={reel.video}
                  poster={reel.thumb}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20 group-hover/card:from-black/80 transition-colors pointer-events-none" />

                {/* Subtle Play Icon indicator */}
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 group-hover/card:scale-110 transition-transform">
                  <Play size={13} fill="white" className="ml-0.5" />
                </div>

                {/* Bottom Title snippet */}
                <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                  <p className="text-[12px] font-medium leading-snug line-clamp-2 drop-shadow-md">
                    {reel.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="hidden md:flex absolute left-[-16px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 border border-neutral-200 shadow-md items-center justify-center text-neutral-700 hover:text-black hover:bg-white hover:scale-105 transition-all active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-[-10px] md:right-[-16px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 border border-neutral-200 shadow-md flex items-center justify-center text-neutral-700 hover:text-black hover:bg-white hover:scale-105 transition-all active:scale-95"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      {activeModalIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeReel}
        >
          <div
            className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video */}
            <video
              ref={modalVideoRef}
              src={REELS[activeModalIndex].video}
              poster={REELS[activeModalIndex].thumb}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="absolute inset-0 w-full h-full object-cover"
              onClick={() => {
                if (modalVideoRef.current) {
                  if (isPlaying) {
                    modalVideoRef.current.pause();
                    setIsPlaying(false);
                  } else {
                    modalVideoRef.current.play();
                    setIsPlaying(true);
                  }
                }
              }}
            />

            {/* Top Bar Controls */}
            <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
              <span className="text-xs font-semibold text-white/90 uppercase tracking-widest">
                Ramillette Moments
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button
                  onClick={closeReel}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Play/Pause center overlay indicator */}
            {!isPlaying && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
                  <Play size={28} fill="white" className="ml-1" />
                </div>
              </div>
            )}

            {/* Bottom Info Bar */}
            <div className="relative z-10 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white space-y-2">
              <h3 className="font-bold text-sm tracking-wide">
                {REELS[activeModalIndex].title}
              </h3>
              <p className="text-xs text-white/80 leading-relaxed line-clamp-3">
                {REELS[activeModalIndex].desc}
              </p>
              <div className="pt-2 flex items-center justify-between">
                <a
                  href="/shop"
                  className="inline-block px-4 py-2 bg-white text-black font-semibold text-xs rounded-full shadow hover:bg-[#faedcd] transition-colors"
                >
                  Shop Now
                </a>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setActiveModalIndex(
                        (activeModalIndex - 1 + REELS.length) % REELS.length
                      )
                    }
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveModalIndex(
                        (activeModalIndex + 1) % REELS.length
                      )
                    }
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
