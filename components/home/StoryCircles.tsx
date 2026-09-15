"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import storiesData from "@/public/stories_data.json";

interface StoryItem {
  id: number;
  video: string;
  poster: string;
  thumb?: string;
}

export function StoryCircles() {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const stories: StoryItem[] = storiesData as StoryItem[];

  // Ensure all circular preview videos autoPlay continuously by default
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = true;
        video.play().catch(() => {
          // Autoplay fallback handled gracefully
        });
      }
    });
  }, []);

  // Keyboard navigation for modal player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveStoryIndex(null);
      if (e.key === "ArrowRight" && activeStoryIndex !== null) {
        handleNextStory();
      }
      if (e.key === "ArrowLeft" && activeStoryIndex !== null) {
        handlePrevStory();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStoryIndex]);

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  return (
    <section className="w-full py-2 sm:py-3 bg-white border-b border-[#f5f5f5]" aria-label="Stories and Reels">
      <div className="ramillette-container">
        {/* Horizontal Container Matching Live Site Wizup Structure */}
        <div
          role="presentation"
          className="flex items-center justify-start md:justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-2 px-1 select-none flex-nowrap"
        >
          {stories.map((story, index) => (
            <div
              key={story.id ?? index}
              className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              onClick={() => setActiveStoryIndex(index)}
              role="button"
              tabIndex={0}
              aria-label={`Watch story ${index + 1}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveStoryIndex(index);
                }
              }}
            >
              {/* Circular Border Wrapper */}
              <div
                className="story-circle-video-border p-[2px] rounded-full border border-neutral-300 group-hover:border-[#b6713e] transition-all duration-300 group-hover:shadow-md bg-white flex items-center justify-center"
                style={{ borderRadius: "50%" }}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  preload="auto"
                  autoPlay
                  loop
                  muted
                  playsInline
                  webkit-playsinline="true"
                  disableRemotePlayback
                  poster={story.poster}
                  src={story.video}
                  className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full object-cover block group-hover:scale-105 transition-transform duration-300"
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Story Video Reel Modal with Audio */}
      {activeStoryIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Story Video Player"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setActiveStoryIndex(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close story"
          >
            <X size={22} />
          </button>

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Previous Story Arrow */}
          {activeStoryIndex > 0 && (
            <button
              type="button"
              onClick={handlePrevStory}
              className="absolute left-2 sm:left-8 z-10 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white hidden md:flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Previous story"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          {/* Reel Video Card */}
          <div className="relative w-full max-w-[380px] h-[78vh] max-h-[680px] rounded-2xl overflow-hidden bg-black shadow-2xl flex items-center justify-center border border-white/10">
            {/* Story Progress Bars */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-1.5">
              {stories.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full overflow-hidden bg-white/30"
                >
                  <div
                    className={`h-full transition-all duration-300 ${
                      i === activeStoryIndex
                        ? "bg-white w-full"
                        : i < activeStoryIndex
                        ? "bg-white/80 w-full"
                        : "w-0"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Modal Video Player with Sound */}
            <video
              key={stories[activeStoryIndex]?.video}
              src={stories[activeStoryIndex]?.video}
              poster={stories[activeStoryIndex]?.poster}
              autoPlay
              playsInline
              muted={isMuted}
              onEnded={handleNextStory}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Next Story Arrow */}
          {activeStoryIndex < stories.length - 1 && (
            <button
              type="button"
              onClick={handleNextStory}
              className="absolute right-2 sm:right-8 z-10 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white hidden md:flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Next story"
            >
              <ChevronRight size={26} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
