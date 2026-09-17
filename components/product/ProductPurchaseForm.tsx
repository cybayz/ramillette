"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/lib/store/useCartStore";
import { useLanguageStore } from "@/lib/store/useLanguageStore";
import { getProductTitle } from "@/lib/i18n";
import {
  Star,
  MapPin,
  ShoppingCart,
  Truck,
  Sparkles,
  Package,
  Bell,
  Check,
  X,
} from "lucide-react";

export interface VariantData {
  id: string;
  name: string;
  sku?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stock?: number;
}

interface ProductPurchaseFormProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    compareAtPrice?: number | null;
    stock: number;
    images: { url: string }[];
    topNotes?: string | null;
    heartNotes?: string | null;
    baseNotes?: string | null;
    inspiredBy?: string | null;
    gender?: string | null;
    concentration?: string | null;
    description?: string | null;
    reviewsCount?: number;
  };
  variants: VariantData[];
}

export function ProductPurchaseForm({
  product,
  variants,
}: ProductPurchaseFormProps) {
  const router = useRouter();
  const { addItem, openCart } = useCartStore();
  const { language } = useLanguageStore();
  const isArabic = language === "ar";

  // Default to the 50ml variant if available (as shown in reference screenshot), or middle, or first
  const defaultVariant =
    variants.find((v) => v.name.toLowerCase().includes("50")) ||
    (variants.length > 1 ? variants[1] : variants[0]) || {
      id: "default",
      name: "50ml",
      price: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
    };

  const [selectedVariant, setSelectedVariant] = useState<VariantData>(defaultVariant);
  const [activeTab, setActiveTab] = useState<"description" | "notes" | "specifications">("notes");

  // Out of stock calculation
  const isOutOfStock =
    (selectedVariant.stock !== undefined && selectedVariant.stock <= 0) ||
    (variants.length === 0 && product.stock <= 0);

  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  // Sync URL query if variant changes
  useEffect(() => {
    if (typeof window !== "undefined" && selectedVariant.sku) {
      const url = new URL(window.location.href);
      const variantNumeric = selectedVariant.sku.split("-").pop() || selectedVariant.id;
      url.searchParams.set("variant", variantNumeric);
      window.history.replaceState({}, "", url.toString());
    }
  }, [selectedVariant]);

  const currentPrice = selectedVariant.price;
  const displayName = getProductTitle(product.name, product.slug, language);
  const reviewsCount = product.reviewsCount ?? 10;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant.id !== "default" ? selectedVariant.id : undefined,
      name: product.name,
      variantName: selectedVariant.name.replace(/'/g, ""),
      slug: product.slug,
      price: currentPrice,
      image: product.images[0]?.url || "",
      quantity: 1,
      maxStock: selectedVariant.stock ?? 50,
    });
    openCart();
  };

  const handleBuyNow = async () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant.id !== "default" ? selectedVariant.id : undefined,
      name: product.name,
      variantName: selectedVariant.name.replace(/'/g, ""),
      slug: product.slug,
      price: currentPrice,
      image: product.images[0]?.url || "",
      quantity: 1,
      maxStock: selectedVariant.stock ?? 50,
    });

    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data?.user) {
        window.location.href = isArabic ? "/ar/checkout" : "/checkout";
      } else {
        window.location.href = isArabic
          ? "/ar/account/login?redirect=/ar/checkout"
          : "/account/login?redirect=/checkout";
      }
    } catch {
      window.location.href = isArabic
        ? "/ar/account/login?redirect=/ar/checkout"
        : "/account/login?redirect=/checkout";
    }
  };

  // Helper to parse notes string into chips array
  const parseNotes = (notesStr?: string | null, fallback: string[] = []) => {
    if (!notesStr) return fallback;
    return notesStr
      .split(/[,/·•]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const topNotesList = parseNotes(product.topNotes, ["Rose", "Lavender", "Peony", "Orange"]);
  const middleNotesList = parseNotes(product.heartNotes, ["Jasmine", "Frankincense", "Sandalwood", "Cambodian Oudh"]);
  const baseNotesList = parseNotes(product.baseNotes, ["Oakmoss", "Guaiac Wood", "Agarwood", "Leather", "Amber", "Musk"]);

  return (
    <div className="flex flex-col">
      {/* Product Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1c] tracking-tight">
        {displayName}
      </h1>

      {/* 5 Teal-Green Stars & Reviews Count */}
      <div className="flex items-center gap-1.5 mt-1.5 mb-2">
        <div className="flex items-center text-[#108475]">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>
        <span className="text-[12.5px] text-neutral-600 font-normal">
          {reviewsCount} {isArabic ? "تقييمات" : "reviews"}
        </span>
      </div>

      {/* Main Dynamic Price */}
      <div className="text-2xl sm:text-[26px] font-bold text-[#1c1c1c] my-1">
        {isArabic
          ? `${currentPrice.toFixed(2)} ر.ق`
          : `QAR ${currentPrice.toFixed(2)}`}
      </div>

      {/* Size Variant Options */}
      {variants.length > 0 && (
        <div className="mt-2 mb-3">
          <div className="text-[13px] font-semibold text-neutral-700 mb-2">
            {isArabic ? "الحجم:" : "Size:"}{" "}
            <span className="text-neutral-900 font-bold">
              {selectedVariant.name.replace(/'/g, "")}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {variants.map((variant) => {
              const isSelected = selectedVariant.id === variant.id;
              const cleanName = variant.name.replace(/'/g, "");

              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariant(variant)}
                  className={`flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-[10px] border transition-all text-center cursor-pointer ${
                    isSelected
                      ? "border-2 border-[#4e6648] bg-[#f4f7f3] text-[#4e6648] shadow-xs"
                      : "border-[#d8d8d8] bg-white text-neutral-800 hover:border-neutral-800"
                  }`}
                >
                  {/* Variant Thumbnail Image */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 relative mb-1.5 flex items-center justify-center">
                    <Image
                      src={product.images[0]?.url || ""}
                      alt={cleanName}
                      fill
                      className="object-contain"
                      sizes="60px"
                    />
                  </div>

                  {/* Size Label & Price */}
                  <span className="text-[12.5px] font-bold leading-tight">
                    {cleanName}
                  </span>
                  <span
                    className={`text-[11.5px] font-semibold mt-0.5 ${
                      isSelected ? "text-[#4e6648]" : "text-neutral-500"
                    }`}
                  >
                    {isArabic
                      ? `${Number(variant.price).toFixed(2)} ر.ق`
                      : `QAR ${Number(variant.price).toFixed(2)}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Deliver To Qatar Notice */}
      <div className="flex items-center gap-2 py-2.5 border-t border-b border-[#ececec] text-[13px] text-neutral-700 my-2">
        <MapPin size={15} className="text-[#4e6648] shrink-0" />
        <span>
          {isArabic ? "التوصيل إلى" : "Deliver to"}{" "}
          <b className="text-[#1c1c1c]">{isArabic ? "قطر" : "Qatar"}</b>{" "}
          <span aria-hidden="true">·</span>{" "}
          <b className="text-[#1c1c1c]">{isArabic ? "جميع مناطق قطر" : "All over Qatar"}</b>
        </span>
      </div>

      {/* Add to Cart & Buy Now Buttons OR Notify Me if Out of Stock */}
      {isOutOfStock ? (
        <div className="my-3">
          <button
            type="button"
            onClick={() => setIsNotifyModalOpen(true)}
            className="w-full py-3.5 px-4 rounded-[8px] border border-amber-500/40 hover:border-amber-600 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-[14px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Bell size={18} className="stroke-[2] text-amber-700" />
            <span>{isArabic ? "أعلمني عند التوفر" : "Notify Me When Available"}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 my-3">
          {/* Add to Cart (Outline style) */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="py-3 px-4 rounded-[8px] border border-[#cfcfcf] hover:border-black bg-white text-[#1c1c1c] text-[14px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <ShoppingCart size={17} className="stroke-[1.8]" />
            <span>{isArabic ? "أضف إلى السلة" : "Add to cart"}</span>
          </button>

          {/* Buy Now (Solid Black style) */}
          <button
            type="button"
            onClick={handleBuyNow}
            className="py-3 px-4 rounded-[8px] bg-black hover:bg-neutral-800 text-white text-[14px] font-bold flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <span>{isArabic ? "اشترِ الآن" : "Buy Now"}</span>
          </button>
        </div>
      )}

      {/* Value Prop Highlights */}
      <ul className="space-y-2 py-2.5 text-[13px] text-neutral-700">
        <li className="flex items-center gap-2.5">
          <Sparkles size={14} className="text-neutral-500 shrink-0" />
          <span>{isArabic ? "عطور فاخرة مستوحاة" : "Premium inspired fragrances"}</span>
        </li>
        <li className="flex items-center gap-2.5">
          <Truck size={14} className="text-neutral-500 shrink-0" />
          <span>{isArabic ? "توصيل سريع في جميع أنحاء قطر" : "Fast delivery across Qatar"}</span>
        </li>
        <li className="flex items-center gap-2.5">
          <Package size={14} className="text-neutral-500 shrink-0" />
          <span>{isArabic ? "أحجام متعددة متوفرة" : "Multiple sizes available"}</span>
        </li>
      </ul>

      {/* Interactive Tabs (DESCRIPTION | NOTES | SPECIFICATIONS) */}
      <div className="mt-4 pt-1">
        {/* Tab Headers */}
        <div className="flex items-center gap-8 border-b-2 border-[#ececec]">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`py-3 text-[13px] font-bold tracking-wider uppercase transition-colors relative cursor-pointer ${
              activeTab === "description"
                ? "text-black border-b-2 border-[#4e6648] -mb-[2px]"
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            {isArabic ? "الوصف" : "DESCRIPTION"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`py-3 text-[13px] font-bold tracking-wider uppercase transition-colors relative cursor-pointer ${
              activeTab === "notes"
                ? "text-black border-b-2 border-[#4e6648] -mb-[2px]"
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            {isArabic ? "النوتات العطرية" : "NOTES"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("specifications")}
            className={`py-3 text-[13px] font-bold tracking-wider uppercase transition-colors relative cursor-pointer ${
              activeTab === "specifications"
                ? "text-black border-b-2 border-[#4e6648] -mb-[2px]"
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            {isArabic ? "المواصفات" : "SPECIFICATIONS"}
          </button>
        </div>

        {/* Tab Panels */}
        <div className="pt-4">
          {/* DESCRIPTION TAB */}
          {activeTab === "description" && (
            <div className="space-y-3">
              <div className="p-4 rounded-[10px] bg-[#fafaf8] border border-[#ececec]">
                <h3 className="text-sm font-bold text-neutral-900 mb-1">
                  {isArabic ? "عن هذا العطر" : "About this scent"}
                </h3>
                <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed mb-2">
                  {product.description || "A rich rosy oud fragrance with smooth warm sweetness."}
                </p>
                <span className="inline-block px-3 py-1 rounded-full bg-[#f4f7f3] border border-[#4e6648]/25 text-[#4e6648] text-[11px] font-bold">
                  {isArabic ? "مستوحى من" : "Inspired by"}{" "}
                  {product.inspiredBy || "Ahmed Al Maghribi"}
                </span>
              </div>
            </div>
          )}

          {/* NOTES TAB (Exactly as in Reference Screenshot!) */}
          {activeTab === "notes" && (
            <div className="space-y-2">
              {/* TOP NOTES */}
              <div className="flex items-center gap-3 p-2.5 rounded-[8px] border border-[#f0ece1] bg-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a6d3b] min-w-[95px] shrink-0">
                  {isArabic ? "القمة العطرية" : "TOP NOTES"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {topNotesList.map((note, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#f7f6f2] rounded-[6px] text-[12px] font-medium text-neutral-800"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* MIDDLE NOTES */}
              <div className="flex items-center gap-3 p-2.5 rounded-[8px] border border-[#f0ece1] bg-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a6d3b] min-w-[95px] shrink-0">
                  {isArabic ? "قلب العطر" : "MIDDLE NOTES"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {middleNotesList.map((note, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#f7f6f2] rounded-[6px] text-[12px] font-medium text-neutral-800"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* BASE NOTES */}
              <div className="flex items-center gap-3 p-2.5 rounded-[8px] border border-[#f0ece1] bg-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a6d3b] min-w-[95px] shrink-0">
                  {isArabic ? "قاعدة العطر" : "BASE NOTES"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {baseNotesList.map((note, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#f7f6f2] rounded-[6px] text-[12px] font-medium text-neutral-800"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SPECIFICATIONS TAB */}
          {activeTab === "specifications" && (
            <div className="border border-[#ececec] rounded-[10px] overflow-hidden text-[13px]">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-[#ececec] bg-[#fafaf8]">
                    <th className="py-2.5 px-4 text-start font-bold text-neutral-700 w-1/3">
                      {isArabic ? "الجنس" : "Gender"}
                    </th>
                    <td className="py-2.5 px-4 text-neutral-800">
                      {product.gender || (isArabic ? "للجنسين" : "Unisex")}
                    </td>
                  </tr>
                  <tr className="border-b border-[#ececec]">
                    <th className="py-2.5 px-4 text-start font-bold text-neutral-700">
                      {isArabic ? "مستوحى من" : "Inspired by"}
                    </th>
                    <td className="py-2.5 px-4 text-neutral-800">
                      {product.inspiredBy || "Ahmed Al Maghribi"}
                    </td>
                  </tr>
                  <tr className="border-b border-[#ececec] bg-[#fafaf8]">
                    <th className="py-2.5 px-4 text-start font-bold text-neutral-700">
                      {isArabic ? "التركيز" : "Concentration"}
                    </th>
                    <td className="py-2.5 px-4 text-neutral-800">
                      {product.concentration || "Extrait de Parfum"}
                    </td>
                  </tr>
                  <tr className="border-b border-[#ececec]">
                    <th className="py-2.5 px-4 text-start font-bold text-neutral-700">
                      {isArabic ? "العلامة التجارية" : "Brand"}
                    </th>
                    <td className="py-2.5 px-4 text-neutral-800">
                      {isArabic ? "راميلليت" : "Ramillette"}
                    </td>
                  </tr>
                  <tr className="border-b border-[#ececec] bg-[#fafaf8]">
                    <th className="py-2.5 px-4 text-start font-bold text-neutral-700">
                      {isArabic ? "الأحجام" : "Quantity"}
                    </th>
                    <td className="py-2.5 px-4 text-neutral-800">
                      {variants.map((v) => v.name.replace(/'/g, "")).join(", ") || "100ml, 50ml, 30ml"}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2.5 px-4 text-start font-bold text-neutral-700">
                      {isArabic ? "رمز المنتج" : "SKU"}
                    </th>
                    <td className="py-2.5 px-4 text-neutral-800">
                      {selectedVariant.sku || "1088"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Out of Stock Notify Modal */}
      {isNotifyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => {
            setIsNotifyModalOpen(false);
            setNotifySubmitted(false);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-neutral-200 relative text-start animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setIsNotifyModalOpen(false);
                setNotifySubmitted(false);
              }}
              className="absolute top-3.5 right-3.5 rtl:right-auto rtl:left-3.5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 pr-8 rtl:pr-0 rtl:pl-8">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f7f5f0] shrink-0 border border-neutral-200/80">
                <Image
                  src={product.images[0]?.url || ""}
                  alt={displayName}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-neutral-900 truncate">
                  {displayName}
                </h4>
                <div className="text-xs text-neutral-500 font-medium">
                  {selectedVariant.name.replace(/'/g, "")}
                </div>
                <span className="inline-block mt-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm">
                  {isArabic ? "نفدت الكمية" : "Out of Stock"}
                </span>
              </div>
            </div>

            {notifySubmitted ? (
              <div className="mt-5 py-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#f2f6f1] text-[#4e6648] flex items-center justify-center mb-3">
                  <Check size={24} className="stroke-[2.5]" />
                </div>
                <h5 className="text-sm font-bold text-neutral-900">
                  {isArabic ? "تم تسجيل طلبك بنجاح!" : "You're on the waitlist!"}
                </h5>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {isArabic
                    ? "سنرسل إليك إشعاراً فور توفر هذا العطر مجدداً في متجرنا."
                    : "We'll send you an update as soon as this item is back in stock."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifyModalOpen(false);
                    setNotifySubmitted(false);
                  }}
                  className="mt-4 px-5 py-2 bg-[#4e6648] hover:bg-[#3d5239] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {isArabic ? "حسناً" : "Got it"}
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!notifyEmail && !notifyPhone) return;
                  setNotifyLoading(true);
                  try {
                    await fetch("/api/notify-stock", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        productId: product.id,
                        productName: product.name,
                        variantName: selectedVariant.name,
                        email: notifyEmail,
                        phone: notifyPhone,
                      }),
                    });
                  } catch {
                    // ignore
                  } finally {
                    setNotifyLoading(false);
                    setNotifySubmitted(true);
                  }
                }}
                className="mt-4 pt-3 border-t border-neutral-100"
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-neutral-900">
                  <Bell size={16} className="text-[#4e6648]" />
                  <span className="text-xs font-bold">
                    {isArabic ? "أعلمني عند توفر المنتج" : "Notify me when available"}
                  </span>
                </div>
                <p className="text-[11.5px] text-neutral-500 mb-3 leading-relaxed">
                  {isArabic
                    ? "أدخل بريدك الإلكتروني أو رقم هاتفك وسنبلغك فور توفر هذا المنتج مجدداً."
                    : "Leave your email or phone and we will notify you the moment this fragrance arrives."}
                </p>

                <div className="space-y-2">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder={isArabic ? "البريد الإلكتروني (name@example.com)" : "Email address (name@example.com)"}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-[#4e6648] focus:ring-1 focus:ring-[#4e6648] bg-neutral-50/50"
                  />
                  <input
                    type="tel"
                    value={notifyPhone}
                    onChange={(e) => setNotifyPhone(e.target.value)}
                    placeholder={isArabic ? "رقم الهاتف / واتساب (اختياري)" : "Phone / WhatsApp (optional)"}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-[#4e6648] focus:ring-1 focus:ring-[#4e6648] bg-neutral-50/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={notifyLoading || (!notifyEmail && !notifyPhone)}
                  className="w-full mt-3.5 py-2.5 bg-[#4e6648] hover:bg-[#3d5239] disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <Bell size={14} />
                  <span>{notifyLoading ? (isArabic ? "جاري الإرسال..." : "Sending...") : (isArabic ? "أعلمني عند التوفر" : "Notify Me")}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
