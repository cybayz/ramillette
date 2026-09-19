"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ShoppingCart, X, Bell, Check } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useLanguageStore } from "@/lib/store/useLanguageStore";
import { productArabicNames } from "@/lib/i18n";
import { cn, formatPrice } from "@/lib/utils";
import { useCountryStore } from "@/lib/store/useCountryStore";
import { resolveProductForCountry, resolveVariantForCountry } from "@/lib/country/productResolver";

export interface CardVariant {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  stock?: number;
  countries?: any[];
}

export interface CardProduct {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  categoryName?: string;
  basePrice: number;
  compareAtPrice?: number | null;
  bestseller?: boolean;
  newArrival?: boolean;
  images: { url: string; alt?: string | null }[];
  variants?: CardVariant[];
  rating?: number;
  reviewsCount?: number;
  stock?: number;
  countries?: any[];
}

interface ProductCardProps {
  product: CardProduct;
  className?: string;
  isArabic?: boolean;
  variant?: "standard" | "collection";
  selectedSize?: string;
}

export function ProductCard({
  product,
  className,
  isArabic,
  variant = "standard",
  selectedSize,
}: ProductCardProps) {
  const pathname = usePathname();
  const { addItem, openCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { language } = useLanguageStore();

  const { country } = useCountryStore();
  const isArabicActive = isArabic ?? Boolean(pathname?.startsWith("/ar"));
  const productHref = isArabicActive ? `/ar/product/${product.slug}` : `/product/${product.slug}`;

  const resolvedProd = React.useMemo(() => {
    return resolveProductForCountry(product, country);
  }, [product, country]);

  // Guaranteed list of variants resolved for active country
  const availableVariants: CardVariant[] = React.useMemo(() => {
    const rawVariants =
      product.variants && product.variants.length > 0
        ? product.variants
        : [
            {
              id: "default",
              name:
                selectedSize && selectedSize !== "all" && selectedSize !== "All"
                  ? selectedSize
                  : "50ml",
              price: product.basePrice,
              compareAtPrice: product.compareAtPrice,
              stock: product.stock ?? 50,
              countries: product.countries,
            },
          ];

    return rawVariants.map((v) => {
      const res = resolveVariantForCountry(v, country);
      return {
        ...v,
        price: res.price,
        compareAtPrice: res.compareAtPrice,
        stock: res.stock,
      };
    });
  }, [
    product.variants,
    product.basePrice,
    product.compareAtPrice,
    product.stock,
    product.countries,
    selectedSize,
    country,
  ]);

  // Check if product or its variants are out of stock
  const isOutOfStock = React.useMemo(() => {
    if (resolvedProd.stock <= 0) return true;
    if (availableVariants.length > 0) {
      return availableVariants.every((v) => v.stock !== undefined && v.stock <= 0);
    }
    return false;
  }, [resolvedProd.stock, availableVariants]);

  // Find variant matching selectedSize, or default to first variant
  const activeVariant = React.useMemo(() => {
    if (availableVariants.length === 0) return null;
    if (selectedSize && selectedSize !== "all" && selectedSize !== "All") {
      const match = availableVariants.find(
        (v) =>
          v.name.toLowerCase() === selectedSize.toLowerCase() ||
          v.name.toLowerCase().includes(selectedSize.toLowerCase())
      );
      if (match) return match;
    }
    return availableVariants[0];
  }, [availableVariants, selectedSize]);

  const [selectedVariant, setSelectedVariant] = useState<CardVariant | null>(activeVariant);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<CardVariant | null>(activeVariant);

  // Notify Me modal state
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  React.useEffect(() => {
    if (activeVariant) {
      setSelectedVariant(activeVariant);
      setModalVariant(activeVariant);
    }
  }, [activeVariant]);

  const [isHovered, setIsHovered] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const primaryImage =
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600";
  const hoverImage = product.images[1]?.url || primaryImage;

  const currentPrice = selectedVariant ? selectedVariant.price : resolvedProd.price;

  // Size badge text
  const sizeBadge =
    selectedSize && selectedSize !== "all" && selectedSize !== "All"
      ? selectedSize
      : selectedVariant?.name || availableVariants[0]?.name || "50ml";

  // Localized product name and labels
  const isAr = isArabic || pathname?.startsWith("/ar") || language === "ar";
  const displayName = isAr
    ? productArabicNames[product.slug] ||
      productArabicNames[product.name] ||
      product.name
    : product.name;

  const chooseAndBuyText = isAr ? "اختر واشترِ" : "Choose & Buy";
  const addToCartText = isAr ? "أضف إلى السلة" : "Add to cart";
  const notifyMeText = isAr ? "أعلمني عند التوفر" : "Notify Me";
  const outOfStockText = isAr ? "نفدت الكمية" : "Out of Stock";
  const brandName = isAr ? "راميليت" : (product.brand || "RAMILLETTE");
  const reviewsText = isAr ? "10 تقييمات" : "10 reviews";

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      setIsNotifyModalOpen(true);
      return;
    }

    // Always show the ML volume popup for consistency (even if 1 variant)
    setIsOptionsModalOpen(true);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      image: primaryImage,
      categoryName: product.categoryName,
    });
  };

  return (
    <div
      className={cn("group relative flex flex-col bg-white", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area with Hover Effect */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#f7f5f0]">
        {/* Size Badge (e.g. 30ml / 80ml) on Top Left */}
        {sizeBadge && (
          <span className="absolute top-2.5 start-2.5 z-10 bg-white/95 text-neutral-900 text-[11px] font-bold px-2 py-0.5 rounded-[4px] shadow-xs">
            {sizeBadge}
          </span>
        )}

        {/* Out of stock badge */}
        {isOutOfStock && (
          <span className="absolute bottom-2.5 start-2.5 z-10 bg-neutral-900/85 backdrop-blur-xs text-white text-[10.5px] font-bold px-2.5 py-0.5 rounded-[4px] shadow-xs">
            {outOfStockText}
          </span>
        )}

        {/* Floating Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-2.5 end-2.5 z-10 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110",
            isWishlisted ? "text-red-500" : "text-neutral-700 hover:text-[#4e6648]"
          )}
        >
          <Heart
            size={16}
            className={cn("transition-transform duration-200 active:scale-125", {
              "fill-current text-red-500": isWishlisted,
            })}
          />
        </button>

        {/* Primary and Hover Image Cross-Fade */}
        <Link href={productHref} className="block w-full h-full relative cursor-pointer">
          <Image
            src={primaryImage}
            alt={displayName}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={cn(
              "object-cover transition-all duration-500 ease-in-out",
              isHovered && hoverImage !== primaryImage
                ? "opacity-0 scale-105"
                : "opacity-100 scale-100"
            )}
          />

          {hoverImage !== primaryImage && (
            <Image
              src={hoverImage}
              alt={`${displayName} alternate view`}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className={cn(
                "object-cover transition-all duration-500 ease-in-out absolute inset-0",
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              )}
            />
          )}
        </Link>
      </div>

      {variant === "collection" ? (
        /* Collection View Card Details */
        <div className="flex flex-col flex-1 pt-2.5 text-start">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
            {brandName}
          </span>
          <Link
            href={productHref}
            className="text-[14px] sm:text-[15px] font-bold text-neutral-900 hover:text-[#4e6648] transition-colors line-clamp-1 block text-start"
          >
            {displayName}
          </Link>
          <div className="mt-1 text-start">
            <span className="text-[14px] sm:text-[15px] font-bold text-neutral-900">
              {formatPrice(currentPrice, country)}
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-1.5">
            {/* Button 1: Add to Cart (or Notify Me if Out of Stock) */}
            {isOutOfStock ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsNotifyModalOpen(true);
                }}
                className="w-full py-2 px-2 border border-amber-500/40 hover:border-amber-600 bg-amber-50/80 hover:bg-amber-100 text-amber-900 rounded-[6px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Bell size={14} className="stroke-[2] text-amber-700 shrink-0" />
                <span className="truncate">{notifyMeText}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCartClick}
                className="w-full py-2 px-2 border border-neutral-200 hover:border-[#233324] hover:bg-[#233324] hover:text-white rounded-[6px] text-xs font-semibold text-neutral-900 bg-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <ShoppingCart size={14} className="stroke-[2] shrink-0" />
                <span className="truncate">{addToCartText}</span>
              </button>
            )}

            {/* Button 2: Choose & Buy (Navigates to Product Detail Page) */}
            <Link
              href={productHref}
              className="w-full py-1.5 px-2 bg-[#4e6648] hover:bg-[#3d5239] text-white rounded-[6px] text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer shadow-2xs text-center truncate"
            >
              <span className="truncate">{chooseAndBuyText}</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Standard View Card Details (Star ratings + dual action buttons) */
        <div className="flex flex-col flex-1 pt-3 text-start">
          <Link
            href={productHref}
            className="text-[15px] font-bold text-[#1c1c1c] hover:text-[#4e6648] transition-colors line-clamp-1 block text-start"
          >
            {displayName}
          </Link>

          <div className="flex items-center gap-1.5 mt-1">
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
            <span className="text-[12px] text-neutral-600 font-normal">
              {reviewsText}
            </span>
          </div>

          <div className="mt-1.5 text-start">
            <span className="text-[15px] sm:text-base font-bold text-[#1c1c1c]">
              {formatPrice(currentPrice, country)}
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {/* Button 1: Add to Cart to show popup & add to cart (or Notify Me if Out of Stock) */}
            {isOutOfStock ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsNotifyModalOpen(true);
                }}
                className="w-full py-2 px-2 border border-amber-500/40 hover:border-amber-600 bg-amber-50/80 hover:bg-amber-100 text-amber-900 rounded-[6px] text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Bell size={14} className="stroke-[2] text-amber-700 shrink-0" />
                <span className="truncate">{notifyMeText}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCartClick}
                className="w-full py-2 px-2 border border-[#cfd3db] hover:border-[#1c1c1c] rounded-[6px] text-xs sm:text-[13px] font-semibold text-[#1c1c1c] bg-white hover:bg-neutral-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center shadow-2xs"
              >
                <ShoppingCart size={14} className="stroke-[1.8] shrink-0" />
                <span className="truncate">{addToCartText}</span>
              </button>
            )}

            {/* Button 2: Choose & Buy (Navigates directly to Product Detail Page) */}
            <Link
              href={productHref}
              className="w-full py-2 px-2 bg-[#4e6648] hover:bg-[#3d5239] text-white rounded-[6px] text-xs sm:text-[13px] font-semibold flex items-center justify-center transition-colors cursor-pointer shadow-xs active:scale-[0.99] text-center"
            >
              <span className="truncate">{chooseAndBuyText}</span>
            </Link>
          </div>
        </div>
      )}

      {/* ML Options Selection Popup (Consistent across all products, even 1 variant) */}
      {isOptionsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOptionsModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-neutral-200 relative text-start animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOptionsModalOpen(false);
              }}
              className="absolute top-3.5 right-3.5 rtl:right-auto rtl:left-3.5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Product Thumbnail & Details */}
            <div className="flex items-center gap-3 pr-8 rtl:pr-0 rtl:pl-8">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f7f5f0] shrink-0 border border-neutral-200/80">
                <Image
                  src={primaryImage}
                  alt={displayName}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                  {brandName}
                </span>
                <h4 className="text-sm font-bold text-neutral-900 truncate">
                  {displayName}
                </h4>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="text-base font-bold text-[#4e6648]">
                    {formatPrice(modalVariant?.price ?? currentPrice, country)}
                  </span>
                  {modalVariant?.compareAtPrice && modalVariant.compareAtPrice > modalVariant.price && (
                    <span className="text-xs text-neutral-400 line-through">
                      {formatPrice(modalVariant.compareAtPrice, country)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Volume / ML Options Selector */}
            <div className="mt-4 pt-3 border-t border-neutral-100">
              <label className="text-xs font-semibold text-neutral-700 block mb-2">
                {isAr ? "اختر الحجم (مل):" : "Select Size (ML):"}
              </label>
              <div
                className={cn(
                  "grid gap-2",
                  availableVariants.length === 1
                    ? "grid-cols-1"
                    : availableVariants.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
                )}
              >
                {availableVariants.map((v) => {
                  const isSelected = (modalVariant?.id || selectedVariant?.id) === v.id;
                  const isVarOutOfStock = v.stock !== undefined && v.stock <= 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={isVarOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalVariant(v);
                      }}
                      className={cn(
                        "py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer",
                        isVarOutOfStock
                          ? "border-neutral-200 bg-neutral-100/60 text-neutral-400 opacity-60 cursor-not-allowed line-through"
                          : isSelected
                          ? "border-[#4e6648] bg-[#f2f6f1] text-[#233324] ring-1 ring-[#4e6648] font-bold"
                          : "border-neutral-200 hover:border-neutral-400 bg-white text-neutral-800"
                      )}
                    >
                      <div className="text-xs font-bold">{v.name}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5 font-medium">
                        {isVarOutOfStock ? outOfStockText : formatPrice(v.price, country)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirm & Add to Cart Button */}
            <div className="mt-5">
              {modalVariant?.stock !== undefined && modalVariant.stock <= 0 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOptionsModalOpen(false);
                    setIsNotifyModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <Bell size={15} />
                  <span>{notifyMeText}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const finalVariant = modalVariant || selectedVariant || availableVariants[0];
                    addItem({
                      productId: product.id,
                      variantId: finalVariant.id !== "default" ? finalVariant.id : undefined,
                      name: product.name,
                      variantName: finalVariant.name,
                      slug: product.slug,
                      price: finalVariant.price,
                      image: primaryImage,
                      quantity: 1,
                      maxStock: finalVariant.stock ?? 50,
                    });
                    setSelectedVariant(finalVariant);
                    setIsOptionsModalOpen(false);
                    openCart();
                  }}
                  className="w-full py-2.5 bg-[#4e6648] hover:bg-[#3d5239] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <ShoppingCart size={15} className="stroke-[2]" />
                  <span>
                    {addToCartText} • {formatPrice(modalVariant?.price ?? currentPrice, country)}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Out of Stock Notify Me Modal */}
      {isNotifyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsNotifyModalOpen(false);
            setNotifySubmitted(false);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-neutral-200 relative text-start animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsNotifyModalOpen(false);
                setNotifySubmitted(false);
              }}
              className="absolute top-3.5 right-3.5 rtl:right-auto rtl:left-3.5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Product Thumbnail & Details */}
            <div className="flex items-center gap-3 pr-8 rtl:pr-0 rtl:pl-8">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f7f5f0] shrink-0 border border-neutral-200/80">
                <Image
                  src={primaryImage}
                  alt={displayName}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                  {brandName}
                </span>
                <h4 className="text-sm font-bold text-neutral-900 truncate">
                  {displayName}
                </h4>
                <span className="inline-block mt-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm">
                  {outOfStockText}
                </span>
              </div>
            </div>

            {notifySubmitted ? (
              <div className="mt-5 py-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#f2f6f1] text-[#4e6648] flex items-center justify-center mb-3">
                  <Check size={24} className="stroke-[2.5]" />
                </div>
                <h5 className="text-sm font-bold text-neutral-900">
                  {isAr ? "تم تسجيل طلبك بنجاح!" : "You're on the waitlist!"}
                </h5>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {isAr
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
                  {isAr ? "حسناً" : "Got it"}
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!notifyEmail && !notifyPhone) return;
                  setNotifyLoading(true);
                  try {
                    await fetch("/api/notify-stock", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        productId: product.id,
                        productName: product.name,
                        variantName: modalVariant?.name || selectedVariant?.name,
                        email: notifyEmail,
                        phone: notifyPhone,
                      }),
                    });
                  } catch {
                    // Gracefully handle
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
                    {isAr ? "أعلمني عند توفر المنتج" : "Notify me when available"}
                  </span>
                </div>
                <p className="text-[11.5px] text-neutral-500 mb-3 leading-relaxed">
                  {isAr
                    ? "أدخل بريدك الإلكتروني أو رقم هاتفك وسنبلغك فور توفر هذا المنتج مجدداً."
                    : "Leave your email or phone and we will notify you the moment this fragrance arrives."}
                </p>

                <div className="space-y-2">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder={isAr ? "البريد الإلكتروني (name@example.com)" : "Email address (name@example.com)"}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-[#4e6648] focus:ring-1 focus:ring-[#4e6648] bg-neutral-50/50"
                  />
                  <input
                    type="tel"
                    value={notifyPhone}
                    onChange={(e) => setNotifyPhone(e.target.value)}
                    placeholder={isAr ? "رقم الهاتف / واتساب (اختياري)" : "Phone / WhatsApp (optional)"}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-[#4e6648] focus:ring-1 focus:ring-[#4e6648] bg-neutral-50/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={notifyLoading || (!notifyEmail && !notifyPhone)}
                  className="w-full mt-3.5 py-2.5 bg-[#4e6648] hover:bg-[#3d5239] disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <Bell size={14} />
                  <span>{notifyLoading ? (isAr ? "جاري الإرسال..." : "Sending...") : notifyMeText}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
