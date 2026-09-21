"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Printer,
  Download,
  Share2,
  ArrowLeft,
  Check,
  ExternalLink,
} from "lucide-react";
import { InvoiceOrderData, generateWhatsAppInvoiceUrl } from "@/lib/admin/invoiceUtils";

export function InvoiceActionControls({ order }: { order: InvoiceOrderData }) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const url = generateWhatsAppInvoiceUrl(order);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="print:hidden bg-white border border-[#e5e5e5] rounded-[10px] p-4 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Back Navigation */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-[#1c1c1c] bg-neutral-100 hover:bg-neutral-200 rounded-[6px] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Order Details</span>
        </Link>
        <span className="text-xs text-neutral-400 hidden md:inline">|</span>
        <span className="text-xs font-mono font-bold text-neutral-700 hidden md:inline">
          Order #{order.orderNumber}
        </span>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
        {/* WhatsApp Share Button */}
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-[6px] transition-all shadow-xs cursor-pointer"
          title="Share formatted invoice on customer WhatsApp"
        >
          <Share2 size={14} />
          <span>Share on WhatsApp</span>
        </button>

        {/* Download / Save PDF Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-800 hover:bg-black text-white text-xs font-bold rounded-[6px] transition-all shadow-xs cursor-pointer"
          title="Save or download as PDF via Print dialog"
        >
          <Download size={14} />
          <span>Download PDF</span>
        </button>

        {/* Print Invoice Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="btn-primary h-9 px-4 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          title="Print official commercial invoice"
        >
          <Printer size={14} />
          <span>Print Invoice</span>
        </button>

        {/* Copy Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-[6px] border border-neutral-200 transition-colors"
          title="Copy invoice link"
        >
          {copied ? <Check size={16} className="text-emerald-600" /> : <ExternalLink size={16} />}
        </button>
      </div>
    </div>
  );
}
