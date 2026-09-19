"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CountryCode, DEFAULT_COUNTRY, COUNTRIES, isValidCountry, CountryConfig } from "@/lib/country/config";

interface CountryState {
  country: string;
  config: CountryConfig;
  availableCountries: CountryConfig[];
  setCountry: (country: string) => void;
  loadCountries: () => Promise<void>;
}

export const useCountryStore = create<CountryState>()(
  persist(
    (set, get) => ({
      country: DEFAULT_COUNTRY,
      config: COUNTRIES[DEFAULT_COUNTRY],
      availableCountries: Object.values(COUNTRIES),

      loadCountries: async () => {
        try {
          const res = await fetch("/api/countries");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.countries) && data.countries.length > 0) {
              set({ availableCountries: data.countries });
              // Update active config if current country exists in new list
              const currentCode = get().country;
              const matching = data.countries.find((c: any) => c.code === currentCode);
              if (matching) {
                set({ config: matching });
              }
            }
          }
        } catch (e) {
          // ignore network failure, fallback is active
        }
      },

      setCountry: (newCountry: string) => {
        const upper = (newCountry || DEFAULT_COUNTRY).toUpperCase();
        const available = get().availableCountries;
        const matching = available.find((c) => c.code === upper) || COUNTRIES[DEFAULT_COUNTRY];

        if (typeof document !== "undefined") {
          document.cookie = `ramillette_country=${upper}; path=/; max-age=31536000; SameSite=Lax`;
        }

        set({
          country: upper,
          config: matching,
        });

        // Recalculate cart prices for new country
        try {
          const { useCartStore } = require("@/lib/store/useCartStore");
          useCartStore.getState().recalculateForCountry(upper as any);
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
          const match = document.cookie.match(/(^|;)\s*ramillette_country=([^;]+)/);
          const cookieVal = match ? match[2] : null;
          if (cookieVal) {
            if (state && state.country !== cookieVal) {
              state.setCountry(cookieVal);
            }
          } else if (state?.country) {
            document.cookie = `ramillette_country=${state.country}; path=/; max-age=31536000; SameSite=Lax`;
          }
          // Also asynchronously refresh available countries
          if (state?.loadCountries) {
            state.loadCountries();
          }
        }
      },
    }
  )
);
