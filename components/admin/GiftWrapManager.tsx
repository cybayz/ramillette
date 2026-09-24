"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Gift,
  Plus,
  Edit2,
  Trash2,
  Check,
  Sparkles,
  Image as ImageIcon,
  Copy,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Globe,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  ExternalLink,
  Layers,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { GiftWrapOption, COUNTRIES, CountryCode } from "@/lib/country/config";

export interface GiftWrapCountry {
  code: string;
  name: string;
  nameAr?: string;
  flag: string;
  currency: string;
  currencySymbol?: string;
  allowGiftWrap: boolean;
  giftWrapFee?: number;
  giftWrapOptions: GiftWrapOption[];
}

interface GiftWrapManagerProps {
  initialCountries: GiftWrapCountry[];
}

const PRESET_IMAGES = [
  {
    label: "Paper Gift Wrap",
    path: "/gift-wrap/paper-wrap.jpg",
    desc: "Textured paper with satin ribbon & wax seal",
  },
  {
    label: "Bespoke Keepsake Box",
    path: "/gift-wrap/custom-box.jpg",
    desc: "Rigid magnetic presentation box with silk velvet",
  },
  {
    label: "VIP Box + Flowers & Chocolates",
    path: "/gift-wrap/flowers-chocolate-box.jpg",
    desc: "Royal box with preserved roses & Swiss chocolates",
  },
];

