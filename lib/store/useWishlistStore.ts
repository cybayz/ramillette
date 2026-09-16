import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  categoryName?: string;
}

interface WishlistStore {
  items: WishlistItem[];
  setItems: (items: WishlistItem[]) => void;
  mergeItems: (items: WishlistItem[]) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => set({ items }),

      mergeItems: (incomingItems) => {
        const currentItems = [...get().items];
        incomingItems.forEach((incoming) => {
          if (!currentItems.some((i) => i.productId === incoming.productId)) {
            currentItems.push(incoming);
          }
        });
        set({ items: currentItems });
      },

      toggleWishlist: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId);
        if (exists) {
          set({ items: get().items.filter((i) => i.productId !== item.productId) });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "ramillette_wishlist_storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
