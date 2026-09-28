"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

export interface InvoiceItem {
  id?: string;
  name: string;
  subtitle?: string | null;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ErpInvoiceData {
  orderNumber: string;
  invoiceNumber?: string;
  storeName?: string | null;
  storePhone?: string | null;
  cashierName?: string | null;
  customerName?: string | null;
  createdAt?: string | Date;
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  discountPercent?: number | string | null;
  tax?: number;
  taxRate?: number;
  total: number;
  currency?: string;
  paymentMethod?: string | null;
  payments?: Array<{ method: string; amount: number; reference?: string | null }> | null;
  paidAmount?: number;
  balance?: number;
  qrPayload?: string;
  websiteUrl?: string;
}

interface ErpInvoiceTemplateProps {
  receipt: ErpInvoiceData;
  className?: string;
  showPrintButton?: boolean;
}

// Helper to format date like: 12 SEP 2026
function formatInvoiceDate(inputDate?: string | Date): string {
  const d = inputDate ? new Date(inputDate) : new Date();
  if (isNaN(d.getTime())) return "12 SEP 2026";
  const day = d.getDate();
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const month = months[d.getMonth()] || "SEP";
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

// Helper to format time like: 12:00 AM
function formatInvoiceTime(inputDate?: string | Date): string {
  const d = inputDate ? new Date(inputDate) : new Date();
  if (isNaN(d.getTime())) return "12:00 AM";
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).toUpperCase();
}

// Parse display name to separate title, subtitle, and volume
function parseItemLines(it: InvoiceItem) {
  let title = it.name || "FRAGRANCE";
  let subtitle = it.subtitle || "Extrait De Parfum";
  let variant = it.variantName || "";

  // If variantName is inside the title like "Amber Code (100ml)"
  const bracketMatch = title.match(/\((.*?)\)/);
  if (bracketMatch) {
    if (!variant) variant = bracketMatch[1];
    title = title.replace(/\(.*?\)/, "").trim();
  }

  // Format volume if just numbers like "80" -> "80 ml"
  if (variant && /^\d+$/.test(variant.trim())) {
    variant = `${variant.trim()} ml`;
  } else if (variant && /^\d+\s*ml$/i.test(variant.trim())) {
    variant = variant.trim();
  }

  return {
    title: title.toUpperCase(),
    subtitle: subtitle || "Extrait De Parfum",
    variant: variant || "100 ml",
  };
}

export function ErpInvoiceTemplate({
  receipt,
  className = "",
  showPrintButton = false,
}: ErpInvoiceTemplateProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const currency = receipt.currency || "QAR";
  const outlet = receipt.storeName ? receipt.storeName.toUpperCase() : "AL WAKRA SOUQ";
  const contact = receipt.storePhone || "+974 6609 7444";
  const invoiceNum = receipt.invoiceNumber || receipt.orderNumber || "RP-2026-0021";
  const formattedDate = formatInvoiceDate(receipt.createdAt);
  const formattedTime = formatInvoiceTime(receipt.createdAt);
  const cashier = (receipt.cashierName || "SAJJAD").toUpperCase();

  const subtotal = Number(receipt.subtotal) || 0;
  const discount = Number(receipt.discount) || 0;
  const tax = Number(receipt.tax) || 0;
  const total = Number(receipt.total) || Math.max(0, subtotal - discount + tax);

  // Determine discount display string
  let discountLabel = "0%";
  if (receipt.discountPercent) {
    discountLabel = typeof receipt.discountPercent === "number" ? `${receipt.discountPercent}%` : receipt.discountPercent;
  } else if (discount > 0 && subtotal > 0) {
    const calcPercent = Math.round((discount / subtotal) * 100);
    discountLabel = `${calcPercent}%`;
  } else if (discount > 0) {
    discountLabel = `${currency} ${discount.toFixed(2)}`;
  }

  // Payment info
  const paymentMethod = (receipt.paymentMethod || "CARD").toUpperCase();
  const paidAmount = receipt.paidAmount !== undefined ? Number(receipt.paidAmount) : total;
  const balance = receipt.balance !== undefined ? Number(receipt.balance) : Math.max(0, paidAmount - total);

  // Generate QR Code
  useEffect(() => {
    const payload = receipt.qrPayload || `https://www.ramillette.com/?invoice=${encodeURIComponent(invoiceNum)}`;
    QRCode.toDataURL(payload, {
      margin: 0,
      width: 240,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("Error generating invoice QR code:", err));
  }, [receipt.qrPayload, invoiceNum]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`erp-invoice-wrapper ${className}`}>
      {/* Global font loading & thermal receipt print styles */}
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

        .erp-invoice-card {
          font-family: 'Clash Display', 'Montserrat', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        @media print {
          @page {
            size: auto;
            margin: 0;
          }
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:hidden,
          nav,
          header,
          aside,
          button {
            display: none !important;
          }
          .erp-invoice-card {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 8mm 6mm !important;
            margin: 0 auto !important;
          }
        }
      `}</style>

      {showPrintButton && (
        <div className="flex justify-end mb-4 print:hidden">
          <button
            onClick={handlePrint}
            type="button"
            className="px-4 py-2 bg-[#1c1c1c] text-white hover:bg-black font-semibold text-xs rounded shadow-xs cursor-pointer flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span>Print Invoice</span>
          </button>
        </div>
      )}

      {/* Printable Receipt Canvas */}
      <div
        className="erp-invoice-card bg-white text-black p-5 sm:p-6 w-full max-w-[400px] mx-auto shadow-xl border border-neutral-200 select-text"
        style={{
          fontFamily: "'Clash Display', 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
          color: "#000000",
        }}
      >
        {/* Brand Logo */}
        <div className="text-center pt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ramillette-receipt-logo.png"
            alt="Ramillette"
            className="w-[145px] sm:w-[155px] h-auto mx-auto object-contain block"
          />
          <div className="text-[10px] sm:text-[11px] font-medium tracking-[0.22em] uppercase text-black mt-3 mb-6">
            THE ESSENCE OF ENCHANTMENT
          </div>
        </div>

        {/* Outlet & Contact */}
        <div className="flex justify-between items-center text-[10px] sm:text-[10.5px] font-semibold tracking-wider uppercase text-black mb-2">
          <span>OUTLET: {outlet}</span>
          <span>CONTACT: {contact}</span>
        </div>

        {/* Divider 1 */}
        <div className="border-b border-black w-full my-2.5" />

        {/* Invoice Meta */}
        <div className="space-y-1 text-[11px] sm:text-[11.5px] font-medium uppercase tracking-tight text-black py-0.5">
          <div className="flex justify-between items-center">
            <span>INVOICE #</span>
            <span className="font-semibold">{invoiceNum}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>DATE</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>TIME</span>
            <span>{formattedTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>CASHIER</span>
            <span className="font-semibold">{cashier}</span>
          </div>
        </div>

        {/* Divider 2 */}
        <div className="border-b border-black w-full my-2.5" />

        {/* Items Table Header */}
        <div className="flex items-center text-[11px] sm:text-[11.5px] font-medium uppercase tracking-wider text-black pb-1.5 pt-0.5">
          <div className="flex-1 min-w-0 pr-2 text-left">ITEM</div>
          <div className="w-8 sm:w-10 text-center shrink-0">QTY</div>
          <div className="w-[84px] text-right shrink-0 pr-1">PRICE</div>
          <div className="w-[84px] text-right shrink-0">TOTAL</div>
        </div>

        {/* Items List */}
        <div className="divide-y-0 py-1">
          {receipt.items && receipt.items.length > 0 ? (
            receipt.items.map((it, idx) => {
              const { title, subtitle, variant } = parseItemLines(it);
              return (
                <div key={it.id || idx} className="py-2.5 space-y-0.5">
                  <div className="flex items-baseline text-[11.5px] sm:text-[12px]">
                    <div className="flex-1 min-w-0 font-bold uppercase tracking-tight text-black pr-2 break-words">
                      {title}
                    </div>
                    <div className="w-8 sm:w-10 text-center font-medium text-black shrink-0">
                      {it.quantity}
                    </div>
                    <div className="w-[84px] text-right font-medium whitespace-nowrap text-black shrink-0 tabular-nums pr-1">
                      {currency} {Number(it.unitPrice).toFixed(2)}
                    </div>
                    <div className="w-[84px] text-right font-medium whitespace-nowrap text-black shrink-0 tabular-nums">
                      {currency} {Number(it.total).toFixed(2)}
                    </div>
                  </div>
                  {subtitle && (
                    <div className="text-[10px] sm:text-[10.5px] text-neutral-800 capitalize leading-tight">
                      {subtitle}
                    </div>
                  )}
                  {variant && (
                    <div className="text-[10px] sm:text-[10.5px] text-neutral-800 leading-tight">
                      {variant}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-3 text-center text-xs text-neutral-500">No items</div>
          )}
        </div>

        {/* Divider 3 */}
        <div className="border-b border-black w-full my-2.5" />

        {/* Subtotal & Discount */}
        <div className="space-y-1 text-[11.5px] sm:text-[12px] font-medium uppercase text-black py-0.5">
          <div className="flex justify-between items-center">
            <span>SUBTOTAL</span>
            <span>
              {currency} {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>DICOUNTS</span>
            <span>{discountLabel}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between items-center">
              <span>VAT ({receipt.taxRate || 0}%)</span>
              <span>
                {currency} {tax.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Divider 4 */}
        <div className="border-b border-black w-full my-2.5" />

        {/* Grand Total */}
        <div className="flex justify-between items-center text-[15px] sm:text-[16px] font-bold uppercase text-black py-1">
          <span>TOTAL</span>
          <span>
            {currency} {total.toFixed(2)}
          </span>
        </div>

        {/* Spacer before payment section */}
        <div className="my-3.5" />

        {/* Payment Details */}
        <div className="space-y-1 text-[11.5px] sm:text-[12px] font-medium uppercase text-black py-0.5">
          <div className="flex justify-between items-center">
            <span>PAYMENT METHOD</span>
            <span>
              {receipt.payments && receipt.payments.length > 1
                ? "SPLIT / MULTIPLE"
                : paymentMethod}
            </span>
          </div>

          {/* Itemized Subtransactions if multiple means used */}
          {receipt.payments && receipt.payments.length > 1 && (
            <div className="border-l-2 border-black pl-2.5 my-1 space-y-0.5 text-[10.5px] text-neutral-900">
              {receipt.payments.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span>
                    • {p.method}
                    {p.reference ? ` (${p.reference})` : ""}:
                  </span>
                  <span className="tabular-nums">
                    {currency} {Number(p.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center">
            <span>PAID AMOUNT</span>
            <span>
              {currency} {paidAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>BALANCE</span>
            <span>
              {currency} {balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Divider 5 */}
        <div className="border-b border-black w-full my-2.5" />

        {/* Footer */}
        <div className="text-center pt-2.5 pb-1">
          <div className="text-[11px] sm:text-[12px] font-bold tracking-wider uppercase text-black">
            THANK YOU
          </div>
          <div className="text-[10px] sm:text-[10.5px] font-medium tracking-widest uppercase text-black mt-0.5 mb-3.5">
            FOR SHOPPING WITH US
          </div>

          {/* QR Code */}
          <div className="flex justify-center my-3">
            {qrCodeDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                className="w-[105px] h-[105px] object-contain block"
              />
            ) : (
              <div className="w-[105px] h-[105px] bg-neutral-100 flex items-center justify-center text-[9px] text-neutral-400">
                Generating QR...
              </div>
            )}
          </div>

          <div className="text-[11px] sm:text-[11.5px] font-semibold tracking-widest uppercase text-black mt-2">
            {receipt.websiteUrl || "WWW.RAMILLETTE.COM"}
          </div>
        </div>
      </div>
    </div>
  );
}
