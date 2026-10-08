"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { SuggestProductModal } from "./SuggestProductModal";

interface SuggestProductButtonProps {
  initialProductName?: string;
  searchQuery?: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  buttonText?: string;
}

export function SuggestProductButton({
  initialProductName = "",
  searchQuery = "",
  className = "",
  variant = "primary",
  buttonText = "Suggest This Fragrance",
}: SuggestProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getButtonStyles = () => {
    if (className) return className;
    if (variant === "outline") {
      return "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[6px] border border-[#b6713e] text-[#b6713e] hover:bg-[#faedcd]/40 text-xs font-semibold transition-colors";
    }
    if (variant === "secondary") {
      return "btn-secondary h-10 px-5 text-xs font-semibold inline-flex items-center justify-center gap-2";
    }
    return "btn-primary h-10 px-6 text-xs font-semibold inline-flex items-center justify-center gap-2";
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={getButtonStyles()}
      >
        <Sparkles size={14} className="text-[#faedcd] shrink-0" />
        <span>{buttonText}</span>
      </button>

      <SuggestProductModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialProductName={initialProductName}
        searchQuery={searchQuery}
      />
    </>
  );
}
