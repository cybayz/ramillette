"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";
import { useCountryStore } from "@/lib/store/useCountryStore";
import { resolvePaymentMethods, COUNTRIES, CountryCode, GiftWrapOption } from "@/lib/country/config";
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
  MapPin,
  Plus,
  Gift,
  Check,
  Store,
  Calendar,
  QrCode,
  Building2,
  PhoneCall,
  Navigation,
} from "lucide-react";

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city?: string | null;
  area?: string | null;
  country?: string | null;
  postalCode?: string | null;
  isDefault?: boolean;
}

export interface PickupStoreInfo {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  address: string;
  phone: string;
  email: string;
  regionId: string;
  regionName: string;
  countryCode: string;
  isFullyAvailable: boolean;
  availableItemsCount: number;
  totalItemsCount: number;
  stockBadge: "IN_STOCK" | "PARTIAL_STOCK" | "OUT_OF_STOCK";
  itemStockStatus?: Array<{
    productId: string;
    variantId?: string | null;
    required: number;
    available: number;
    inStock: boolean;
  }>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isAr = Boolean(pathname?.startsWith("/ar"));
  const { country, config } = useCountryStore();

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
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [orderType, setOrderType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [pickupStores, setPickupStores] = useState<PickupStoreInfo[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [pickupDate, setPickupDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>("Afternoon (1:00 PM - 5:00 PM)");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [area, setArea] = useState(config.defaultCity);
  const [deliveryNotes, setDeliveryNotes] = useState(orderNote || "");
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [selectedGiftWrapOptionId, setSelectedGiftWrapOptionId] = useState<string>("free-card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const availablePaymentMethods = resolvePaymentMethods(country, config.paymentMethods);

  // Fetch pickup stores with inventory evaluation for active cart items
  const fetchPickupStores = async () => {
    setIsLoadingStores(true);
    try {
      const res = await fetch("/api/checkout/pickup-stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const stores: PickupStoreInfo[] = data.stores || [];
        setPickupStores(stores);
        if (stores.length > 0) {
          setSelectedStoreId((prev) => {
            if (prev && stores.some((s) => s.id === prev)) return prev;
            const fullyStocked = stores.find((s) => s.isFullyAvailable);
            return fullyStocked ? fullyStocked.id : stores[0].id;
          });
        }
      }
    } catch (err) {
      console.error("Error fetching pickup stores:", err);
    } finally {
      setIsLoadingStores(false);
    }
  };

  useEffect(() => {
    fetchPickupStores();
  }, [country, items]);

  // Sync city default if country changes
  useEffect(() => {
    if (config.cities.length > 0 && !config.cities.includes(area)) {
      setArea(config.defaultCity);
    }
  }, [country, config]);

  // Sync payment method default if country changes or selected method is not valid
  useEffect(() => {
    if (availablePaymentMethods.length > 0) {
      const exists = availablePaymentMethods.some((m) => m.id === paymentMethod);
      if (!exists) {
        setPaymentMethod(availablePaymentMethods[0].id);
      }
    }
  }, [country, availablePaymentMethods, paymentMethod]);

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
        const rawEmail = data.user.email || "";
        const isSyntheticEmail = rawEmail.includes("@ramillette.user");
        const profileName =
          `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim() ||
          (!isSyntheticEmail ? rawEmail : "");

        setCustomerName(profileName);
        setCustomerEmail(!isSyntheticEmail ? rawEmail : "");
        setCustomerPhone(data.user.phone || "");

        const addresses: SavedAddress[] = data.user.addresses || [];
        setSavedAddresses(addresses);

        if (addresses.length > 0) {
          // Find default address or first address
          const defAddr = addresses.find((a) => a.isDefault) || addresses[0];
          setSelectedAddressId(defAddr.id);
          if (defAddr.name) setCustomerName(defAddr.name);
          if (defAddr.phone) setCustomerPhone(defAddr.phone);
          setAddressLine1(defAddr.addressLine1 || "");
          setAddressLine2(defAddr.addressLine2 || "");
          if (defAddr.area && config.cities.includes(defAddr.area)) {
            setArea(defAddr.area);
          } else if (defAddr.city && config.cities.includes(defAddr.city)) {
            setArea(defAddr.city);
          }
        } else {
          setSelectedAddressId("new");
        }
      })
      .catch(() => {
        const target = isAr
          ? "/ar/account/login?redirect=/ar/checkout"
          : "/account/login?redirect=/checkout";
        window.location.href = target;
      });
  }, [isAr, config.cities]);

  const handleSelectAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    if (addr.name) setCustomerName(addr.name);
    if (addr.phone) setCustomerPhone(addr.phone);
    setAddressLine1(addr.addressLine1 || "");
    setAddressLine2(addr.addressLine2 || "");
    if (addr.area && config.cities.includes(addr.area)) {
      setArea(addr.area);
    } else if (addr.city && config.cities.includes(addr.city)) {
      setArea(addr.city);
    }
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId("new");
    setAddressLine1("");
    setAddressLine2("");
    setArea(config.defaultCity);
  };

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
  const shipping = orderType === "PICKUP" ? 0.0 : (subtotal >= config.freeShippingThreshold ? 0.0 : config.standardShippingFee);
  const allowGiftWrap = (config as any).allowGiftWrap !== false;
  const availableGiftWrapOptions: GiftWrapOption[] = (
    (config as any).giftWrapOptions && Array.isArray((config as any).giftWrapOptions) && (config as any).giftWrapOptions.length > 0
      ? (config as any).giftWrapOptions
      : (COUNTRIES[country as CountryCode]?.giftWrapOptions || [])
  ).filter((opt: GiftWrapOption) => opt.active !== false);

  const selectedGiftWrapOption =
    availableGiftWrapOptions.find((opt) => opt.id === selectedGiftWrapOptionId) ||
    availableGiftWrapOptions[0] ||
    null;

  const selectedStore = pickupStores.find((s) => s.id === selectedStoreId) || pickupStores[0] || null;

  const hasGiftWrap = Boolean(isGift && selectedGiftWrapOption && Number(selectedGiftWrapOption.price) > 0);
  const giftWrapAmount = (isGift && selectedGiftWrapOption && allowGiftWrap)
    ? Number(selectedGiftWrapOption.price || 0)
    : 0;

  const taxableAmount = Math.max(0, subtotal - discount);
  const taxRate = (config as any).taxRate ?? (country === "AE" ? 5 : country === "BH" ? 10 : 0);
  const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(config.currencyDecimals || 2));
  const finalTotal = Math.max(0, subtotal - discount + shipping + giftWrapAmount + taxAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    if (orderType === "PICKUP" && !selectedStoreId && pickupStores.length > 0) {
      setErrorMessage(isAr ? "يرجى تحديد فرع للاستلام من القائمة." : "Please select a boutique location for store pickup.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        pickupStoreId: orderType === "PICKUP" ? (selectedStoreId || selectedStore?.id) : undefined,
        pickupDate: orderType === "PICKUP" ? pickupDate : undefined,
        pickupTimeSlot: orderType === "PICKUP" ? pickupTimeSlot : undefined,
        addressLine1: orderType === "PICKUP" ? (selectedStore?.address || "Boutique Pickup") : addressLine1.trim(),
        addressLine2: orderType === "DELIVERY" ? (addressLine2.trim() || undefined) : undefined,
        area: orderType === "DELIVERY" ? area : (selectedStore?.regionName || config.defaultCity),
        city: orderType === "DELIVERY" ? (area || config.defaultCity) : (selectedStore?.regionName || config.defaultCity),
        country: config.name,
        countryCode: country,
        deliveryNotes: deliveryNotes.trim() || undefined,
        paymentMethod,
        couponCode: coupon?.code,
        isGift,
        giftMessage: isGift && giftMessage.trim() ? giftMessage.trim() : undefined,
        hasGiftWrap: isGift && hasGiftWrap && allowGiftWrap,
        giftWrapOptionId: isGift && selectedGiftWrapOption ? selectedGiftWrapOption.id : undefined,
        giftWrapName: isGift && selectedGiftWrapOption ? selectedGiftWrapOption.name : undefined,
        giftWrapFee: giftWrapAmount,
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

              {/* Step 2: Fulfillment Method (Home Delivery vs Boutique Pickup) */}
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0ece1]">
                  <div className="flex items-center gap-2">
                    {orderType === "PICKUP" ? (
                      <Store size={18} className="text-[#b6713e]" />
                    ) : (
                      <MapPin size={18} className="text-[#b6713e]" />
                    )}
                    <h2 className="text-base font-bold text-[#1c1c1c]">
                      {isAr ? `2. طريقة الاستلام والعنوان في ${config.name}` : `2. Fulfillment & Location in ${config.name}`}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#b6713e] font-semibold">
                    <Clock size={13} />
                    <span>{orderType === "PICKUP" ? (isAr ? "استلام فوري خلال ساعتين" : "Ready in 2 Hours") : config.deliveryNotice}</span>
                  </div>
                </div>

                {/* Fulfillment Selection Cards (Delivery vs Pickup) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div
                    onClick={() => setOrderType("DELIVERY")}
                    className={`p-4 rounded-[8px] border cursor-pointer transition-all flex items-start gap-3.5 ${
                      orderType === "DELIVERY"
                        ? "bg-[#faedcd]/25 border-[#b6713e] ring-1 ring-[#b6713e] shadow-xs"
                        : "bg-white border-[#e5e5e5] hover:border-neutral-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        orderType === "DELIVERY"
                          ? "border-[#b6713e] bg-[#b6713e]"
                          : "border-neutral-300 bg-white"
                      }`}
                    >
                      {orderType === "DELIVERY" && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#1c1c1c] flex items-center gap-1.5">
                          <Truck size={15} className="text-[#b6713e]" />
                          <span>{isAr ? "توصيل للعنوان" : "Home / Office Delivery"}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-neutral-500">
                          {subtotal >= config.freeShippingThreshold ? (
                            <span className="text-[#0d9d00] font-bold">{isAr ? "مجاناً" : "FREE"}</span>
                          ) : (
                            formatPrice(config.standardShippingFee, country)
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                        {isAr
                          ? `توصيل سريع ومباشر لباب منزلك في ${config.name}`
                          : `Direct courier dispatch to your doorstep across ${config.name}`}
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setOrderType("PICKUP");
                      if (pickupStores.length === 0) {
                        fetchPickupStores();
                      }
                    }}
                    className={`p-4 rounded-[8px] border cursor-pointer transition-all flex items-start gap-3.5 ${
                      orderType === "PICKUP"
                        ? "bg-[#faedcd]/25 border-[#b6713e] ring-1 ring-[#b6713e] shadow-xs"
                        : "bg-white border-[#e5e5e5] hover:border-neutral-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        orderType === "PICKUP"
                          ? "border-[#b6713e] bg-[#b6713e]"
                          : "border-neutral-300 bg-white"
                      }`}
                    >
                      {orderType === "PICKUP" && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#1c1c1c] flex items-center gap-1.5">
                          <Store size={15} className="text-[#b6713e]" />
                          <span>{isAr ? "استلام من المتجر / البوتيك" : "Pickup from Store"}</span>
                        </span>
                        <span className="text-[10px] font-bold text-[#0d9d00] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                          {isAr ? "مجاناً" : "FREE"}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                        {isAr
                          ? "اختر أقرب فرع واستلم فوراً مع رمز الاستلام الرقمي QR"
                          : "Pick up in person from our regional boutique with digital QR pass"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* VIEW A: HOME DELIVERY FORM (Street, building, city, saved addresses) */}
                {orderType === "DELIVERY" && (
                  <div className="space-y-5 animate-in fade-in-50 duration-200">
                    {/* Locked Destination Country Banner */}
                    <div className="p-3.5 bg-[#fbf9f5] border border-[#e5e5e5] rounded-[6px] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.flag}</span>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            {isAr ? "دولة وجهة التوصيل" : "Destination Country"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-[#1c1c1c]">{config.name}</span>
                            <span className="text-xs text-neutral-500 font-medium">({config.currency})</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#e5e5e5] rounded text-[11px] font-semibold text-neutral-600 shadow-xs">
                        <Lock size={12} className="text-[#b6713e]" />
                        <span>{isAr ? "المنطقة المحددة" : "Selected Region"}</span>
                      </div>
                    </div>

                    {/* Saved Addresses Selection */}
                    {savedAddresses.length > 0 && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                          {isAr ? "اختر من العناوين المحفوظة" : "Select from Saved Addresses"}
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {savedAddresses.map((addr, idx) => {
                            const isSelected = selectedAddressId === addr.id;
                            return (
                              <div
                                key={addr.id || `addr-${idx}`}
                                onClick={() => handleSelectAddress(addr)}
                                className={`p-3.5 rounded-[6px] border text-left cursor-pointer transition-all relative ${
                                  isSelected
                                    ? "bg-[#faedcd]/25 border-[#b6713e] ring-1 ring-[#b6713e] shadow-xs"
                                    : "bg-white border-[#e5e5e5] hover:border-neutral-300"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name="savedAddress"
                                      checked={isSelected}
                                      onChange={() => handleSelectAddress(addr)}
                                      className="text-[#b6713e] focus:ring-[#b6713e] cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-[#1c1c1c] truncate">
                                      {addr.name}
                                    </span>
                                  </div>
                                  {addr.isDefault && (
                                    <span className="bg-[#faedcd] text-[#b6713e] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#ecdec1] shrink-0">
                                      {isAr ? "افتراضي" : "Default"}
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] text-neutral-600 line-clamp-2 pl-5 rtl:pl-0 rtl:pr-5">
                                  {addr.addressLine1}
                                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                                </p>
                                <p className="text-[11px] text-neutral-500 pl-5 rtl:pl-0 rtl:pr-5 mt-0.5">
                                  {addr.area ? `${addr.area}, ` : ""}{addr.city || config.defaultCity}
                                  {addr.country ? ` • ${addr.country}` : ""}
                                </p>
                                <p className="text-[10px] text-neutral-400 pl-5 rtl:pl-0 rtl:pr-5 mt-1 font-mono">
                                  {addr.phone}
                                </p>
                              </div>
                            );
                          })}

                          <div
                            onClick={handleSelectNewAddress}
                            className={`p-3.5 rounded-[6px] border text-left cursor-pointer transition-all flex flex-col justify-center ${
                              selectedAddressId === "new"
                                ? "bg-[#faedcd]/25 border-[#b6713e] ring-1 ring-[#b6713e] shadow-xs"
                                : "bg-white border-dashed border-[#d5d5d5] hover:border-[#b6713e]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="savedAddress"
                                checked={selectedAddressId === "new"}
                                onChange={handleSelectNewAddress}
                                className="text-[#b6713e] focus:ring-[#b6713e] cursor-pointer"
                              />
                              <span className="text-xs font-bold text-[#1c1c1c] flex items-center gap-1.5">
                                <Plus size={14} className="text-[#b6713e]" />
                                <span>{isAr ? "توصيل إلى عنوان جديد" : "+ Deliver to a New Address"}</span>
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 pl-5 rtl:pl-0 rtl:pr-5 mt-1">
                              {isAr
                                ? "أدخل تفاصيل عنوان توصيل جديد بالأسفل"
                                : "Enter fresh street & building details below"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 space-y-4">
                      {savedAddresses.length > 0 && (
                        <div className="flex items-center justify-between pb-1 border-b border-[#f0ece1]">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                            {selectedAddressId !== "new"
                              ? (isAr ? "تفاصيل العنوان المحدد" : "Selected Address Details")
                              : (isAr ? "تفاصيل العنوان الجديد" : "New Address Details")}
                          </span>
                          {selectedAddressId !== "new" && (
                            <span className="text-[11px] text-[#b6713e] font-semibold">
                              {isAr ? "✓ تم تعبئة العنوان المحفوظ" : "✓ Pre-filled from saved address"}
                            </span>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          {isAr ? `المدينة / المنطقة في ${config.name} *` : `City / Zone in ${config.name} *`}
                        </label>
                        <select
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e] bg-white font-medium cursor-pointer"
                        >
                          {config.cities.map((cityOption, idx) => (
                            <option key={`${cityOption}-${idx}`} value={cityOption}>
                              {cityOption}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          {isAr ? "اسم الشارع ورقم الفيلا / المبنى *" : "Street & Villa / Building Number *"}
                        </label>
                        <input
                          type="text"
                          required={orderType === "DELIVERY"}
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          placeholder={isAr ? "مثال: فيلا 14، شارع 920، الخليج الغربي" : "e.g. Villa 14, Street 920, West Bay"}
                          className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          {isAr ? "رقم الشقة / معلم قريب (اختياري)" : "Apartment / Landmark / Notes (Optional)"}
                        </label>
                        <input
                          type="text"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                          placeholder={isAr ? "مثال: برج 2، شقة 1402 أو بجانب البوابة الرئيسية" : "e.g. Near main gate or Tower 2, Apt 1402"}
                          className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          {isAr ? "تعليمات التوصيل (اختياري)" : "Delivery Instructions (Optional)"}
                        </label>
                        <textarea
                          rows={2}
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          placeholder={isAr ? "مثال: يرجى الاتصال عند الوصول أو التسليم للأمن..." : "e.g. Please call upon arrival or leave with concierge..."}
                          className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW B: BOUTIQUE PICKUP FORM (All delivery address inputs removed!) */}
                {orderType === "PICKUP" && (
                  <div className="space-y-5 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-[#f0ece1]">
                      <div>
                        <h3 className="text-xs font-bold text-[#1c1c1c] uppercase tracking-wide flex items-center gap-1.5">
                          <Building2 size={14} className="text-[#b6713e]" />
                          <span>{isAr ? `فروع وبوتيكات راميليت المتاحة في ${config.name}` : `Available Boutiques & Showrooms in ${config.name}`}</span>
                        </h3>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {isAr
                            ? "اختر البوتيك المفضل لديك واطلع على حالة توفر المخزون فورياً"
                            : "Select your preferred boutique and verify live fragrance availability"}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-[#b6713e] bg-[#faedcd]/50 px-2 py-0.5 rounded border border-[#ecdac1]">
                        {pickupStores.length} {isAr ? "فروع متوفرة" : "Boutiques"}
                      </span>
                    </div>

                    {isLoadingStores ? (
                      <div className="p-8 text-center bg-[#fbf9f5] rounded-[8px] border border-[#e5e5e5] space-y-2">
                        <Loader2 className="w-6 h-6 text-[#b6713e] animate-spin mx-auto" />
                        <p className="text-xs text-neutral-600 font-medium">
                          {isAr ? "جاري فحص مخزون الفروع المتاحة..." : "Checking real-time store stock..."}
                        </p>
                      </div>
                    ) : pickupStores.length === 0 ? (
                      <div className="p-6 text-center bg-neutral-50 rounded-[8px] border border-neutral-200">
                        <Store className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-neutral-700">
                          {isAr ? "لا توجد فروع مسجلة للاستلام في هذه المنطقة حالياً." : "No boutique locations currently available in this region."}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          {isAr ? "يرجى اختيار التوصيل للعنوان أو تبديل المنطقة." : "Please choose Home Delivery to receive your order."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                          {pickupStores.map((store) => {
                            const isSelected = selectedStoreId === store.id;
                            const isFullyStocked = store.isFullyAvailable;

                            return (
                              <div
                                key={store.id}
                                onClick={() => setSelectedStoreId(store.id)}
                                className={`p-4 rounded-[10px] border transition-all cursor-pointer text-left ${
                                  isSelected
                                    ? "bg-[#faedcd]/25 border-[#b6713e] ring-2 ring-[#b6713e]/70 shadow-xs"
                                    : "bg-white border-[#e5e5e5] hover:border-[#b6713e]/50 hover:bg-[#fbf9f5]/50"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                        isSelected
                                          ? "border-[#b6713e] bg-[#b6713e]"
                                          : "border-neutral-300 bg-white"
                                      }`}
                                    >
                                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-xs font-bold text-[#1c1c1c]">
                                          {isAr && store.nameAr ? store.nameAr : store.name}
                                        </h4>
                                        <span className="text-[10px] font-mono font-semibold text-neutral-400 bg-neutral-100 px-1.5 py-0.2 rounded">
                                          {store.code}
                                        </span>
                                      </div>

                                      <p className="text-[11px] text-neutral-600 flex items-center gap-1.5">
                                        <MapPin size={12} className="text-[#b6713e] shrink-0" />
                                        <span>{store.address}</span>
                                      </p>

                                      <p className="text-[10px] text-neutral-500 flex items-center gap-1.5">
                                        <PhoneCall size={11} className="text-neutral-400 shrink-0" />
                                        <span>{store.phone}</span>
                                        <span className="text-neutral-300">•</span>
                                        <Clock size={11} className="text-neutral-400 shrink-0" />
                                        <span>10:00 AM - 10:00 PM</span>
                                      </p>
                                    </div>
                                  </div>

                                  {/* Stock Status Badge */}
                                  <div className="shrink-0 text-right">
                                    {isFullyStocked ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                        <CheckCircle2 size={12} className="text-emerald-600" />
                                        <span>{isAr ? "جاهز فوراً • متوفر بالكامل" : "In Stock • Full Order"}</span>
                                      </span>
                                    ) : store.availableItemsCount > 0 ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                        <Clock size={11} className="text-amber-600" />
                                        <span>
                                          {isAr
                                            ? `متوفر ${store.availableItemsCount}/${store.totalItemsCount} قطع`
                                            : `${store.availableItemsCount}/${store.totalItemsCount} Items Available`}
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
                                        <Truck size={11} className="text-neutral-500" />
                                        <span>{isAr ? "طلب تحويل فرع" : "Transfer Required"}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Customer Visit Date & Time Slot Selection */}
                        <div className="pt-4 border-t border-[#f0ece1] space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                                <Calendar size={13} className="text-[#b6713e]" />
                                <span>{isAr ? "تحديد موعد زيارة البوتيك للاستلام *" : "Date of Visit / Collection *"}</span>
                              </label>
                              <span className="text-[10px] text-neutral-400">
                                {isAr ? "صالح لمدة 14 يوماً" : "Valid for 14 Days"}
                              </span>
                            </div>

                            {/* Quick selection pills for Date */}
                            <div className="flex flex-wrap gap-2 mb-2.5">
                              {[
                                {
                                  label: isAr ? "اليوم" : "Today",
                                  val: new Date().toISOString().split("T")[0],
                                },
                                {
                                  label: isAr ? "غداً" : "Tomorrow",
                                  val: new Date(Date.now() + 86400000).toISOString().split("T")[0],
                                },
                                {
                                  label: isAr ? "بعد غد" : "In 2 Days",
                                  val: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
                                },
                              ].map((pill) => (
                                <button
                                  type="button"
                                  key={pill.val}
                                  onClick={() => setPickupDate(pill.val)}
                                  className={`text-xs px-3 py-1.5 rounded-[5px] border font-semibold transition-all ${
                                    pickupDate === pill.val
                                      ? "bg-[#b6713e] text-white border-[#b6713e]"
                                      : "bg-white text-neutral-600 border-[#e5e5e5] hover:border-neutral-300"
                                  }`}
                                >
                                  {pill.label}
                                </button>
                              ))}
                            </div>

                            <input
                              type="date"
                              required={orderType === "PICKUP"}
                              value={pickupDate}
                              min={new Date().toISOString().split("T")[0]}
                              max={new Date(Date.now() + 86400000 * 21).toISOString().split("T")[0]}
                              onChange={(e) => setPickupDate(e.target.value)}
                              className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e] bg-white font-medium cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                              {isAr ? "الفترة المفضلة للحضور (اختياري)" : "Preferred Collection Window"}
                            </label>
                            <select
                              value={pickupTimeSlot}
                              onChange={(e) => setPickupTimeSlot(e.target.value)}
                              className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e] bg-white font-medium cursor-pointer"
                            >
                              <option value="Morning (10:00 AM - 1:00 PM)">
                                {isAr ? "الصباح (10:00 ص - 1:00 م)" : "Morning (10:00 AM - 1:00 PM)"}
                              </option>
                              <option value="Afternoon (1:00 PM - 5:00 PM)">
                                {isAr ? "الظهيرة والمساء (1:00 م - 5:00 م)" : "Afternoon (1:00 PM - 5:00 PM)"}
                              </option>
                              <option value="Evening (5:00 PM - 10:00 PM)">
                                {isAr ? "المساء والليل (5:00 م - 10:00 م)" : "Evening (5:00 PM - 10:00 PM)"}
                              </option>
                            </select>
                          </div>
                        </div>

                        {/* QR Code Pickup Pass Notice */}
                        <div className="p-4 bg-gradient-to-r from-[#faedcd]/40 to-[#fdfbf7] border border-[#ecdac1] rounded-[8px] flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-[#ecdac1] flex items-center justify-center text-[#b6713e] shrink-0 mt-0.5">
                            <QrCode size={18} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-[#1c1c1c]">
                              {isAr ? "بطاقة استلام رقمية فورية مع رمز QR" : "Instant Digital QR Pickup Pass"}
                            </h4>
                            <p className="text-[11px] text-neutral-600 leading-relaxed">
                              {isAr
                                ? "بمجرد إتمام الطلب، سيتم إصدار رمز QR فوري وإرساله إلى بريدك الإلكتروني. قم بإبرازه لموظف الفرع لاستلام عطورك الملكية بكل سهولة."
                                : "Upon order completion, a secure digital QR code and pickup PIN will be generated and emailed to you. Present it at the boutique counter to receive your perfumes."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 3: Gift Options & Personalization */}
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0ece1]">
                  <div className="flex items-center gap-2">
                    <Gift size={18} className="text-[#b6713e]" />
                    <h2 className="text-base font-bold text-[#1c1c1c]">
                      {isAr ? "3. خيارات الإهداء والتغليف الفاخر" : "3. Gift Options & Personalization"}
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#b6713e] font-semibold bg-[#faedcd]/40 px-2 py-0.5 rounded border border-[#ecdec1]">
                    {isAr ? "اختياري" : "Optional"}
                  </span>
                </div>

                {/* Gift Checkbox Toggle Card */}
                <label
                  htmlFor="is-gift-checkbox"
                  className={`flex items-start gap-3.5 p-4 rounded-[8px] border transition-all cursor-pointer ${
                    isGift
                      ? "bg-[#faedcd]/25 border-[#b6713e] ring-1 ring-[#b6713e]/60 shadow-xs"
                      : "bg-[#fbf9f5] border-[#e5e5e5] hover:border-neutral-300"
                  }`}
                >
                  <input
                    id="is-gift-checkbox"
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => {
                      setIsGift(e.target.checked);
                      if (e.target.checked && (!selectedGiftWrapOptionId || !availableGiftWrapOptions.some(o => o.id === selectedGiftWrapOptionId))) {
                        setSelectedGiftWrapOptionId(availableGiftWrapOptions[0]?.id || "free-card");
                      }
                    }}
                    className="mt-0.5 w-4 h-4 text-[#b6713e] rounded border-neutral-300 focus:ring-[#b6713e] cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1c1c1c] flex items-center gap-1.5">
                        <Gift size={14} className="text-[#b6713e]" />
                        <span>{isAr ? "هذا الطلب هدية لشخص مميز 🎁" : "This order is a gift"}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                      {isAr
                        ? "أضف بطاقة إهداء شخصية واختر من باقات التغليف الملكي الحصرية."
                        : "Include a personal message card and select from our bespoke luxury gift presentations."}
                    </p>
                  </div>
                </label>

                {/* Expanded Gift Options (Gift Message & Multi-tier Gift Wrap Selection) */}
                {isGift && (
                  <div className="pt-2 space-y-5 animate-in fade-in-50 duration-300">
                    {/* Gift Message Textbox */}
                    <div className="p-4 bg-[#fbf9f5] rounded-[8px] border border-[#f0ece1] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                          {isAr ? "رسالة الإهداء (بطاقة فاخرة مجانية مع كل هدية)" : "Gift Message (Complimentary Luxury Card Included)"}
                        </label>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {giftMessage.length}/300
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={300}
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        placeholder={
                          isAr
                            ? "اكتب كلمتك الخاصة هنا لتتم كتابتها بأناقة على بطاقة الإهداء الملكية..."
                            : "Write a personal message to be handwritten or printed on our signature luxury card..."
                        }
                        className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[6px] focus:outline-none focus:border-[#b6713e] bg-white leading-relaxed"
                      />
                      <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                        <span>✨</span>
                        <span>
                          {isAr
                            ? "توضع بطاقة الإهداء في مغلف مذهب ومختوم بشعار راميليت الملكي."
                            : "Placed inside a gold-foil envelope with the Ramillette royal seal."}
                        </span>
                      </p>
                    </div>

                    {/* Multi-tier Gift Packaging & Presentation Options */}
                    {allowGiftWrap && availableGiftWrapOptions.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-[#1c1c1c] flex items-center gap-1.5 uppercase tracking-wide">
                              <Sparkles size={13} className="text-[#b6713e]" />
                              <span>{isAr ? "اختر طريقة التغليف والتقديم" : "Select Gift Packaging & Presentation"}</span>
                            </h3>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              {isAr
                                ? "خيارات مصممة بعناية لتجعل تجربة فتح الهدية لا تُنسى"
                                : "Curated bespoke presentation styles for your special occasions"}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                            {availableGiftWrapOptions.length} {isAr ? "خيارات متاحة" : "Options"}
                          </span>
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {availableGiftWrapOptions.map((opt) => {
                            const isSelected = selectedGiftWrapOptionId === opt.id;
                            const isFree = Number(opt.price) === 0;

                            return (
                              <div
                                key={opt.id}
                                onClick={() => setSelectedGiftWrapOptionId(opt.id)}
                                className={`group relative rounded-[10px] border overflow-hidden transition-all cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? "border-[#b6713e] bg-[#faedcd]/20 ring-2 ring-[#b6713e]/70 shadow-sm"
                                    : "border-[#e5e5e5] bg-white hover:border-[#b6713e]/50 hover:bg-[#fbf9f5]/50"
                                }`}
                              >
                                {/* Sample Photo or Graphic Header */}
                                {opt.image ? (
                                  <div className="relative w-full aspect-[16/10] sm:aspect-auto sm:h-40 bg-neutral-100 overflow-hidden rounded-t-[9px] isolate">
                                    <Image
                                      src={opt.image}
                                      alt={isAr && opt.nameAr ? opt.nameAr : opt.name}
                                      fill
                                      sizes="(max-width: 640px) 95vw, (max-width: 1024px) 45vw, 360px"
                                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {opt.badge && (
                                      <span className="absolute top-2.5 right-2.5 max-w-[50%] truncate text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#1c1c1c]/85 text-[#d4af37] border border-[#d4af37]/40 shadow-xs backdrop-blur-xs">
                                        {isAr && opt.badgeAr ? opt.badgeAr : opt.badge}
                                      </span>
                                    )}
                                    {isSelected && (
                                      <span className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[10px] font-bold bg-[#b6713e] text-white px-2 py-0.5 rounded-full shadow-xs">
                                        <Check size={11} className="stroke-[3]" />
                                        <span>{isAr ? "تم الاختيار" : "Selected"}</span>
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="relative w-full h-32 sm:h-28 bg-gradient-to-br from-[#fcf9f5] via-[#faedcd]/35 to-[#f6ecdd] flex flex-col items-center justify-center p-3 text-center border-b border-[#f0ece1] rounded-t-[9px] isolate">
                                    <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#ecdac1] flex items-center justify-center text-[#b6713e] mb-1">
                                      <Gift size={20} />
                                    </div>
                                    <span className="text-[11px] font-bold text-[#8c5828]">
                                      {isAr ? "بطاقة إهداء راميليت الملكية" : "Ramillette Royal Note Card"}
                                    </span>
                                    {opt.badge && (
                                      <span className="absolute top-2.5 right-2.5 max-w-[50%] truncate text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#1c1c1c]/85 text-[#d4af37] border border-[#d4af37]/40 shadow-xs backdrop-blur-xs">
                                        {isAr && opt.badgeAr ? opt.badgeAr : opt.badge}
                                      </span>
                                    )}
                                    {isSelected && (
                                      <span className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[10px] font-bold bg-[#b6713e] text-white px-2 py-0.5 rounded-full shadow-xs">
                                        <Check size={11} className="stroke-[3]" />
                                        <span>{isAr ? "تم الاختيار" : "Selected"}</span>
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Option Info & Pricing */}
                                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                            isSelected
                                              ? "border-[#b6713e] bg-[#b6713e]"
                                              : "border-neutral-300 bg-white"
                                          }`}
                                        >
                                          {isSelected && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                          )}
                                        </div>
                                        <h4 className="text-xs font-bold text-[#1c1c1c] leading-tight">
                                          {isAr && opt.nameAr ? opt.nameAr : opt.name}
                                        </h4>
                                      </div>
                                      {isFree ? (
                                        <span className="shrink-0 text-[10px] font-extrabold text-[#0d9d00] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                                          {isAr ? "مجاناً" : "FREE"}
                                        </span>
                                      ) : (
                                        <span className="shrink-0 text-xs font-extrabold text-[#b6713e] bg-[#faedcd] px-2 py-0.5 rounded-full border border-[#ecdac1] whitespace-nowrap">
                                          +{formatPrice(opt.price, country)}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-neutral-600 mt-1.5 leading-relaxed line-clamp-2">
                                      {isAr && opt.descriptionAr ? opt.descriptionAr : opt.description}
                                    </p>
                                  </div>

                                  <div className="pt-2 flex items-center justify-between text-[10px] text-neutral-400 border-t border-neutral-100">
                                    <span>{config.name}</span>
                                    {isSelected ? (
                                      <span className="text-[#b6713e] font-semibold flex items-center gap-1">
                                        <Check size={10} /> {isAr ? "محدد للطلب" : "Selected"}
                                      </span>
                                    ) : (
                                      <span className="group-hover:text-[#b6713e] transition-colors">
                                        {isAr ? "انقر للاختيار" : "Click to select"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 4: Payment Method (Dynamic for QA, AE, BH) */}
              <div className="bg-white p-6 rounded-[8px] border border-[#e5e5e5] shadow-xs space-y-4">
                <h2 className="text-base font-bold text-[#1c1c1c] pb-3 border-b border-[#f0ece1]">
                  {isAr ? `4. طريقة الدفع (${config.name})` : `4. Payment Method (${config.name})`}
                </h2>

                <div className="space-y-3">
                  {availablePaymentMethods.map((method, idx) => {
                    const methodId = method.id || `method-${idx}`;
                    const isSelected = paymentMethod === methodId;
                    return (
                      <label
                        key={methodId}
                        className={`flex items-start gap-3 p-4 rounded-[6px] border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#b6713e] bg-[#faedcd]/20 shadow-xs"
                            : "border-[#e5e5e5] hover:border-neutral-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={methodId}
                          checked={isSelected}
                          onChange={() => setPaymentMethod(methodId)}
                          className="mt-0.5 text-[#b6713e] focus:ring-[#b6713e]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1c1c1c] flex items-center gap-1.5">
                              {methodId === "COD" ? (
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
                {orderType === "PICKUP"
                  ? (isAr ? `تأكيد طلب الاستلام من الفرع • ${formatPrice(finalTotal, country)}` : `Confirm Boutique Pickup • ${formatPrice(finalTotal, country)}`)
                  : (isAr ? `إتمام الطلب للتوصيل • ${formatPrice(finalTotal, country)}` : `Complete Order • ${formatPrice(finalTotal, country)}`)}
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
                {items.map((item, idx) => (
                  <div key={`${item.id || item.productId}-${idx}`} className="py-3 flex items-center gap-3">
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
                  <span>{orderType === "PICKUP" ? (isAr ? "استلام من البوتيك" : "Boutique Pickup") : `${config.name} Delivery`}</span>
                  <span className="font-semibold text-[#1c1c1c]">
                    {shipping === 0 ? (
                      <span className="text-[#0d9d00] font-bold">{isAr ? "مجاناً" : "FREE"}</span>
                    ) : (
                      formatPrice(shipping, country)
                    )}
                  </span>
                </div>

                {orderType === "PICKUP" && selectedStore && (
                  <div className="p-2.5 bg-[#faedcd]/30 border border-[#ecdac1] rounded-[6px] space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#1c1c1c] flex items-center gap-1 truncate">
                        <Store size={12} className="text-[#b6713e] shrink-0" />
                        <span className="truncate">{isAr && selectedStore.nameAr ? selectedStore.nameAr : selectedStore.name}</span>
                      </span>
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {isAr ? "محدد" : "Selected"}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 truncate">{selectedStore.address}</p>
                    <p className="text-[10px] text-neutral-700 font-medium">
                      <span className="text-neutral-400">{isAr ? "تاريخ الزيارة: " : "Visit Date: "}</span>
                      <strong>{pickupDate}</strong>
                      <span className="text-neutral-400"> • </span>
                      <span>{pickupTimeSlot.split(" ")[0]}</span>
                    </p>
                  </div>
                )}

                {/* Gift Wrap / Gift Card Line Item in Summary */}
                {isGift && (
                  <div className="flex justify-between items-center text-neutral-600 py-0.5">
                    <span className="flex items-center gap-1.5 truncate max-w-[210px]">
                      <Gift size={13} className="text-[#b6713e] shrink-0" />
                      <span className="truncate">
                        {selectedGiftWrapOption
                          ? (isAr && selectedGiftWrapOption.nameAr ? selectedGiftWrapOption.nameAr : selectedGiftWrapOption.name)
                          : (isAr ? "بطاقة إهداء شخصية" : "Personal Gift Card")}
                      </span>
                    </span>
                    <span className="font-semibold text-[#1c1c1c] shrink-0">
                      {giftWrapAmount > 0 ? (
                        <span className="text-[#b6713e]">+{formatPrice(giftWrapAmount, country)}</span>
                      ) : (
                        <span className="text-[#0d9d00] font-bold text-[10px] uppercase">{isAr ? "مجاناً" : "FREE"}</span>
                      )}
                    </span>
                  </div>
                )}

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
