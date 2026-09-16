import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useCartStore } from "./useCartStore";
import { useWishlistStore } from "./useWishlistStore";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role?: string;
}

interface AuthStore {
  user: AuthUser | null;
  isLoaded: boolean;
  setUser: (user: AuthUser | null) => void;
  checkAuth: () => Promise<AuthUser | null>;
  logout: (locale?: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoaded: false,

      setUser: (user) => set({ user, isLoaded: true }),

      checkAuth: async () => {
        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const data = await res.json();
            set({ user: data.user || null, isLoaded: true });
            return data.user || null;
          } else {
            set({ user: null, isLoaded: true });
            return null;
          }
        } catch {
          set({ user: null, isLoaded: true });
          return null;
        }
      },

      logout: async (locale = "en") => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("Logout error:", e);
        }

        // 1. Reset user state
        set({ user: null, isLoaded: true });

        // 2. Make cart and wishlist back to 0
        useCartStore.getState().clearCart();
        useWishlistStore.getState().clearWishlist();

        // 3. Clean redirect to login
        const redirectTarget = locale === "ar" ? "/ar/account/login" : "/account/login";
        window.location.href = redirectTarget;
      },
    }),
    {
      name: "ramillette_auth_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
