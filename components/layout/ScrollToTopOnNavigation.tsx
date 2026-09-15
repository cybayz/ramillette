"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTopOnNavigation() {
  const pathname = usePathname();

  useEffect(() => {
    // Instantly scroll window to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 10);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
