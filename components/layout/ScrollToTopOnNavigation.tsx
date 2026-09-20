"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTopOnNavigation() {
  const pathname = usePathname();

  useEffect(() => {
    // If navigating to a specific hash anchor (e.g. #orders), let it scroll to target smoothly
    if (window.location.hash) {
      const targetId = window.location.hash.slice(1);
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    // Otherwise reset window to top cleanly
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
