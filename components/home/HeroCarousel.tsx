"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlideData {
  id: string;
  desktopImage: string;
  mobileImage: string;
  alt: string;
  link: string;
}

const slides: SlideData[] = [
  {
    id: "s1",
    desktopImage: "/hero/slide3.jpg",
    mobileImage: "/hero/slide3_mob.jpg",
    alt: "Where Fragrance Becomes Identity - Ramillette Luxury Perfumes",
    link: "/shop",
  },
  {
    id: "s2",
    desktopImage: "/hero/slide2.jpg",
    mobileImage: "/hero/slide2_mob.jpg",
    alt: "10% OFF On Purchases of QAR 200+ - Ramillette",
    link: "/shop/inspired",
  },
  {
    id: "s3",
    desktopImage: "/hero/slide1.jpg",
    mobileImage: "/hero/slide1_mob.jpg",
    alt: "Luxury Perfumes Designed to Leave a Lasting Impression - Amber Code",
    link: "/product/amber-code-45",
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Autoplay every 7 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section
      className="w-full py-2 sm:py-4 bg-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero Carousel"
    >
      <div className="ramillette-container">
        {/* Main Carousel Card with Rounded Borders */}
        <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-sm aspect-[16/9] md:aspect-[2.35/1] max-h-[580px] bg-[#f7f4ed]">
          {/* Slides Track */}
          <div className="relative w-full h-full">
            {slides.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <Link href={slide.link} className="block w-full h-full relative cursor-pointer">
                    {/* Desktop Image */}
                    <Image
                      src={slide.desktopImage}
                      alt={slide.alt}
                      fill
                      unoptimized
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 1440px"
                      className="hidden md:block object-cover object-center"
                    />
                    {/* Mobile Image */}
                    <Image
                      src={slide.mobileImage}
                      alt={slide.alt}
                      fill
                      unoptimized
                      priority={index === 0}
                      sizes="100vw"
                      className="block md:hidden object-cover object-center"
                    />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              prevSlide();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-[#1c1c1c] shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} className="stroke-[2.2]" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              nextSlide();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-[#1c1c1c] shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight size={22} className="stroke-[2.2]" />
          </button>

          {/* Bottom Dot Indicators */}
          <div className="absolute bottom-3 sm:bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  index === currentSlide
                    ? "w-7 h-2 bg-[#1c1c1c]"
                    : "w-2 h-2 bg-[#1c1c1c]/30 hover:bg-[#1c1c1c]/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
