import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string; // unique composite key: `${productId}_${variantId || 'default'}`
  productId: string;
  variantId?: string | null;
  name: string;
  variantName?: string | null;
  slug: string;
  price: number;
  basePriceQar?: number;
  country?: string;
  image: string;
  quantity: number;
  maxStock?: number;
}

export interface CouponState {
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  discountAmount: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  orderNote: string;
  coupon: CouponState | null;
  
  // Actions
  setItems: (items: CartItem[]) => void;
  mergeItems: (incomingItems: CartItem[]) => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setOrderNote: (note: string) => void;
  applyCoupon: (coupon: CouponState) => void;
  removeCoupon: () => void;
  recalculateForCountry: (countryCode: string) => void;

  // Computed
  getSubtotal: () => number;
  getTotalItems: () => number;
  getDiscountTotal: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      orderNote: "",
      coupon: null,

      setItems: (items) => set({ items }),

      mergeItems: (incomingItems) => {
        const currentItems = [...get().items];
        incomingItems.forEach((incoming) => {
          const id = incoming.id || `${incoming.productId}_${incoming.variantId || "default"}`;
          const existingIndex = currentItems.findIndex((item) => item.id === id);
          if (existingIndex > -1) {
            const max = incoming.maxStock ?? currentItems[existingIndex].maxStock ?? 99;
            currentItems[existingIndex].quantity = Math.min(
              currentItems[existingIndex].quantity + incoming.quantity,
              max
            );
          } else {
            currentItems.push({ ...incoming, id });
          }
        });
        set({ items: currentItems });
      },

      addItem: (newItem) => {
        const id = `${newItem.productId}_${newItem.variantId || "default"}`;
        const existingItems = get().items;
        const index = existingItems.findIndex((item) => item.id === id);
        const currentCountry = (newItem.country || "QA").toUpperCase();
        const baseQar =
          newItem.basePriceQar ??
          (currentCountry === "BH"
            ? newItem.price / 0.103
            : currentCountry === "AE"
            ? newItem.price / 1.01
            : newItem.price);

        if (index > -1) {
          const updated = [...existingItems];
          const newQty = updated[index].quantity + newItem.quantity;
          const max = newItem.maxStock ?? 99;
          updated[index].quantity = Math.min(newQty, max);
          set({ items: updated, isOpen: true });
        } else {
          set({
            items: [
              ...existingItems,
              {
                ...newItem,
                id,
                basePriceQar: baseQar,
                country: currentCountry,
              },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.min(quantity, item.maxStock ?? 99) }
              : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [], coupon: null, orderNote: "" });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      setOrderNote: (orderNote) => set({ orderNote }),

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),

      recalculateForCountry: (targetCountry: string) => {
        const countryUpper = targetCountry.toUpperCase();
        const currentItems = get().items;
        if (currentItems.length === 0) return;

        const updated = currentItems.map((item) => {
          const baseQar =
            item.basePriceQar ??
            (item.country === "BH"
              ? item.price / 0.103
              : item.country === "AE"
              ? item.price / 1.01
              : item.price);

          let newPrice = baseQar;
          if (countryUpper === "AE") {
            newPrice = Math.round(baseQar * 1.01);
          } else if (countryUpper === "BH") {
            newPrice = Number((baseQar * 0.103).toFixed(3));
          } else {
            newPrice = Number(baseQar.toFixed(2));
          }

          return {
            ...item,
            basePriceQar: baseQar,
            price: newPrice,
            country: countryUpper,
          };
        });

        set({ items: updated });
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getDiscountTotal: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().coupon;
        if (!coupon) return 0;
        if (coupon.type === "PERCENTAGE") {
          return (subtotal * coupon.value) / 100;
        }
        return Math.min(coupon.value, subtotal);
      },

      getFinalTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountTotal();
        return Math.max(0, subtotal - discount);
      },
    }),
    {
      name: "ramillette_cart_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        orderNote: state.orderNote,
        coupon: state.coupon,
      }),
    }
  )
);
