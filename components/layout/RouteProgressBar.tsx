"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function RouteProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Complete progress on route change
  useEffect(() => {
    if (isVisible) {
      setProgress(100);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
      completeTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setProgress(0), 200);
      }, 180);
    }
  }, [pathname, searchParams]);

  // Global link click listener for instant feedback
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore hash links on current page, external links, mailto, tel, downloads
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.hasAttribute("download") ||
        target.getAttribute("target") === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if same origin and different URL
      try {
        const currentUrl = new URL(window.location.href);
        const destinationUrl = new URL(href, window.location.href);

        if (
          destinationUrl.origin === currentUrl.origin &&
          (destinationUrl.pathname !== currentUrl.pathname ||
            destinationUrl.search !== currentUrl.search)
        ) {
          // Start progress immediately
          if (timerRef.current) clearTimeout(timerRef.current);
          if (completeTimerRef.current) clearTimeout(completeTimerRef.current);

          setIsVisible(true);
          setProgress(25);

          timerRef.current = setTimeout(() => {
            setProgress((prev) => (prev < 80 ? prev + 35 : prev));
          }, 120);
        }
      } catch {
        // Ignore invalid URLs
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-[2.5px] shadow-[0_0_8px_rgba(182,113,62,0.6)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "150ms" : "250ms",
          background: "linear-gradient(90deg, #465947 0%, #b6713e 60%, #ecdec1 100%)",
        }}
      />
    </div>
  );
}

export function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <RouteProgressBarInner />
    </Suspense>
  );
}
