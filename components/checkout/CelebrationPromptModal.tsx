"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Gift, Heart, Calendar, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CelebrationPromptModalProps {
  initialBirthday?: string | null;
  initialAnniversary?: string | null;
  orderNumber?: string;
  isAr?: boolean;
}

export function CelebrationPromptModal({
  initialBirthday,
  initialAnniversary,
  orderNumber,
  isAr = false,
}: CelebrationPromptModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [birthday, setBirthday] = useState(initialBirthday || "");
  const [anniversary, setAnniversary] = useState(initialAnniversary || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // If user already has BOTH fields filled, do NOT show the modal
    if (initialBirthday && initialAnniversary) {
      return;
    }

    // Check if dismissed in this browsing session
    const dismissed = sessionStorage.getItem("ramillette_celebration_modal_dismissed");
    if (dismissed) {
      return;
    }

    // Show after a brief delay so the order confirmation page renders smoothly first
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [initialBirthday, initialAnniversary]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem("ramillette_celebration_modal_dismissed", "true");
    } catch (_) { }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/account/celebration-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthday: birthday || null,
          anniversary: anniversary || null,
          orderNumber,
        }),
      });

      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => {
          setIsOpen(false);
          try {
            sessionStorage.setItem("ramillette_celebration_modal_dismissed", "true");
          } catch (_) { }
        }, 1500);
      } else {
        handleDismiss();
      }
    } catch (err) {
      console.error("Failed to save celebration dates:", err);
      handleDismiss();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
      <div
        className="bg-white rounded-[12px] border border-[#ecdec1] p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-left rtl:text-right overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Subtle decorative top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#faedcd] via-[#b6713e] to-[#faedcd]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {isSaved ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <Check size={28} />
            </div>
            <h3 className="text-base font-bold text-[#1c1c1c]">
              {isAr ? "تم حفظ التواريخ بنجاح!" : "Celebration Dates Saved!"}
            </h3>
            <p className="text-xs text-neutral-500">
              {isAr
                ? "شكراً لك! ترقّب عروضنا وهدايانا الاستثنائية في مناسباتك السعيدة القادمة."
                : "Thank you! Look forward to exclusive celebratory privileges and luxury gifts on your big days."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {/* Header Icon & Title */}
            <div className="flex items-start gap-3.5 pr-6 rtl:pr-0 rtl:pl-6">
              <div className="w-11 h-11 rounded-full bg-[#faedcd] border border-[#ecdec1] flex items-center justify-center text-[#b6713e] shrink-0 shadow-xs">
                <Gift size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b6713e] flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-500 fill-amber-400" />
                  <span>{isAr ? "عروض حصرية للمناسبات" : "Special Milestone Privilege"}</span>
                </span>
                <h3 className="text-base font-bold text-[#1c1c1c] mt-0.5 leading-snug">
                  {isAr
                    ? "أكمل ملفك الشخصي لتحصل على عروض في عيد ميلادك وذكرى زواجك"
                    : "Complete Your Profile for Birthday & Anniversary Offers"}
                </h3>
              </div>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              {isAr
                ? "أضف تاريخ ميلادك أو ذكرى زواجك لنتمكن من مشاركتك الفرحة وتقديم خصومات حصرية وهدايا عطور مميزة."
                : "Share your special dates to receive exclusive luxury perfume discounts, bespoke offers, and surprise gifts when your milestone arrives."}
            </p>

            {/* Inputs */}
            <div className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#b6713e]" />
                    <span>{isAr ? "تاريخ الميلاد (اختياري)" : "Birthday (Optional)"}</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {isAr ? "اختياري" : "Optional"}
                  </span>
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full text-xs p-2.5 bg-white border border-[#e5e5e5] rounded-[6px] focus:outline-none focus:border-[#b6713e] text-neutral-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Heart size={13} className="text-[#b6713e]" />
                    <span>{isAr ? "تاريخ ذكرى الزواج (اختياري)" : "Anniversary (Optional)"}</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {isAr ? "اختياري" : "Optional"}
                  </span>
                </label>
                <input
                  type="date"
                  value={anniversary}
                  onChange={(e) => setAnniversary(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full text-xs p-2.5 bg-white border border-[#e5e5e5] rounded-[6px] focus:outline-none focus:border-[#b6713e] text-neutral-700 font-medium"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3.5 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
              >
                {isAr ? "تخطي الآن" : "Skip for now"}
              </button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                className="px-5 py-2 text-xs font-bold shadow-xs cursor-pointer"
              >
                {isAr ? "حفظ التواريخ" : "Save Celebration Dates"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
