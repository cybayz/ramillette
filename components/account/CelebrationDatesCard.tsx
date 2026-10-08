"use client";

import React, { useState } from "react";
import { Gift, Calendar, Heart, Sparkles, Check, Loader2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CelebrationDatesCardProps {
  initialBirthday?: string | null;
  initialAnniversary?: string | null;
  isAr?: boolean;
}

export function CelebrationDatesCard({
  initialBirthday,
  initialAnniversary,
  isAr = false,
}: CelebrationDatesCardProps) {
  const [birthday, setBirthday] = useState(initialBirthday || "");
  const [anniversary, setAnniversary] = useState(initialAnniversary || "");
  const [isEditing, setIsEditing] = useState(!initialBirthday || !initialAnniversary);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return null;
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString(isAr ? "ar-QA" : "en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/account/celebration-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthday: birthday || null,
          anniversary: anniversary || null,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update celebration dates:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="celebration-dates-card"
      className="bg-white border border-[#e5e5e5] rounded-[8px] p-5 shadow-2xs space-y-4 scroll-mt-24"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-2">
          <Gift size={16} className="text-[#b6713e]" />
          <h3 className="text-sm font-bold text-[#1c1c1c]">
            {isAr ? "المناسبات والاحتفالات الخاصة" : "Celebration & Milestone Dates"}
          </h3>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs font-semibold text-[#b6713e] hover:text-[#8f4f22] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Edit2 size={12} />
            <span>{isAr ? "تعديل" : "Edit"}</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-neutral-500 leading-relaxed">
        {isAr
          ? "أضف مناسباتك السعيدة لتحصل على قسائم شراء وهدايا فاخرة من راميليت عند اقتراب موعدها."
          : "Add your special occasions to unlock exclusive celebratory discount codes and luxury surprise gifts on your special days."}
      </p>

      {saveSuccess && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-[6px] font-medium flex items-center gap-2">
          <Check size={14} className="text-emerald-600" />
          <span>{isAr ? "تم تحديث التواريخ بنجاح!" : "Celebration dates updated successfully!"}</span>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="text-[#b6713e]" />
                <span>{isAr ? "تاريخ الميلاد" : "Birthday"}</span>
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
              className="w-full text-xs p-2.5 bg-white border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e] text-neutral-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Heart size={12} className="text-[#b6713e]" />
                <span>{isAr ? "ذكرى الزواج" : "Anniversary"}</span>
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
              className="w-full text-xs p-2.5 bg-white border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e] text-neutral-800"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            {(initialBirthday || initialAnniversary) && (
              <button
                type="button"
                onClick={() => {
                  setBirthday(initialBirthday || "");
                  setAnniversary(initialAnniversary || "");
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              className="px-4 py-1.5 text-xs font-bold cursor-pointer"
            >
              {isAr ? "حفظ التواريخ" : "Save Dates"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-2.5 pt-1 text-xs">
          <div className="p-3 rounded-[6px] bg-[#fbf9f5] border border-[#ecdac1]/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#b6713e]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  {isAr ? "تاريخ الميلاد" : "Birthday"}
                </span>
                <span className="text-xs font-bold text-[#1c1c1c]">
                  {formatDisplayDate(birthday) || (isAr ? "لم تتم الإضافة بعد" : "Not provided yet")}
                </span>
              </div>
            </div>
            {birthday && (
              <span className="text-[10px] font-bold text-[#b6713e] bg-[#faedcd] px-2 py-0.5 rounded">
                {isAr ? "عرض خاص سنوي" : "Annual Perk Active"}
              </span>
            )}
          </div>

          <div className="p-3 rounded-[6px] bg-[#fbf9f5] border border-[#ecdac1]/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-[#b6713e]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  {isAr ? "ذكرى الزواج" : "Anniversary"}
                </span>
                <span className="text-xs font-bold text-[#1c1c1c]">
                  {formatDisplayDate(anniversary) || (isAr ? "لم تتم الإضافة بعد" : "Not provided yet")}
                </span>
              </div>
            </div>
            {anniversary && (
              <span className="text-[10px] font-bold text-[#b6713e] bg-[#faedcd] px-2 py-0.5 rounded">
                {isAr ? "عرض خاص سنوي" : "Annual Perk Active"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
