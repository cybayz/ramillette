"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { FreeShippingBar } from "@/components/ui/FreeShippingBar";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { CheckoutCoupons } from "@/components/checkout/CheckoutCoupons";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isAr = Boolean(pathname?.startsWith("/ar"));

  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    orderNote,
    setOrderNote,
    coupon,
    applyCoupon,
    removeCoupon,
    getDiscountTotal,
  } = useCartStore();

  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleProceedToCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRedirecting(true);
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

  const subtotal = getSubtotal();
  const discount = getDiscountTotal();
  const shipping = subtotal >= 900 || subtotal === 0 ? 0 : 30.0;
  const finalTotal = Math.max(0, subtotal - discount + shipping);



  if (items.length === 0) {
    return (
      <div className="bg-[#ffffff] min-h-[70vh] flex items-center justify-center py-16">
        <div className="ramillette-container text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-[#fbf9f5] border border-[#e5e5e5] flex items-center justify-center text-neutral-400 mx-auto mb-5">
            <ShoppingBag size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1c] mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mb-8 leading-relaxed">
            You haven't added any luxury fragrances to your shopping bag yet. Explore our bestsellers and signature oud creations.
          </p>
          <Link href="/shop">
            <Button variant="primary" size="lg" className="px-8 text-sm">
              Discover Fragrances
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ffffff] min-h-screen py-10">
      <div className="ramillette-container">
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">Shopping Bag</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-[#1c1c1c] mb-8">
          Shopping Cart ({items.reduce((sum, i) => sum + i.quantity, 0)} items)
        </h1>

        {/* Free Shipping Progress Meter */}
        <div className="mb-8">
          <FreeShippingBar currentAmount={subtotal} threshold={900} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Items Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="border border-[#e5e5e5] rounded-[8px] overflow-hidden">
              {/* Header */}
              <div className="hidden sm:grid sm:grid-cols-12 bg-[#fbf9f5] px-6 py-3 border-b border-[#e5e5e5] text-xs font-bold uppercase tracking-wider text-neutral-600">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#e5e5e5]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
                  >
                    {/* Product info */}
                    <div className="sm:col-span-6 flex items-center gap-4">
                      <div className="relative w-20 h-20 bg-[#fbf9f5] rounded-[5px] border border-[#e5e5e5] overflow-hidden shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain p-1"
                            sizes="80px"
                          />
                        ) : null}
                      </div>
                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-sm font-semibold text-[#1c1c1c] hover:text-[#b6713e] transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        {item.variantName && (
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Size: {item.variantName}
                          </p>
                        )}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1 mt-2"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="sm:col-span-2 text-sm font-medium text-[#1c1c1c] sm:text-center">
                      <span className="sm:hidden text-neutral-500 text-xs mr-2">
                        Price:
                      </span>
                      {formatPrice(item.price)}
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-2 flex sm:justify-center">
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
                    </div>

                    {/* Line Total */}
                    <div className="sm:col-span-2 text-sm font-bold text-[#1c1c1c] sm:text-right">
                      <span className="sm:hidden text-neutral-500 text-xs mr-2">
                        Subtotal:
                      </span>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery / Order Note */}
            <div className="p-6 border border-[#e5e5e5] rounded-[8px] bg-[#fbf9f5]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c] mb-2">
                Order Notes & Gift Instructions
              </h3>
              <p className="text-xs text-neutral-500 mb-3">
                Include special delivery instructions, villa gate codes, or customized gift card wording.
              </p>
              <textarea
                rows={3}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="e.g. Please ring the villa bell twice, or Happy Birthday from Tariq..."
                className="w-full text-xs p-3 border border-[#e5e5e5] bg-white rounded-[5px] focus:outline-none focus:border-[#b6713e]"
              />
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-[#e5e5e5] rounded-[8px] p-6 bg-[#fbf9f5] space-y-4">
              <h2 className="text-lg font-bold text-[#1c1c1c] pb-3 border-b border-[#e5e5e5]">
                Order Summary
              </h2>

              {/* Coupons & Available Offers */}
              <div className="pb-2">
                <CheckoutCoupons />
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1c1c1c]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({coupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600">
                  <span>Qatar Express Delivery</span>
                  <span className="font-semibold text-[#1c1c1c]">
                    {shipping === 0 ? (
                      <span className="text-[#0d9d00] font-bold uppercase">
                        FREE
                      </span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-[#1c1c1c] pt-3 border-t border-[#e5e5e5]">
                  <span>Total</span>
                  <span className="text-[#b6713e]">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleProceedToCheckout}
                  isLoading={isRedirecting}
                  className="w-full h-13 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isAr ? "المتابعة إلى الدفع" : "Proceed to Checkout"}</span>
                  <ArrowRight size={16} />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-[#e5e5e5] space-y-2 text-[11px] text-neutral-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#0d9d00] shrink-0" />
                  <span>2-Hour Express Delivery in Doha</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-[#b6713e] shrink-0" />
                  <span>Free Qatar shipping on orders ≥ QAR 900</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#b6713e] shrink-0" />
                  <span>Cash on Delivery (COD) & NAPS debit accepted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
