"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CountryCode, DEFAULT_COUNTRY, COUNTRIES, isValidCountry, CountryConfig } from "@/lib/country/config";

interface CountryState {
  country: CountryCode;
  config: CountryConfig;
  setCountry: (country: CountryCode) => void;
}

export const useCountryStore = create<CountryState>()(
  persist(
    (set) => ({
      country: DEFAULT_COUNTRY,
      config: COUNTRIES[DEFAULT_COUNTRY],
      setCountry: (newCountry: CountryCode) => {
        const valid = isValidCountry(newCountry) ? newCountry : DEFAULT_COUNTRY;
        if (typeof document !== "undefined") {
          document.cookie = `ramillette_country=${valid}; path=/; max-age=31536000; SameSite=Lax`;
        }
        set({
          country: valid,
          config: COUNTRIES[valid],
        });
        // Recalculate cart prices for new country
        try {
          const { useCartStore } = require("@/lib/store/useCartStore");
          useCartStore.getState().recalculateForCountry(valid);
        } catch {
          // ignore circular reference on initial module load
        }
      },
    }),
    {
      name: "ramillette-country",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => null,
              removeItem: () => null,
            }
      ),
      onRehydrateStorage: () => (state) => {
        if (typeof document !== "undefined") {
          // If a cookie exists, prioritize cookie or synchronize
          const match = document.cookie.match(/(^|;)\s*ramillette_country=([^;]+)/);
          const cookieVal = match ? match[2] : null;
          if (cookieVal && isValidCountry(cookieVal)) {
            if (state && state.country !== cookieVal) {
              state.setCountry(cookieVal);
            }
          } else if (state?.country) {
            document.cookie = `ramillette_country=${state.country}; path=/; max-age=31536000; SameSite=Lax`;
          }
        }
      },
    }
  )
);
