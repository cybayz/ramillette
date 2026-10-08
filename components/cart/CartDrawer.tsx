"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";
import { Drawer } from "@/lib/../components/ui/Drawer";
import { FreeShippingBar } from "@/lib/../components/ui/FreeShippingBar";
import { QuantityStepper } from "@/lib/../components/ui/QuantityStepper";
import { Button } from "@/lib/../components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Trash2, ArrowRight, Plus, Coins } from "lucide-react";
import { useCountryStore } from "@/lib/store/useCountryStore";
import { PayLaterCartButton } from "@/components/cart/PayLaterCartButton";

export function CartDrawer() {
  const pathname = usePathname();
  if (pathname?.includes("/checkout")) {
    return null;
  }

  const isAr = Boolean(pathname?.startsWith("/ar"));
  const { country, config } = useCountryStore();

  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotalItems,
    orderNote,
    setOrderNote,
  } = useCartStore();

  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [loyaltyInfo, setLoyaltyInfo] = useState<{ points: number; earnedPts: number } | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/loyalty/status?country=${country}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          const ratio = data.config?.loyaltyEarnValue || 100;
          const sub = getSubtotal();
          const earned = Math.floor(sub / ratio);
          setLoyaltyInfo({ points: data.points || 0, earnedPts: earned });
        }
      })
      .catch(() => {});
  }, [isOpen, country, items]);

  const handleProceedToCheckout = async () => {
    setIsRedirecting(true);
    closeCart();
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data?.user) {
        window.location.href = isAr ? "/ar/checkout" : "/checkout";
      } else {
        window.location.href = isAr
          ? "/ar/account/login?redirect=/ar/checkout"
          : "/account/login?redirect=/checkout";
      }
    } catch {
      window.location.href = isAr
        ? "/ar/account/login?redirect=/ar/checkout"
        : "/account/login?redirect=/checkout";
    }
  };

  const handleBuyWithPayLater = async () => {
    setIsRedirecting(true);
    closeCart();
    const targetUrl = isAr ? "/ar/checkout?method=PAYLATER" : "/checkout?method=PAYLATER";
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data?.user) {
        window.location.href = targetUrl;
      } else {
        window.location.href = isAr
          ? `/ar/account/login?redirect=${encodeURIComponent(targetUrl)}`
          : `/account/login?redirect=${encodeURIComponent(targetUrl)}`;
      }
    } catch {
      window.location.href = isAr
        ? `/ar/account/login?redirect=${encodeURIComponent(targetUrl)}`
        : `/account/login?redirect=${encodeURIComponent(targetUrl)}`;
    }
  };

  const subtotal = getSubtotal();
  const totalCount = getTotalItems();

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeCart}
      maxWidth="max-w-md"
      title={
        <div className="flex items-center gap-2">
          <span>Shopping Cart</span>
          <span className="text-xs bg-[#faedcd] text-[#1c1c1c] font-bold px-2 py-0.5 rounded-full border border-[#ecdec1]">
            {totalCount}
          </span>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Free Shipping Progress */}
        <div className="mb-4">
          <FreeShippingBar currentAmount={subtotal} threshold={900} />
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-lg font-semibold text-[#1c1c1c] mb-1">
              Your cart is empty
            </h3>
            <p className="text-sm text-neutral-500 max-w-xs mb-6">
              Discover our signature fragrances and luxurious Arabian oud collections.
            </p>
            <Button
              variant="primary"
              onClick={closeCart}
              className="w-full max-w-xs"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Header subline with quick Add More Items action */}
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-[#f0ebe1] text-xs shrink-0">
              <span className="text-neutral-500 font-medium">
                {totalCount} {totalCount === 1 ? (isAr ? "عطر في السلة" : "item in bag") : (isAr ? "عطور في السلة" : "items in bag")}
              </span>
              <button
                type="button"
                onClick={closeCart}
                className="text-xs font-bold text-[#b6713e] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>{isAr ? "إضافة المزيد" : "Add More"}</span>
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 divide-y divide-[#e5e5e5] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-start">
                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-[5px] bg-[#fbf9f5] overflow-hidden shrink-0 border border-[#e5e5e5]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-semibold text-[#1c1c1c] hover:text-[#b6713e] transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>

                    {item.variantName && (
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Size: {item.variantName}
                      </p>
                    )}

                    <div className="text-sm font-bold text-[#1c1c1c] mt-1.5">
                      {formatPrice(item.price, country)}
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      <QuantityStepper
                        size="sm"
                        quantity={item.quantity}
                        onIncrease={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        onDecrease={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        max={item.maxStock}
                      />

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary & Actions */}
            <div className="border-t border-[#e5e5e5] pt-4 mt-auto">
              {/* Order note toggle */}
              <div className="mb-3">
                <button
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="text-xs text-neutral-600 hover:text-[#b6713e] underline font-medium"
                >
                  {showNoteInput
                    ? "Hide order note"
                    : "Add delivery note"}
                </button>
                {showNoteInput && (
                  <textarea
                    rows={2}
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Enter special instructions or gift card text..."
                    className="w-full mt-2 text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                  />
                )}
              </div>

              {/* Loyalty Rewards Teaser */}
              {loyaltyInfo && (
                <div className="p-2.5 bg-amber-50/80 border border-amber-200/90 rounded-[6px] mb-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-amber-900">
                    <Coins size={14} className="text-[#b6713e]" />
                    <span>
                      {loyaltyInfo.points > 0 ? (
                        <>
                          {isAr ? "لديك " : "You have "}
                          <strong>{loyaltyInfo.points} {isAr ? "نقطة" : "pts"}</strong>
                          {isAr ? " لاستبدالها عند الدفع" : " to redeem at checkout"}
                        </>
                      ) : (
                        <>
                          {isAr ? "ستحصل على " : "You will earn "}
                          <strong>+{loyaltyInfo.earnedPts} {isAr ? "نقطة" : "pts"}</strong>
                          {isAr ? " من هذا الطلب" : " on this order"}
                        </>
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#b6713e] uppercase">
                    VIP
                  </span>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex items-center justify-between py-2 border-t border-[#e5e5e5]">
                <span className="text-sm text-neutral-600">Subtotal</span>
                <span className="text-lg font-bold text-[#1c1c1c]">
                  {formatPrice(subtotal, country)}
                </span>
              </div>

              <p className="text-[11px] text-neutral-500 mb-3">
                {isAr
                  ? `الضرائب ورسوم الشحن تُحسب عند الدفع. ${config.deliveryNoticeAr}`
                  : `Taxes and shipping calculated at checkout. ${config.deliveryNotice}.`}
              </p>

              {/* Terms agreement */}
              <label className="flex items-center gap-2 text-xs text-neutral-600 mb-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="rounded border-[#e5e5e5] text-[#b6713e] focus:ring-[#b6713e]"
                />
                <span>
                  I agree with the{" "}
                  <Link
                    href="/pages/term-and-services"
                    className="underline hover:text-[#b6713e]"
                    onClick={closeCart}
                  >
                    Terms & Conditions
                  </Link>
                </span>
              </label>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="primary"
                  disabled={!agreedToTerms}
                  onClick={handleProceedToCheckout}
                  isLoading={isRedirecting}
                  className="w-full h-12 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>{isAr ? "المتابعة إلى الدفع" : "Proceed to Checkout"}</span>
                  <ArrowRight size={16} />
                </Button>

                {/* PayLater Buy Button & Trust Badges */}
                <PayLaterCartButton
                  onPayLaterClick={handleBuyWithPayLater}
                  subtotal={subtotal}
                  currency={config.currency}
                  isAr={isAr}
                  disabled={!agreedToTerms}
                  showBadges={true}
                />

                {/* Add More Items Button (Takes user to /shop) */}
                <Link href={isAr ? "/ar/shop" : "/shop"} onClick={closeCart} className="block w-full">
                  <button
                    type="button"
                    className="w-full h-11 text-xs font-bold rounded-[5px] border-2 border-[#b6713e] text-[#b6713e] bg-white hover:bg-[#faedcd]/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Plus size={16} />
                    <span>{isAr ? "إضافة المزيد من المنتجات" : "Add More Items"}</span>
                  </button>
                </Link>

                {/* View Full Bag Button (Matching Image 1) */}
                <Link href={isAr ? "/ar/cart" : "/cart"} onClick={closeCart} className="block w-full">
                  <button
                    type="button"
                    className="w-full h-11 text-xs font-bold rounded-[8px] border border-neutral-300 bg-white hover:bg-neutral-50 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 text-neutral-800 cursor-pointer shadow-2xs"
                  >
                    <span>
                      {isAr
                        ? `عرض السلة بالكامل (${totalCount} منتجات)`
                        : `View Full Bag (${totalCount} ${totalCount === 1 ? "item" : "items"})`}
                    </span>
                    <ArrowRight size={14} className={isAr ? "rotate-180" : ""} />
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
