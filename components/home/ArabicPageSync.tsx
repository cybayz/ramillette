"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/lib/store/useLanguageStore";

export function ArabicPageSync() {
  const { setLanguage } = useLanguageStore();

  useEffect(() => {
    setLanguage("ar");
    if (typeof document !== "undefined") {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
    }
  }, [setLanguage]);

  return null;
}
