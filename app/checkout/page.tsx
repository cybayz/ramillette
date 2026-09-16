"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isAr = Boolean(pathname?.startsWith("/ar"));

  const {
    items,
    clearCart,
    getSubtotal,
    getDiscountTotal,
    coupon,
    orderNote,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [area, setArea] = useState("Doha");
  const [deliveryNotes, setDeliveryNotes] = useState(orderNote || "");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          const target = isAr
            ? "/ar/account/login?redirect=/ar/checkout"
            : "/account/login?redirect=/checkout";
          window.location.href = target;
          return;
        }

        setIsCheckingAuth(false);
        setCustomerName(
          `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim() || data.user.email
        );
        setCustomerEmail(data.user.email || "");
        setCustomerPhone(data.user.phone || "");

        // Prefill default address if available
        if (data.user.addresses && data.user.addresses.length > 0) {
          const defAddr = data.user.addresses[0];
          setAddressLine1(defAddr.addressLine1 || "");
          setAddressLine2(defAddr.addressLine2 || "");
          if (defAddr.area) setArea(defAddr.area);
        }
      })
      .catch(() => {
        const target = isAr
          ? "/ar/account/login?redirect=/ar/checkout"
          : "/account/login?redirect=/checkout";
        window.location.href = target;
      });
  }, [isAr]);

  if (!mounted || isCheckingAuth) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 bg-[#ffffff] gap-3">
        <Loader2 className="w-8 h-8 text-[#b6713e] animate-spin" />
        <p className="text-xs font-semibold text-neutral-600">
          {isAr ? "جاري التحقق من الحساب..." : "Verifying your account..."}
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16 bg-[#ffffff]">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-[#1c1c1c] mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-xs text-neutral-500 mb-6">
            Please add perfumes to your bag before proceeding to checkout.
          </p>
          <Link href={isAr ? "/ar/shop" : "/shop"} className="btn-primary h-10 px-6 text-xs">
            {isAr ? "تسوق العطور" : "Shop Perfumes"}
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const discount = getDiscountTotal();
  const shipping = subtotal >= 900 ? 0.0 : 30.0;
  const finalTotal = Math.max(0, subtotal - discount + shipping);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        area,
        city: "Doha",
        country: "Qatar",
        deliveryNotes: deliveryNotes.trim() || undefined,
        paymentMethod,
        couponCode: coupon?.code,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          name: i.name,
        })),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to place order.");
        setIsSubmitting(false);
      } else {
        clearCart();
        const successUrl = `${isAr ? "/ar" : ""}/checkout/success?orderNumber=${data.orderNumber}`;
        router.push(successUrl);
      }
    } catch (err) {
      setErrorMessage("A network or server error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const qatarAreas = [
    "Doha - West Bay",
    "Doha - The Pearl",
    "Doha - Lusail",
    "Doha - Al Sadd",
    "Al Wakrah / Souq Al Wakra",
    "Al Rayyan",
    "Al Daayen",
    "Umm Salal",
    "Al Khor",
    "Al Shamal",
  ];

  return (
    <div className="bg-[#fbf9f5] min-h-screen py-10">
      <div className="ramillette-container">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#e5e5e5]">
          <Link href={isAr ? "/ar" : "/"} className="inline-block">
            <span className="font-extrabold text-2xl tracking-[0.18em] text-[#1c1c1c] uppercase font-heading">
              Ramillette
            </span>
            <span className="block text-[9px] tracking-[0.25em] text-[#b6713e] uppercase font-semibold">
              Secure Checkout • Qatar
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-[#0d9d00] font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Lock size={13} />
            <span>256-bit Encrypted Checkout</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-[6px] flex items-center gap-2.5 text-xs text-red-700 font-medium">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Checkout Details Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Customer Contact */}
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0ece1]">
                  <h2 className="text-base font-bold text-[#1c1c1c]">
                    1. Contact Information
                  </h2>
                  <span className="text-xs text-neutral-500">
                    For delivery notifications
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Tariq Al-Kuwari"
                      className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Qatar Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+974 6600 7788"
                      className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="tariq@example.com"
                    className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                  />
                </div>
              </div>

              {/* Step 2: Qatar Shipping Address */}
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0ece1]">
                  <h2 className="text-base font-bold text-[#1c1c1c]">
                    2. Qatar Delivery Address
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-[#b6713e] font-semibold">
                    <Clock size={13} />
                    <span>2-Hour Doha Express</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Zone / Municipality in Qatar *
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e] bg-white font-medium cursor-pointer"
                  >
                    {qatarAreas.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Street & Villa / Building Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="e.g. Villa 14, Street 920, Zone 90"
                    className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Apartment / Landmark / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="e.g. Near Souq Al Wakra entrance, or Tower 2 Floor 14"
                    className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Delivery Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Please call before arrival or leave with security..."
                    className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                  />
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-xs space-y-4">
                <h2 className="text-base font-bold text-[#1c1c1c] pb-3 border-b border-[#f0ece1]">
                  3. Payment Method
                </h2>

                <div className="space-y-3">
                  {/* COD */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-[6px] border transition-all cursor-pointer ${
                      paymentMethod === "COD"
                        ? "border-[#b6713e] bg-[#faedcd]/20"
                        : "border-[#e5e5e5] hover:border-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="mt-0.5 text-[#b6713e] focus:ring-[#b6713e]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1c1c1c] flex items-center gap-1.5">
                          <Banknote size={16} className="text-[#b6713e]" />
                          <span>Cash on Delivery (COD)</span>
                        </span>
                        <span className="text-[10px] bg-[#faedcd] text-[#1c1c1c] font-bold px-2 py-0.5 rounded">
                          Popular in Qatar
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Pay cash or card to the courier upon physical receipt at your doorstep.
                      </p>
                    </div>
                  </label>

                  {/* Online Card / NAPS */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-[6px] border transition-all cursor-pointer ${
                      paymentMethod === "ONLINE"
                        ? "border-[#b6713e] bg-[#faedcd]/20"
                        : "border-[#e5e5e5] hover:border-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "ONLINE"}
                      onChange={() => setPaymentMethod("ONLINE")}
                      className="mt-0.5 text-[#b6713e] focus:ring-[#b6713e]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1c1c1c] flex items-center gap-1.5">
                          <CreditCard size={16} className="text-[#b6713e]" />
                          <span>Online Card / NAPS Debit / Apple Pay</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Instant payment via local Qatar banking gateway with secure verification.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Action */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full h-14 text-base font-bold shadow-lg shadow-[#b6713e]/20"
              >
                Complete Order • {formatPrice(finalTotal)}
              </Button>
            </form>
          </div>

          {/* Right Column: Order Items & Recalculated Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-xs space-y-4 sticky top-28">
              <h3 className="text-base font-bold text-[#1c1c1c] pb-3 border-b border-[#f0ece1]">
                Order Items ({items.reduce((s, i) => s + i.quantity, 0)})
              </h3>

              {/* Items List */}
              <div className="divide-y divide-[#f0ece1] max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <div className="relative w-14 h-14 bg-[#fbf9f5] rounded-[4px] border border-[#e5e5e5] overflow-hidden shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                          sizes="56px"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1c1c1c] truncate">
                        {item.name}
                      </p>
                      {item.variantName && (
                        <p className="text-[11px] text-neutral-500">
                          Size: {item.variantName}
                        </p>
                      )}
                      <p className="text-[11px] text-neutral-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-xs font-bold text-[#1c1c1c]">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-3 border-t border-[#f0ece1] space-y-2 text-xs">
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
                  <span>Qatar Delivery</span>
                  <span className="font-semibold text-[#1c1c1c]">
                    {shipping === 0 ? (
                      <span className="text-[#0d9d00] font-bold">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-[#1c1c1c] pt-3 border-t border-[#e5e5e5]">
                  <span>Total (QAR)</span>
                  <span className="text-[#b6713e]">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-4 border-t border-[#f0ece1] space-y-2 text-[11px] text-neutral-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#0d9d00]" />
                  <span>Immediate dispatch from Souq Al Wakra</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-[#b6713e]" />
                  <span>100% Authentic fragrance guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
