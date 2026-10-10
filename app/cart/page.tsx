"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";
import { useCountryStore } from "@/lib/store/useCountryStore";
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
  Plus,
} from "lucide-react";
import { PayLaterCartButton } from "@/components/cart/PayLaterCartButton";

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

  const handleBuyWithPayLater = async () => {
    setIsRedirecting(true);
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

  const { country, config } = useCountryStore();
  const subtotal = getSubtotal();
  const discount = getDiscountTotal();
  const shippingThreshold = config?.freeShippingThreshold ?? 900;
  const standardShippingFee = config?.standardShippingFee ?? 30.0;
  const shipping = subtotal >= shippingThreshold || subtotal === 0 ? 0 : standardShippingFee;
  const finalTotal = Math.max(0, subtotal - discount + shipping);

  if (items.length === 0) {
    return (
      <div className="bg-[#ffffff] min-h-[70vh] flex items-center justify-center py-16">
        <div className="ramillette-container text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-[#fbf9f5] border border-[#e5e5e5] flex items-center justify-center text-neutral-400 mx-auto mb-5">
            <ShoppingBag size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1c] mb-2">
            {isAr ? "سلة التسوق فارغة" : "Your Cart is Empty"}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mb-8 leading-relaxed">
            {isAr
              ? "لم تقم بإضافة أي عطور فاخرة إلى حقيبة التسوق الخاصة بك بعد. استكشف مجموعتنا الفاخرة."
              : "You haven't added any luxury fragrances to your shopping bag yet. Explore our bestsellers and signature creations."}
          </p>
          <Link href={isAr ? "/ar/shop" : "/shop"}>
            <Button variant="primary" size="lg" className="px-8 text-sm">
              {isAr ? "اكتشف العطور" : "Discover Fragrances"}
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
          <Link href={isAr ? "/ar" : "/"} className="hover:text-[#b6713e]">
            {isAr ? "الرئيسية" : "Home"}
          </Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">{isAr ? "حقيبة التسوق" : "Shopping Bag"}</span>
        </nav>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1c]">
            {isAr
              ? `حقيبة التسوق (${items.reduce((sum, i) => sum + i.quantity, 0)} منتجات)`
              : `Shopping Cart (${items.reduce((sum, i) => sum + i.quantity, 0)} items)`}
          </h1>

          <Link
            href={isAr ? "/ar/shop" : "/shop"}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b6713e] hover:text-[#8f4f22] bg-[#faedcd]/20 hover:bg-[#faedcd]/40 px-3.5 py-2 rounded-[5px] border border-[#ecdac1] transition-all"
          >
            <Plus size={14} />
            <span>{isAr ? "إضافة المزيد من المنتجات" : "Add More Items"}</span>
          </Link>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="mb-8">
          <FreeShippingBar currentAmount={subtotal} threshold={shippingThreshold} />
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
                      {formatPrice(item.price * item.quantity, country)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping / Add More Items Action */}
            <div className="flex items-center justify-between pt-1">
              <Link
                href={isAr ? "/ar/shop" : "/shop"}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#b6713e] hover:text-[#8f4f22] transition-colors"
              >
                <Plus size={15} />
                <span>{isAr ? "إضافة المزيد من المنتجات إلى السلة" : "Continue Shopping / Add More Items"}</span>
              </Link>
            </div>

            {/* Delivery / Order Note */}
            <div className="p-6 border border-[#e5e5e5] rounded-[8px] bg-[#fbf9f5]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c] mb-2">
                {isAr ? "ملاحظات الطلب وتعليمات الإهداء" : "Order Notes & Gift Instructions"}
              </h3>
              <p className="text-xs text-neutral-500 mb-3">
                {isAr
                  ? "أضف أي تعليمات خاصة بالتسليم، أو نص بطاقة الإهداء الخاصة بك."
                  : "Include special delivery instructions, villa gate codes, or customized gift card wording."}
              </p>
              <textarea
                rows={3}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder={isAr ? "مثال: يرجى الاتصال عند الوصول..." : "e.g. Please ring the villa bell twice, or Happy Birthday from Tariq..."}
                className="w-full text-xs p-3 border border-[#e5e5e5] bg-white rounded-[5px] focus:outline-none focus:border-[#b6713e]"
              />
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-[#e5e5e5] rounded-[8px] p-6 bg-[#fbf9f5] space-y-4">
              <h2 className="text-lg font-bold text-[#1c1c1c] pb-3 border-b border-[#e5e5e5]">
                {isAr ? "ملخص الطلب" : "Order Summary"}
              </h2>

              {/* Coupons & Available Offers */}
              <div className="pb-2">
                <CheckoutCoupons />
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span className="font-semibold text-[#1c1c1c]">
                    {formatPrice(subtotal, country)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>{isAr ? `الخصم (${coupon?.code})` : `Discount (${coupon?.code})`}</span>
                    <span>-{formatPrice(discount, country)}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600">
                  <span>{isAr ? `الشحن السريع (${config?.name || "Qatar"})` : `${config?.name || "Qatar"} Express Delivery`}</span>
                  <span className="font-semibold text-[#1c1c1c]">
                    {shipping === 0 ? (
                      <span className="text-[#0d9d00] font-bold uppercase">
                        {isAr ? "مجاناً" : "FREE"}
                      </span>
                    ) : (
                      formatPrice(shipping, country)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-[#1c1c1c] pt-3 border-t border-[#e5e5e5]">
                  <span>{isAr ? "المجموع الكلي" : "Total"}</span>
                  <span className="text-[#b6713e]">{formatPrice(finalTotal, country)}</span>
                </div>
              </div>

              {/* Checkout & Add More Items Actions */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  disabled={isRedirecting}
                  onClick={handleProceedToCheckout}
                  className="w-full h-13 rounded-2xl bg-[#eed2a4] hover:bg-[#e5c692] active:scale-[0.99] text-black font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isAr ? "المتابعة إلى الدفع" : "Proceed to Checkout"}</span>
                  <ArrowRight size={18} className="rtl:rotate-180" />
                </button>

                {/* PayLater Buy Button */}
                <PayLaterCartButton
                  onPayLaterClick={handleBuyWithPayLater}
                  subtotal={finalTotal}
                  currency={config?.currency || "QAR"}
                  isAr={isAr}
                />


                <Link href={isAr ? "/ar/shop" : "/shop"} className="block w-full">
                  <button
                    type="button"
                    className="w-full h-12 text-xs font-bold rounded-[5px] border-2 border-[#b6713e] text-[#b6713e] bg-white hover:bg-[#faedcd]/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Plus size={16} />
                    <span>{isAr ? "إضافة المزيد من المنتجات" : "Add More Items"}</span>
                  </button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-[#e5e5e5] space-y-2 text-[11px] text-neutral-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#0d9d00] shrink-0" />
                  <span>{isAr ? config?.deliveryNoticeAr || "توصيل سريع مباشر" : config?.deliveryNotice || "2-Hour Express Delivery in Doha"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-[#b6713e] shrink-0" />
                  <span>
                    {isAr
                      ? `شحن مجاني على الطلبات الأكثر من ${formatPrice(shippingThreshold, country)}`
                      : `Free shipping on orders ≥ ${formatPrice(shippingThreshold, country)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#b6713e] shrink-0" />
                  <span>{isAr ? "دفع آمن عند الاستلام وبالبطاقة" : "Cash on Delivery & Secure Online Payment"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
