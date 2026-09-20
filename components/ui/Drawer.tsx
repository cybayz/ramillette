"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  position?: "right" | "left";
  maxWidth?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  maxWidth = "max-w-md",
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Slideout Panel */}
      <div
        className={`fixed inset-y-0 ${
          position === "right" ? "right-0 pl-6 sm:pl-10" : "left-0 pr-6 sm:pr-10"
        } flex max-w-full`}
      >
        <div
          className={`w-screen ${maxWidth} bg-white shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${
            position === "right"
              ? "animate-in slide-in-from-right"
              : "animate-in slide-in-from-left"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#e5e5e5]">
            <div className="text-lg font-semibold text-[#1c1c1c]">{title}</div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-[#1c1c1c] hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
