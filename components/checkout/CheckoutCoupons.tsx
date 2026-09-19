"use client";

import React, { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useCountryStore } from "@/lib/store/useCountryStore";
import { formatPrice } from "@/lib/utils";
import {
  Tag,
  Check,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  Gift,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PublicOffer {
  code: string;
  type: string;
  value: number;
  minimumOrder: number | null;
  maximumDiscount: number | null;
  description: string;
  expiresAt: string | null;
}

export function CheckoutCoupons() {
  const { coupon, applyCoupon, removeCoupon, getSubtotal } = useCartStore();
  const { country } = useCountryStore();

  const [manualCode, setManualCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [publicOffers, setPublicOffers] = useState<PublicOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [isOffersOpen, setIsOffersOpen] = useState(true);

  const subtotal = getSubtotal();

  // Load public coupons
  useEffect(() => {
    let isMounted = true;
    fetch("/api/coupons/public")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.coupons)) {
          setPublicOffers(data.coupons);
        }
      })
      .catch((err) => console.error("Failed to load offers:", err))
      .finally(() => {
        if (isMounted) setLoadingOffers(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Apply Coupon Handler
  const handleApplyCode = async (codeToApply: string) => {
    if (!codeToApply || !codeToApply.trim()) return;

    setIsValidating(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToApply.trim(),
          subtotal,
          countryCode: country,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to apply promo code.");
      }

      applyCoupon({
        code: data.code,
        type: data.type,
        value: data.value,
        discountAmount: data.discountAmount,
      });

      setSuccessMsg(data.message || `Promo code ${data.code} applied!`);
      setManualCode("");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or ineligible promo code.");
      setTimeout(() => setErrorMsg(""), 6000);
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyCode(manualCode);
  };

  return (
    <div className="bg-[#fbf9f5] rounded-lg border border-[#e5e5e5] p-3.5 space-y-3 text-xs">
      {/* Active Applied Coupon Banner */}
      {coupon ? (
        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Check size={13} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-900 font-mono tracking-wide">
                  {coupon.code}
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                  Applied
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 mt-0.5">
                {coupon.type === "PERCENTAGE"
                  ? `${coupon.value}% discount applied to eligible items`
                  : `${formatPrice(coupon.value, country)} discount applied`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={removeCoupon}
            className="text-neutral-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
            title="Remove coupon"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        /* Manual Code Entry Form */
        <div>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter promo code (e.g. VIPSECRET)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                className="w-full text-xs uppercase pl-3 pr-8 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e] bg-white font-mono"
              />
              <Tag
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
            </div>

            <button
              type="submit"
              disabled={isValidating || !manualCode.trim()}
              className="btn-primary h-8 px-3.5 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isValidating ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <span>Apply</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
          <Check size={13} className="shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification / Unmet Condition */}
      {errorMsg && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-800 text-[11px] leading-snug flex items-start gap-1.5">
          <AlertCircle size={14} className="shrink-0 text-red-600 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Available Public Offers List */}
      {publicOffers.length > 0 && (
        <div className="pt-2 border-t border-[#f0ece1]">
          <button
            type="button"
            onClick={() => setIsOffersOpen(!isOffersOpen)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-[#1c1c1c] hover:text-[#b6713e] transition-colors py-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Gift size={13} className="text-[#b6713e]" />
              <span>Available Offers & Promotions ({publicOffers.length})</span>
            </div>
            {isOffersOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {isOffersOpen && (
            <div className="mt-2 space-y-2">
              {publicOffers.map((offer) => {
                const isApplied = coupon?.code === offer.code;
                const minOrder = offer.minimumOrder || 0;
                const meetsCondition = subtotal >= minOrder;
                const amountNeeded = Math.max(0, minOrder - subtotal);

                return (
                  <div
                    key={offer.code}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isApplied
                        ? "border-emerald-300 bg-emerald-50/50"
                        : meetsCondition
                        ? "border-[#ecdec1] bg-white hover:border-[#b6713e]"
                        : "border-neutral-200 bg-neutral-50/80 opacity-80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-xs text-[#1c1c1c] tracking-wide">
                            {offer.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                              offer.type === "PERCENTAGE"
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            }`}
                          >
                            {offer.type === "PERCENTAGE"
                              ? `${offer.value}% OFF`
                              : `${formatPrice(offer.value, country)} OFF`}
                          </span>
                        </div>

                        {offer.description && (
                          <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-2">
                            {offer.description}
                          </p>
                        )}
                      </div>

                      {/* Action Button / Status Badge */}
                      <div className="shrink-0">
                        {isApplied ? (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded">
                            <Check size={11} />
                            <span>Applied</span>
                          </span>
                        ) : meetsCondition ? (
                          <button
                            type="button"
                            onClick={() => handleApplyCode(offer.code)}
                            disabled={isValidating}
                            className="btn-secondary h-7 px-2.5 text-[11px] font-bold text-[#b6713e] bg-[#faedcd]/40 border border-[#ecdec1] hover:bg-[#faedcd] transition-colors cursor-pointer"
                          >
                            Apply
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setErrorMsg(
                                `To unlock ${offer.code}, your order must reach ${formatPrice(
                                  minOrder,
                                  country
                                )}. Add ${formatPrice(
                                  amountNeeded,
                                  country
                                )} more to eligible items!`
                              )
                            }
                            className="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-200/60 px-2 py-0.5 rounded cursor-pointer hover:bg-neutral-200"
                            title="Click to see requirements"
                          >
                            <Lock size={10} />
                            <span>Locked</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Condition Progress Bar / Notice */}
                    {!meetsCondition && minOrder > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-neutral-200/60 flex items-center justify-between text-[10px]">
                        <span className="text-amber-800 font-medium">
                          Add {formatPrice(amountNeeded, country)} more to unlock
                        </span>
                        <span className="text-neutral-400">
                          Min. {formatPrice(minOrder, country)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
