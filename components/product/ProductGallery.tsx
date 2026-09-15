"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageItem {
  url: string;
  alt?: string | null;
}

interface ProductGalleryProps {
  images: ImageItem[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const activeImage =
    images[selectedIdx]?.url ||
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails list */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 py-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={cn(
                "relative w-16 h-16 sm:w-20 sm:h-20 rounded-[4px] bg-[#fbf9f5] border transition-all overflow-hidden cursor-pointer",
                selectedIdx === idx
                  ? "border-[#b6713e] ring-2 ring-[#faedcd]"
                  : "border-[#e5e5e5] hover:border-neutral-400"
              )}
            >
              <Image
                src={img.url}
                alt={`${productName} view ${idx + 1}`}
                fill
                className="object-contain p-1"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Large Image with Zoom Effect */}
      <div
        className="relative flex-1 aspect-square bg-[#fbf9f5] rounded-[6px] border border-[#e5e5e5] overflow-hidden cursor-crosshair"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          className={cn(
            "object-contain p-4 transition-transform duration-200",
            isZoomed ? "opacity-0" : "opacity-100"
          )}
          sizes="(max-width: 768px) 100vw, 550px"
        />

        {/* Zoomed Lens Layer */}
        {isZoomed && (
          <div
            className="absolute inset-0 bg-no-repeat pointer-events-none"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
              backgroundSize: "200%",
            }}
          />
        )}
      </div>
    </div>
  );
}