export function GiftWrapManager({ initialCountries }: GiftWrapManagerProps) {
  const [countries, setCountries] = useState<GiftWrapCountry[]>(initialCountries);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    initialCountries[0]?.code || "QA"
  );

  // Active country being managed
  const activeCountry =
    countries.find((c) => c.code === selectedCountryCode) || countries[0];

  // Modal state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);

  // Form state
  const [optId, setOptId] = useState("");
  const [optName, setOptName] = useState("");
  const [optNameAr, setOptNameAr] = useState("");
  const [optPrice, setOptPrice] = useState<number>(0);
  const [optDescription, setOptDescription] = useState("");
  const [optDescriptionAr, setOptDescriptionAr] = useState("");
  const [optImage, setOptImage] = useState("");
  const [optBadge, setOptBadge] = useState("");
  const [optBadgeAr, setOptBadgeAr] = useState("");
  const [optActive, setOptActive] = useState(true);
  const [applyToAllCountries, setApplyToAllCountries] = useState(false);

  // Saving states & feedback
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Delete confirmation modal state
  const [deleteCandidate, setDeleteCandidate] = useState<{
    index: number;
    option: GiftWrapOption;
  } | null>(null);

  // Helper to persist updated country to server
  const saveCountryOptions = async (
    countryCode: string,
    updatedOptions: GiftWrapOption[],
    allowGiftWrapStatus?: boolean
  ) => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const payload: any = {
        giftWrapOptions: updatedOptions,
      };
      if (allowGiftWrapStatus !== undefined) {
        payload.allowGiftWrap = allowGiftWrapStatus;
      }

      const res = await fetch(`/api/admin/countries/${countryCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update country packaging options");
      }

      // Update local state
      setCountries((prev) =>
        prev.map((c) =>
          c.code === countryCode
            ? {
                ...c,
                giftWrapOptions: updatedOptions,
                ...(allowGiftWrapStatus !== undefined
                  ? { allowGiftWrap: allowGiftWrapStatus }
                  : {}),
              }
            : c
        )
      );

      setStatusMessage({
        type: "success",
        text: `Packaging options saved successfully for ${countryCode}!`,
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "An error occurred while saving.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active status of an option directly
  const handleToggleOptionActive = async (index: number) => {
    const updated = activeCountry.giftWrapOptions.map((opt, i) =>
      i === index ? { ...opt, active: opt.active === false ? true : false } : opt
    );
    await saveCountryOptions(activeCountry.code, updated);
  };

  // Toggle master region gift wrap
  const handleToggleAllowGiftWrap = async () => {
    const newStatus = !activeCountry.allowGiftWrap;
    await saveCountryOptions(
      activeCountry.code,
      activeCountry.giftWrapOptions,
      newStatus
    );
  };

  // Reorder options
  const handleMoveOption = async (index: number, direction: "up" | "down") => {
    const list = [...activeCountry.giftWrapOptions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    await saveCountryOptions(activeCountry.code, list);
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingOptionIndex(null);
    setOptId("");
    setOptName("");
    setOptNameAr("");
    setOptPrice(10);
    setOptDescription("");
    setOptDescriptionAr("");
    setOptImage("/gift-wrap/paper-wrap.jpg");
    setOptBadge("");
    setOptBadgeAr("");
    setOptActive(true);
    setApplyToAllCountries(false);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (index: number) => {
    const opt = activeCountry.giftWrapOptions[index];
    setEditingOptionIndex(index);
    setOptId(opt.id);
    setOptName(opt.name);
    setOptNameAr(opt.nameAr || "");
    setOptPrice(opt.price);
    setOptDescription(opt.description);
    setOptDescriptionAr(opt.descriptionAr || "");
    setOptImage(opt.image || "");
    setOptBadge(opt.badge || "");
    setOptBadgeAr(opt.badgeAr || "");
    setOptActive(opt.active !== false);
    setApplyToAllCountries(false);
    setIsModalOpen(true);
  };

  // Duplicate an option
  const handleDuplicateOption = (index: number) => {
    const original = activeCountry.giftWrapOptions[index];
    const copyId = `${original.id}-copy-${Date.now().toString().slice(-4)}`;
    const duplicate: GiftWrapOption = {
      ...original,
      id: copyId,
      name: `${original.name} (Copy)`,
      nameAr: original.nameAr ? `${original.nameAr} (نسخة)` : undefined,
    };

    const updated = [...activeCountry.giftWrapOptions, duplicate];
    saveCountryOptions(activeCountry.code, updated);
  };

  // Save Modal Form
  const handleSubmitOptionForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!optName.trim()) {
      alert("Please provide a name for the gift packaging option.");
      return;
    }

    const finalId =
      optId.trim() ||
      optName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const newOption: GiftWrapOption = {
      id: finalId,
      name: optName.trim(),
      nameAr: optNameAr.trim() || undefined,
      price: Number(optPrice) || 0,
      description: optDescription.trim(),
      descriptionAr: optDescriptionAr.trim() || undefined,
      image: optImage.trim() || undefined,
      badge: optBadge.trim() || undefined,
      badgeAr: optBadgeAr.trim() || undefined,
      active: optActive,
    };

    let updatedOptions = [...activeCountry.giftWrapOptions];
    if (editingOptionIndex !== null) {
      updatedOptions[editingOptionIndex] = newOption;
    } else {
      updatedOptions.push(newOption);
    }

    setIsModalOpen(false);

    if (applyToAllCountries) {
      setIsSaving(true);
      try {
        for (const c of countries) {
          let cOptions = [...c.giftWrapOptions];
          const existingIdx = cOptions.findIndex((o) => o.id === finalId);
          if (existingIdx >= 0) {
            cOptions[existingIdx] = newOption;
          } else {
            cOptions.push(newOption);
          }
          await fetch(`/api/admin/countries/${c.code}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ giftWrapOptions: cOptions }),
          });
        }

        // Refresh state for all countries
        setCountries((prev) =>
          prev.map((c) => {
            const cOptions = [...c.giftWrapOptions];
            const existingIdx = cOptions.findIndex((o) => o.id === finalId);
            if (existingIdx >= 0) {
              cOptions[existingIdx] = newOption;
            } else {
              cOptions.push(newOption);
            }
            return { ...c, giftWrapOptions: cOptions };
          })
        );

        setStatusMessage({
          type: "success",
          text: `Packaging option synchronized across all ${countries.length} countries!`,
        });
        setTimeout(() => setStatusMessage(null), 4000);
      } catch (err: any) {
        setStatusMessage({
          type: "error",
          text: err.message || "Failed to sync across countries.",
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      await saveCountryOptions(activeCountry.code, updatedOptions);
    }
  };

  // Delete option confirm
  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    const updated = activeCountry.giftWrapOptions.filter(
      (_, i) => i !== deleteCandidate.index
    );
    setDeleteCandidate(null);
    await saveCountryOptions(activeCountry.code, updated);
  };

  // Reset to default reference packages
  const handleResetToDefaults = async () => {
    const defaults =
      COUNTRIES[activeCountry.code as CountryCode]?.giftWrapOptions ||
      COUNTRIES["QA"].giftWrapOptions ||
      [];
    if (
      confirm(
        `Reset packaging options for ${activeCountry.name} to the 4 default luxury packages? Any custom additions will be replaced.`
      )
    ) {
      await saveCountryOptions(activeCountry.code, defaults);
    }
  };

  // Clone current country menu to all other countries
  const handleSyncMenuToAllCountries = async () => {
    if (
      !confirm(
        `Are you sure you want to copy all ${activeCountry.giftWrapOptions.length} packaging options from ${activeCountry.name} to ALL other regions (${countries.map((c) => c.code).join(", ")})?`
      )
    ) {
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      for (const c of countries) {
        await fetch(`/api/admin/countries/${c.code}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftWrapOptions: activeCountry.giftWrapOptions }),
        });
      }

      setCountries((prev) =>
        prev.map((c) => ({
          ...c,
          giftWrapOptions: [...activeCountry.giftWrapOptions],
        }))
      );

      setStatusMessage({
        type: "success",
        text: `Successfully synced packaging menu to all regions!`,
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to sync options to all countries.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e5e5]">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <Link href="/admin" className="hover:text-black">
              Admin
            </Link>
            <span>/</span>
            <Link href="/admin/countries" className="hover:text-black">
              Countries & Markets
            </Link>
            <span>/</span>
            <span className="text-[#1c1c1c] font-medium">Gift Wrap & Packaging</span>
          </div>
          <h1 className="text-xl font-bold text-[#1c1c1c] flex items-center gap-2">
            <Gift size={22} className="text-[#b6713e]" />
            <span>Gift Wrap & Packaging Management</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure luxury presentation boxes, artisanal wraps, sample photographs, and tier pricing for each regional boutique.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/checkout"
            target="_blank"
            className="px-3 py-2 rounded-[5px] border border-[#e5e5e5] bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink size={13} />
            <span>Preview in Checkout</span>
          </Link>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-[5px] bg-[#1c1c1c] text-white text-xs font-bold hover:bg-[#b6713e] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus size={15} />
            <span>Add Presentation Option</span>
          </button>
        </div>
      </div>

      {/* Status Alert Toast */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-[8px] border text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-neutral-400 hover:text-neutral-700 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Country Market Switcher Tabs */}
      <div className="bg-white rounded-[10px] border border-[#e5e5e5] p-3 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2">
              Select Market:
            </span>
            {countries.map((c) => {
              const isSelected = c.code === selectedCountryCode;
              const activeCount = c.giftWrapOptions.filter(
                (o) => o.active !== false
              ).length;

              return (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountryCode(c.code)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-[6px] text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-[#1c1c1c] text-white shadow-xs"
                      : "bg-[#fbf9f5] text-neutral-600 hover:bg-neutral-100 border border-[#e5e5e5]"
                  }`}
                >
                  <span className="text-sm">{c.flag}</span>
                  <span>{c.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? "bg-[#b6713e] text-white"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {activeCount}/{c.giftWrapOptions.length}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncMenuToAllCountries}
              disabled={isSaving}
              className="px-2.5 py-1.5 rounded-[5px] text-[11px] font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 flex items-center gap-1 transition-colors cursor-pointer"
              title="Copy this country's menu to Qatar, UAE, and Bahrain"
            >
              <Copy size={12} />
              <span>Copy Menu to All Regions</span>
            </button>
            <button
              onClick={handleResetToDefaults}
              disabled={isSaving}
              className="px-2.5 py-1.5 rounded-[5px] text-[11px] font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 flex items-center gap-1 transition-colors cursor-pointer"
              title="Restore standard 4 luxury packages"
            >
              <RefreshCw size={12} className={isSaving ? "animate-spin" : ""} />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Regional Status Bar */}
      <div className="bg-white rounded-[10px] border border-[#e5e5e5] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 rounded-[8px] bg-[#faedcd]/40 border border-[#ecdac1] flex items-center justify-center text-xl shrink-0">
            {activeCountry.flag}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#1c1c1c]">
                {activeCountry.name} Packaging Catalogue
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 uppercase">
                Currency: {activeCountry.currency}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {activeCountry.allowGiftWrap
                ? `Gift wrapping is currently ACTIVE in ${activeCountry.name} checkout.`
                : `Gift wrapping is currently DISABLED in ${activeCountry.name}.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-[#fbf9f5] px-3.5 py-2 rounded-[6px] border border-[#e5e5e5] hover:border-neutral-300">
            <input
              type="checkbox"
              checked={activeCountry.allowGiftWrap}
              onChange={handleToggleAllowGiftWrap}
              className="w-4 h-4 text-[#b6713e] rounded border-neutral-300 focus:ring-[#b6713e]"
            />
            <span className="text-xs font-bold text-[#1c1c1c]">
              {activeCountry.allowGiftWrap ? "Service Enabled" : "Service Disabled"}
            </span>
          </label>

          <button
            onClick={handleOpenCreateModal}
            className="px-3.5 py-2 rounded-[6px] bg-[#b6713e] hover:bg-[#9a5d30] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>New Option</span>
          </button>
        </div>
      </div>

      {/* Options Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Available Presentation Packages ({activeCountry.giftWrapOptions.length})
          </h3>
          <span className="text-xs text-neutral-400">
            Drag or use arrows to change display order
          </span>
        </div>

        {activeCountry.giftWrapOptions.length === 0 ? (
          <div className="bg-white rounded-[10px] border border-dashed border-neutral-300 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
              <Gift size={24} />
            </div>
            <h4 className="text-sm font-bold text-neutral-800">
              No Packaging Options Configured
            </h4>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Click &ldquo;Add Presentation Option&rdquo; or &ldquo;Reset Defaults&rdquo; to populate initial packages for {activeCountry.name}.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={handleResetToDefaults}
                className="btn-secondary text-xs px-4 py-2"
              >
                Restore 4 Defaults
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="btn-primary text-xs px-4 py-2"
              >
                Add Custom Option
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCountry.giftWrapOptions.map((opt, idx) => {
              const isFree = Number(opt.price) === 0;
              const isActive = opt.active !== false;

              return (
                <div
                  key={opt.id || idx}
                  className={`bg-white rounded-[10px] border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-sm ${
                    isActive
                      ? "border-[#e5e5e5]"
                      : "border-neutral-200 opacity-60 bg-neutral-50"
                  }`}
                >
                  {/* Top Image Preview or Graphic */}
                  <div className="relative w-full aspect-[16/10] sm:aspect-auto sm:h-44 bg-neutral-100 overflow-hidden border-b border-[#f0ece1] rounded-t-[9px] isolate">
                    {opt.image ? (
                      <Image
                        src={opt.image}
                        alt={opt.name}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[140px] bg-gradient-to-br from-[#fcf9f5] via-[#faedcd]/40 to-[#f6ecdd] flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-[#ecdac1] flex items-center justify-center text-[#b6713e] mb-2">
                          <Gift size={24} />
                        </div>
                        <span className="text-xs font-bold text-[#8c5828]">
                          Complimentary Card
                        </span>
                        <span className="text-[10px] text-neutral-400 mt-0.5">
                          (No box photo needed)
                        </span>
                      </div>
                    )}

                    {/* Badge Pill */}
                    {opt.badge && (
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#1c1c1c]/85 text-[#d4af37] border border-[#d4af37]/40 shadow-xs backdrop-blur-xs">
                        {opt.badge}
                      </span>
                    )}

                    {/* Active/Inactive Status Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 ${
                          isActive
                            ? "bg-emerald-600 text-white"
                            : "bg-neutral-600 text-white"
                        }`}
                      >
                        {isActive ? <Eye size={10} /> : <EyeOff size={10} />}
                        <span>{isActive ? "Active" : "Hidden"}</span>
                      </span>
                    </div>

                    {/* Price Tag Overlay */}
                    <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-[6px] border border-[#e5e5e5] shadow-xs">
                      {isFree ? (
                        <span className="text-xs font-extrabold text-[#0d9d00]">
                          FREE
                        </span>
                      ) : (
                        <span className="text-xs font-extrabold text-[#b6713e] font-mono">
                          +{formatPrice(opt.price, activeCountry.code)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-[#1c1c1c] leading-tight">
                            {opt.name}
                          </h4>
                          {opt.nameAr && (
                            <h5 className="font-medium text-xs text-neutral-500 mt-0.5 font-arabic">
                              {opt.nameAr}
                            </h5>
                          )}
                        </div>
                        <span className="text-[10px] font-mono bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded shrink-0">
                          #{opt.id}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600 mt-2 leading-relaxed line-clamp-2">
                        {opt.description}
                      </p>
                      {opt.descriptionAr && (
                        <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2 font-arabic" dir="rtl">
                          {opt.descriptionAr}
                        </p>
                      )}
                    </div>

                    {/* Controls Footer */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                      {/* Order Arrows */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveOption(idx, "up")}
                          disabled={idx === 0}
                          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          onClick={() => handleMoveOption(idx, "down")}
                          disabled={idx === activeCountry.giftWrapOptions.length - 1}
                          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move down"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleOptionActive(idx)}
                          className={`p-1.5 rounded text-xs transition-colors ${
                            isActive
                              ? "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={isActive ? "Hide from checkout" : "Make visible in checkout"}
                        >
                          {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => handleDuplicateOption(idx)}
                          className="p-1.5 rounded text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                          title="Duplicate option"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(idx)}
                          className="p-1.5 rounded text-[#b6713e] hover:bg-[#faedcd]/40"
                          title="Edit full option details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate({ index: idx, option: opt })}
                          className="p-1.5 rounded text-red-500 hover:bg-red-50"
                          title="Delete option"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Option Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-[12px] border border-[#e5e5e5] w-full max-w-2xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-[#fbf9f5] border-b border-[#f0ece1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift size={18} className="text-[#b6713e]" />
                <h3 className="font-bold text-sm text-[#1c1c1c]">
                  {editingOptionIndex !== null
                    ? `Edit Packaging Option: ${optName || "Option"}`
                    : `Add New Packaging Option for ${activeCountry.name}`}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitOptionForm} className="overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID / Slug */}
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Option ID / Slug *
                  </label>
                  <input
                    type="text"
                    value={optId}
                    onChange={(e) => setOptId(e.target.value)}
                    placeholder="e.g. custom-box, velvet-chest"
                    className="w-full p-2.5 border border-neutral-300 rounded-[5px] focus:outline-none focus:border-[#b6713e] font-mono"
                    required
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    Unique identifier stored on customer orders.
                  </span>
                </div>

                {/* Price */}
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Price ({activeCountry.currency}) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-neutral-400 font-semibold font-mono">
                      {activeCountry.currency}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={optPrice}
                      onChange={(e) => setOptPrice(parseFloat(e.target.value) || 0)}
                      placeholder="0 for Free"
                      className="w-full pl-14 pr-3 py-2.5 border border-neutral-300 rounded-[5px] focus:outline-none focus:border-[#b6713e] font-bold font-mono"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    Set 0 for complimentary message cards.
                  </span>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Package Name (English) *
                  </label>
                  <input
                    type="text"
                    value={optName}
                    onChange={(e) => setOptName(e.target.value)}
                    placeholder="e.g. Royal Velvet Keepsake Box"
                    className="w-full p-2.5 border border-neutral-300 rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Package Name (Arabic)
                  </label>
                  <input
                    type="text"
                    value={optNameAr}
                    onChange={(e) => setOptNameAr(e.target.value)}
                    placeholder="e.g. صندوق مخملي ملكي فاخر"
                    dir="rtl"
                    className="w-full p-2.5 border border-neutral-300 rounded-[5px] focus:outline-none focus:border-[#b6713e] font-arabic"
                  />
                </div>
              </div>

              {/* Sample Photo & Quick Presets */}
              <div className="space-y-2 p-3.5 bg-[#fbf9f5] rounded-[8px] border border-[#f0ece1]">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-neutral-700">
                    Sample Photo URL / Path
                  </label>
                  <span className="text-[10px] text-neutral-500">
                    Square or 4:3 high-res photo recommended
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={optImage}
                    onChange={(e) => setOptImage(e.target.value)}
                    placeholder="e.g. /gift-wrap/custom-box.jpg or https://..."
                    className="flex-1 p-2.5 border border-neutral-300 rounded-[5px] focus:outline-none focus:border-[#b6713e] font-mono text-[11px]"
                  />
                  {optImage && (
                    <button
                      type="button"
                      onClick={() => setOptImage("")}
                      className="px-2 py-2 text-neutral-400 hover:text-red-500 border border-neutral-200 rounded bg-white text-[11px]"
                      title="Clear image (card text only)"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Preset Chips */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                    Or select from high-res luxury photoshoot library:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.path}
                        type="button"
                        onClick={() => setOptImage(preset.path)}
                        className={`p-2 rounded border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          optImage === preset.path
                            ? "border-[#b6713e] bg-[#faedcd]/30 ring-1 ring-[#b6713e]"
                            : "border-neutral-200 bg-white hover:border-neutral-300"
                        }`}
                      >
                        <div className="relative w-8 h-8 rounded overflow-hidden shrink-0 bg-neutral-100">
                          <Image
                            src={preset.path}
                            alt={preset.label}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[11px] truncate text-[#1c1c1c]">
                            {preset.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Image Preview */}
                {optImage && (
                  <div className="pt-2 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded border border-neutral-200 overflow-hidden bg-neutral-50 shrink-0">
                      <Image
                        src={optImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      <span className="font-bold text-neutral-700 block">
                        Live Preview Ready
                      </span>
                      This photograph will be displayed to customers selecting this option at checkout.
                    </div>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Badge Label (English)
                  </label>
                  <input
                    type="text"
                    value={optBadge}
                    onChange={(e) => setOptBadge(e.target.value)}
                    placeholder="e.g. Free, Most Popular, Ultimate Luxury"
                    className="w-full p-2.5 border border-neutral-300 rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Badge Label (Arabic)
                  </label>
                  <input
                    type="text"
                    value={optBadgeAr}
                    onChange={(e) => setOptBadgeAr(e.target.value)}
                    placeholder="e.g. الأكثر طلباً، مجاناً، إصدار خاص"
                    dir="rtl"
                    className="w-full p-2.5 border border-neutral-300 rounded-[5px] focus:outline-none focus:border-[#b6713e] font-arabic"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Description (English) *
                  </label>
                  <textarea
                    rows={2}
                    value={optDescription}
                    onChange={(e) => setOptDescription(e.target.value)}
                    placeholder="Describe the packaging materials, box type, ribbons, wax seals, etc."
                    className="w-full p-2.5 border border-neutral-300 rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Description (Arabic)
                  </label>
                  <textarea
                    rows={2}
                    value={optDescriptionAr}
                    onChange={(e) => setOptDescriptionAr(e.target.value)}
                    placeholder="وصف تفصيلي لنوع الصندوق، الشرائط الحريرية، والختم الشمعي..."
                    dir="rtl"
                    className="w-full p-2.5 border border-neutral-300 rounded-[5px] focus:outline-none focus:border-[#b6713e] font-arabic"
                  />
                </div>
              </div>

              {/* Status & Multi-country Sync */}
              <div className="pt-2 border-t border-neutral-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optActive}
                    onChange={(e) => setOptActive(e.target.checked)}
                    className="w-4 h-4 text-[#b6713e] rounded border-neutral-300 focus:ring-[#b6713e]"
                  />
                  <span className="font-bold text-neutral-700">
                    Active in Checkout (customers can select this presentation style)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyToAllCountries}
                    onChange={(e) => setApplyToAllCountries(e.target.checked)}
                    className="w-4 h-4 text-[#b6713e] rounded border-neutral-300 focus:ring-[#b6713e]"
                  />
                  <span className="text-neutral-600">
                    Synchronize this package to <strong>ALL other regions</strong> ({countries.map((c) => c.code).join(", ")})
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-[5px] text-neutral-700 font-semibold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#b6713e] hover:bg-[#9a5d30] text-white font-bold rounded-[5px] flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {isSaving && <RefreshCw size={13} className="animate-spin" />}
                  <span>{editingOptionIndex !== null ? "Update Option" : "Save Presentation Option"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[12px] border border-[#e5e5e5] w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1c1c1c]">
                  Remove Packaging Option?
                </h4>
                <p className="text-xs text-neutral-500">
                  {deleteCandidate.option.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to remove &ldquo;{deleteCandidate.option.name}&rdquo; from {activeCountry.name}? Past orders containing this option will still keep their history.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-3.5 py-2 border border-neutral-300 rounded-[5px] text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-[5px] transition-colors"
              >
                Delete Option
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
