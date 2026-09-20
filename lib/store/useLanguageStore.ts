"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Language, translations } from "@/lib/i18n";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: () => typeof translations.en;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "en",
      setLanguage: (lang: Language) => {
        set({ language: lang });
        if (typeof document !== "undefined") {
          document.documentElement.lang = lang;
          document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        }
      },
      toggleLanguage: () => {
        const nextLang: Language = get().language === "en" ? "ar" : "en";
        get().setLanguage(nextLang);
      },
      t: () => {
        const lang = get().language;
        return translations[lang] || translations.en;
      },
    }),
    {
      name: "ramillette-language",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : {
          getItem: () => null,
          setItem: () => null,
          removeItem: () => null,
        }
      ),
      onRehydrateStorage: () => (state) => {
        if (typeof document !== "undefined" && state) {
          requestAnimationFrame(() => {
            document.documentElement.lang = state.language;
            document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr";
          });
        }
      },
    }
  )
);
