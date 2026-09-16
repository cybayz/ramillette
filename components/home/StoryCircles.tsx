"use client";

import React, { useState, useEffect, useRef } from "react";
import storiesData from "@/public/stories_data.json";
import { ReelModalPlayer } from "./ReelModalPlayer";

interface StoryItem {
  id: number;
  video: string;
  poster: string;
  thumb?: string;
}

export function StoryCircles() {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
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

      {/* 3-Card Video Reel Modal with Audio */}
      <ReelModalPlayer
        isOpen={activeStoryIndex !== null}
        items={stories}
        initialIndex={activeStoryIndex ?? 0}
        onClose={() => setActiveStoryIndex(null)}
      />
    </section>
  );
}
