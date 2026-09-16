"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Volume2, VolumeX, Play, Pause, Check } from "lucide-react";

export interface ModalVideoItem {
  id: number | string;
  video: string;
  thumb?: string;
  poster?: string;
  title?: string;
  desc?: string;
}

interface ReelModalPlayerProps {
  isOpen: boolean;
  items: ModalVideoItem[];
  initialIndex?: number;
  onClose: () => void;
}

export function ReelModalPlayer({
  isOpen,
  items,
  initialIndex = 0,
  onClose,
}: ReelModalPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync index when opened and ensure unmuted
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsPlaying(true);
      setIsMuted(false);
      setProgress(0);
    }
  }, [isOpen, initialIndex]);

  // URL hash synchronization (#vizup-player) matching live site
  useEffect(() => {
    if (!isOpen) return;

    if (window.location.hash !== "#vizup-player") {
      window.history.pushState(
        null,
        "",
        window.location.pathname + window.location.search + "#vizup-player"
      );
    }

    const handleHashChange = () => {
      if (window.location.hash !== "#vizup-player") {
        onClose();
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      if (window.location.hash === "#vizup-player") {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
    };
  }, [isOpen, onClose]);

  // Handle next and previous
  const handleNext = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setProgress(0);
    setIsPlaying(true);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setProgress(0);
    setIsPlaying(true);
  }, [items.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m") {
        e.preventDefault();
        toggleAudio();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, isMuted, isPlaying]);

  // Autoplay with audio when video index or open state changes
  useEffect(() => {
    if (!isOpen) return;

    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.muted = isMuted;
    video.volume = 1.0;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Autoplay with audio was restricted, attempting muted fallback:", err);
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    }
  }, [currentIndex, isOpen]);

  // Handle mute state toggle directly on video
  const toggleAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    if (!nextMuted) {
      video.volume = 1.0;
    }
    setIsMuted(nextMuted);
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      const pct = (video.currentTime / video.duration) * 100;
      setProgress(pct);
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = window.location.href.split("#")[0] + "#vizup-player";
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ramillette Perfumes - Fragrance Moments",
          url: shareUrl,
        });
      } catch {
        // Cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback
      }
    }
  };

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const prevIndex = (currentIndex - 1 + items.length) % items.length;
  const nextIndex = (currentIndex + 1) % items.length;
  const prevItem = items[prevIndex];
  const nextItem = items[nextIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ramillette Video Player"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* 3-Card Carousel Container matching Live Vizup player */}
      <div
        className="relative flex items-center justify-center w-full h-full max-w-6xl px-4 sm:px-8 md:px-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Previous video"
          className="absolute left-2 sm:left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/75 border border-white/20 active:scale-95 text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all cursor-pointer"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Previous Video Card (Left preview) */}
        {prevItem && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="hidden md:flex flex-col relative w-[180px] lg:w-[240px] xl:w-[270px] h-[58vh] lg:h-[65vh] rounded-2xl overflow-hidden opacity-40 hover:opacity-75 transition-all duration-300 cursor-pointer shadow-2xl scale-95 hover:scale-100 bg-[#111111] -mr-8 lg:-mr-12 z-10 border border-white/10 shrink-0"
          >
            <video
              key={`prev_${prevItem.video}`}
              src={prevItem.video}
              poster={prevItem.thumb || prevItem.poster}
              muted
              playsInline
              autoPlay
              loop
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />
          </div>
        )}

        {/* Center Active Video Card */}
        <div
          className="relative z-20 w-full max-w-[340px] sm:max-w-[380px] md:max-w-[400px] h-[75vh] sm:h-[80vh] max-h-[720px] bg-black rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] flex flex-col justify-between border border-white/15 ring-1 ring-white/10 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Edge Animated White Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/20 z-40 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Top Bar Controls */}
          <div className="absolute top-0 inset-x-0 z-30 pt-3.5 px-3.5 pb-6 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between text-white pointer-events-auto">
            {/* Top Left: Close & Curved Share */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close player"
                className="w-9 h-9 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <X size={20} className="stroke-[2.2]" />
              </button>

              <button
                type="button"
                onClick={handleShare}
                aria-label="Share reel"
                className="w-9 h-9 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 relative"
              >
                {copied ? (
                  <Check size={18} className="text-emerald-400" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                  >
                    <path d="M14 8V4l8 8-8 8v-4c-6.6 0-11.3 2.1-14.7 7 1.3-6.5 5.3-13 14.7-15z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Top Right: Volume Audio Toggle & Pause / Play */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAudio}
                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isMuted
                    ? "bg-black/35 text-neutral-300 hover:bg-black/60 hover:text-white"
                    : "bg-white/20 text-white hover:bg-white/35 ring-1 ring-white/30"
                }`}
              >
                {isMuted ? (
                  <VolumeX size={20} className="stroke-[2.2]" />
                ) : (
                  <Volume2 size={20} className="stroke-[2.2]" />
                )}
              </button>

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="w-9 h-9 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                {isPlaying ? (
                  <Pause size={18} fill="currentColor" />
                ) : (
                  <Play size={18} fill="currentColor" className="ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Center Main Video Element with Audio */}
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              key={`active_${currentItem.video}`}
              src={currentItem.video}
              poster={currentItem.thumb || currentItem.poster}
              autoPlay
              playsInline
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onClick={togglePlay}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Center Play Indicator when paused */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 cursor-pointer transition-opacity"
              >
                <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-2xl hover:scale-105 transition-transform">
                  <Play size={28} fill="white" className="ml-1" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Video Card (Right preview) */}
        {nextItem && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="hidden md:flex flex-col relative w-[180px] lg:w-[240px] xl:w-[270px] h-[58vh] lg:h-[65vh] rounded-2xl overflow-hidden opacity-40 hover:opacity-75 transition-all duration-300 cursor-pointer shadow-2xl scale-95 hover:scale-100 bg-[#111111] -ml-8 lg:-ml-12 z-10 border border-white/10 shrink-0"
          >
            <video
              key={`next_${nextItem.video}`}
              src={nextItem.video}
              poster={nextItem.thumb || nextItem.poster}
              muted
              playsInline
              autoPlay
              loop
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />
          </div>
        )}

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next video"
          className="absolute right-2 sm:right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/75 border border-white/20 active:scale-95 text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all cursor-pointer"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
