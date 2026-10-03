"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/useCartStore";

export function ClearCartOnSuccess() {
  const clearCart = useCartStore((s) => s.clearCart);
  const closeCart = useCartStore((s) => s.closeCart);

  useEffect(() => {
    closeCart();
    clearCart();
  }, [clearCart, closeCart]);

  return null;
}
