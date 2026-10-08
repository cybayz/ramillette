"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Mail, CheckCircle2, Loader2, MessageSquare, AlertCircle } from "lucide-react";

interface SuggestProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductName?: string;
  searchQuery?: string;
}

export function SuggestProductModal({
  isOpen,
  onClose,
  initialProductName = "",
  searchQuery = "",
}: SuggestProductModalProps) {
  const [productName, setProductName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setProductName(initialProductName || searchQuery || "");
      setIsSuccess(false);
      setErrorMessage("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialProductName, searchQuery]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!productName.trim()) {
      setErrorMessage("Please enter the perfume or brand name you'd like to suggest.");
      return;
    }

    if (!userEmail.trim() || !userEmail.includes("@")) {
      setErrorMessage("Please provide a valid email address so we can notify you.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName.trim(),
          userEmail: userEmail.trim().toLowerCase(),
          notes: notes.trim() || undefined,
          searchQuery: searchQuery || productName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit suggestion");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setProductName("");
    setNotes("");
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleResetAndClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden z-10 border border-[#ecdac1] animate-in fade-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#1c1c1c] via-[#2d2d2d] to-[#1c1c1c] text-white px-6 py-5 flex items-start justify-between border-b border-[#3d3d3d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#b6713e]/20 border border-[#b6713e]/40 flex items-center justify-center text-[#faedcd] shrink-0">
              <Sparkles size={20} className="text-[#faedcd]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#faedcd] block">
                Bespoke Fragrance Curation
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                Suggest a Fragrance
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-6 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-[#1c1c1c] mb-2">
                Suggestion Received!
              </h3>
              <p className="text-sm text-neutral-600 mb-2 max-w-sm mx-auto">
                Thank you for letting us know about{" "}
                <strong className="text-[#b6713e]">"{productName}"</strong>.
              </p>
              <div className="bg-[#fbf9f5] border border-[#ecdac1] rounded-lg p-3.5 my-4 max-w-sm mx-auto text-xs text-neutral-600">
                <p>
                  Our fragrance curators have recorded your request. We'll send an exclusive notification to{" "}
                  <strong className="text-[#1c1c1c] font-semibold">{userEmail}</strong> the moment this fragrance arrives in our Qatar boutique or online catalog.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="btn-primary h-10 px-8 text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-neutral-600 leading-relaxed">
                Can't find the fragrance you love? Tell us what you're looking for, and leave your email so we can notify you the instant it arrives in stock.
              </p>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Product Name Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5 uppercase tracking-wider">
                  Fragrance / Product Name <span className="text-[#b6713e]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Dior Sauvage Elixir, Roja Elysium, Amber Aoud..."
                    className="w-full bg-[#fbf9f5] border border-[#e5e5e5] rounded-[6px] px-3.5 py-2.5 text-sm text-[#1c1c1c] placeholder:text-neutral-400 focus:outline-none focus:border-[#b6713e] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* User Email Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5 uppercase tracking-wider">
                  Your Email Address <span className="text-[#b6713e]">*</span>
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                  />
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#fbf9f5] border border-[#e5e5e5] rounded-[6px] pl-10 pr-3.5 py-2.5 text-sm text-[#1c1c1c] placeholder:text-neutral-400 focus:outline-none focus:border-[#b6713e] focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  We'll only email you when this fragrance is available or restocked.
                </p>
              </div>

              {/* Notes / Details */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Additional Details (Optional)</span>
                  <span className="text-[10px] text-neutral-400 font-normal lowercase">bottle size, brand, notes</span>
                </label>
                <div className="relative">
                  <MessageSquare
                    size={15}
                    className="absolute left-3.5 top-3 text-neutral-400 pointer-events-none"
                  />
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Prefer 100ml EDP version, or interested in the gift set edition..."
                    className="w-full bg-[#fbf9f5] border border-[#e5e5e5] rounded-[6px] pl-10 pr-3.5 py-2 text-xs text-[#1c1c1c] placeholder:text-neutral-400 focus:outline-none focus:border-[#b6713e] focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary h-10 px-6 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Suggest This Fragrance</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
