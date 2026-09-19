"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";
import { useCountryStore } from "@/lib/store/useCountryStore";
import { COUNTRIES, CountryCode } from "@/lib/country/config";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { CheckoutCoupons } from "@/components/checkout/CheckoutCoupons";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Loader2,
  Clock,
  Sparkles,
  Globe,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isAr = Boolean(pathname?.startsWith("/ar"));
  const { country, config, setCountry } = useCountryStore();

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
  const [area, setArea] = useState(config.defaultCity);
  const [deliveryNotes, setDeliveryNotes] = useState(orderNote || "");
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync city default if country changes
  useEffect(() => {
    if (config.cities.length > 0 && !config.cities.includes(area)) {
      setArea(config.defaultCity);
    }
  }, [country, config]);

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
  const shipping = subtotal >= config.freeShippingThreshold ? 0.0 : config.standardShippingFee;
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxRate = (config as any).taxRate ?? (country === "AE" ? 5 : country === "BH" ? 10 : 0);
  const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(config.currencyDecimals || 2));
  const finalTotal = Math.max(0, subtotal - discount + shipping + taxAmount);

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
        city: area || config.defaultCity,
        country: config.name,
        countryCode: country,
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
    } catch {
      setErrorMessage("Network error processing order. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fbf9f5] min-h-screen py-8 md:py-12 border-t border-[#e5e5e5]">
      <div className="ramillette-container">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={isAr ? "/ar/cart" : "/cart"}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-[#b6713e] font-semibold transition-colors"
          >
            <ArrowLeft size={14} className="rtl:rotate-180" />
            <span>{isAr ? "العودة إلى سلة التسوق" : "Return to Cart"}</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <Lock size={13} className="text-[#0d9d00]" />
            <span>{isAr ? "دفع آمن ومشفّر 256-bit" : "256-Bit Encrypted Checkout"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Form Steps */}
          <div className="lg:col-span-7 space-y-6">
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[6px] font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Customer Contact */}
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0ece1]">
                  <h2 className="text-base font-bold text-[#1c1c1c]">
                    1. Contact Information
                  </h2>
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
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={`${config.phonePrefix} 5555 1234`}
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
                    placeholder="customer@example.com"
                    className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                  />
                </div>
              </div>

              {/* Step 2: Country & Shipping Address */}
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0ece1]">
                  <h2 className="text-base font-bold text-[#1c1c1c]">
                    2. {config.name} Delivery Address
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-[#b6713e] font-semibold">
                    <Clock size={13} />
                    <span>{config.deliveryNotice}</span>
                  </div>
                </div>

                {/* Country Switcher inside Checkout */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Destination Country / الدولة *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["QA", "AE", "BH"] as CountryCode[]).map((c) => {
                      const item = COUNTRIES[c];
                      const isSel = country === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCountry(c)}
                          className={`flex items-center justify-center gap-2 p-2.5 rounded-[6px] border text-xs font-semibold transition-all ${
                            isSel
                              ? "bg-[#faedcd]/40 border-[#b6713e] text-[#1c1c1c]"
                              : "border-[#e5e5e5] bg-white text-neutral-600 hover:border-neutral-400"
                          }`}
                        >
                          <span className="text-base">{item.flag}</span>
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    City / Governorate / Zone in {config.name} *
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e] bg-white font-medium cursor-pointer"
                  >
                    {config.cities.map((cityOption) => (
                      <option key={cityOption} value={cityOption}>
                        {cityOption}
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
                    placeholder="e.g. Villa 14, Street 920, Downtown"
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
                    placeholder="e.g. Near main gate or Tower 2, Apt 1402"
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
                    placeholder="e.g. Please call upon arrival or leave with concierge..."
                    className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                  />
                </div>
              </div>

              {/* Step 3: Payment Method (Dynamic for QA, AE, BH) */}
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-xs space-y-4">
                <h2 className="text-base font-bold text-[#1c1c1c] pb-3 border-b border-[#f0ece1]">
                  3. Payment Method ({config.name})
                </h2>

                <div className="space-y-3">
                  {config.paymentMethods.map((method) => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-start gap-3 p-4 rounded-[6px] border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#b6713e] bg-[#faedcd]/20 shadow-xs"
                            : "border-[#e5e5e5] hover:border-neutral-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={isSelected}
                          onChange={() => setPaymentMethod(method.id)}
                          className="mt-0.5 text-[#b6713e] focus:ring-[#b6713e]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1c1c1c] flex items-center gap-1.5">
                              {method.id === "COD" ? (
                                <Banknote size={16} className="text-[#b6713e]" />
                              ) : (
                                <CreditCard size={16} className="text-[#b6713e]" />
                              )}
                              <span>{isAr ? method.nameAr : method.name}</span>
                            </span>
                            {method.badge && (
                              <span className="text-[10px] bg-[#faedcd] text-[#1c1c1c] font-bold px-2 py-0.5 rounded">
                                {method.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1">
                            {isAr ? method.descriptionAr : method.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
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
                Complete Order • {formatPrice(finalTotal, country)}
              </Button>
            </form>
          </div>

          {/* Right Column: Order Items & Recalculated Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-xs space-y-4 sticky top-28">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ece1]">
                <h3 className="text-base font-bold text-[#1c1c1c]">
                  Order Items ({items.reduce((s, i) => s + i.quantity, 0)})
                </h3>
                <span className="text-xs font-bold text-[#b6713e]">
                  {config.flag} {config.currency}
                </span>
              </div>

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
                      {formatPrice(item.price * item.quantity, country)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Offers & Secret Code Entry */}
              <div className="pt-3 border-t border-[#f0ece1]">
                <CheckoutCoupons />
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-3 border-t border-[#f0ece1] space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1c1c1c]">
                    {formatPrice(subtotal, country)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({coupon?.code})</span>
                    <span>-{formatPrice(discount, country)}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600">
                  <span>{config.name} Delivery</span>
                  <span className="font-semibold text-[#1c1c1c]">
                    {shipping === 0 ? (
                      <span className="text-[#0d9d00] font-bold">FREE</span>
                    ) : (
                      formatPrice(shipping, country)
                    )}
                  </span>
                </div>

                {taxAmount > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>VAT ({taxRate}%)</span>
                    <span className="font-semibold text-[#1c1c1c]">
                      {formatPrice(taxAmount, country)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-base font-extrabold text-[#1c1c1c] pt-3 border-t border-[#e5e5e5]">
                  <span>Total ({config.currency})</span>
                  <span className="text-[#b6713e]">
                    {formatPrice(finalTotal, country)}
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-4 border-t border-[#f0ece1] space-y-2 text-[11px] text-neutral-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#0d9d00]" />
                  <span>Immediate dispatch from {config.boutiqueLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-[#b6713e]" />
                  <span>100% Authentic luxury fragrance guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
