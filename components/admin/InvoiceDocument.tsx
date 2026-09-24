"use client";

import React from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { InvoiceOrderData } from "@/lib/admin/invoiceUtils";

interface InvoiceDocumentProps {
  order: InvoiceOrderData;
}

export function InvoiceDocument({ order }: InvoiceDocumentProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const fullAddress = [order.addressLine1, order.area, order.city, order.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="invoice-container bg-white text-[#1c1c1c] p-8 md:p-12 max-w-4xl mx-auto shadow-sm border border-neutral-200 rounded-lg print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none text-xs font-sans">
      {/* Invoice Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b-2 border-[#1c1c1c]">
        {/* Brand Logo & Tagline */}
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/ramillette-logo-black.svg"
              alt="Ramillette"
              width={160}
              height={44}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-500 mt-2">
            Luxury & Inspired Fragrances
          </p>
          <div className="mt-3 text-[11px] text-neutral-600 space-y-0.5">
            <p className="font-semibold text-neutral-800">Ramillette Perfumes W.L.L.</p>
            <p>Boutique: Souq Al Wakra Heritage Market</p>
            <p>Doha, State of Qatar</p>
            <p>Tel: +974 6609 7444 • Web: www.ramillette.com</p>
            <p>Email: orders@ramillette.com</p>
          </div>
        </div>

        {/* Invoice Title & Meta */}
        <div className="sm:text-right space-y-1.5">
          <span className="inline-block px-3 py-1 bg-[#1c1c1c] text-[#faedcd] font-mono font-bold text-xs uppercase tracking-widest rounded-xs">
            Official Invoice
          </span>
          <p className="text-xl font-extrabold font-mono text-[#1c1c1c] pt-1">
            INV-{order.orderNumber}
          </p>
          <p className="text-neutral-600 text-xs">
            <span className="text-neutral-400">Date:</span> {formattedDate} at {formattedTime}
          </p>
          <div className="pt-2 text-[11px] space-y-0.5">
            <p>
              <span className="text-neutral-500">Payment: </span>
              <strong className="text-neutral-800">{order.paymentMethod}</strong>{" "}
              <span
                className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {order.paymentStatus}
              </span>
            </p>
            {order.paymentGatewayRef && (
              <p className="font-mono text-[10px] text-neutral-500">
                Gateway Ref: {order.paymentGatewayRef}
              </p>
            )}
            <p>
              <span className="text-neutral-500">Fulfillment: </span>
              <strong className="text-neutral-800">{order.status}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-neutral-200">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-2">
            Billed & Delivered To
          </span>
          <p className="text-sm font-bold text-[#1c1c1c]">{order.customerName}</p>
          <div className="mt-1 text-xs text-neutral-600 space-y-0.5">
            <p>Phone: <strong className="text-neutral-800">{order.customerPhone}</strong></p>
            <p>Email: {order.customerEmail}</p>
            <p className="pt-1 text-neutral-700">
              {fullAddress || "Standard Boutique Delivery"}
            </p>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-2">
            Shipping & Dispatch Details
          </span>
          <div className="text-xs text-neutral-600 space-y-1">
            <p>
              <span className="text-neutral-500">Destination: </span>
              <strong className="text-neutral-800">{order.city || "Doha"}, {order.country}</strong>
            </p>
            <p>
              <span className="text-neutral-500">Courier / Carrier: </span>
              <strong className="text-neutral-800">{order.carrierName || "Boutique Express Delivery"}</strong>
            </p>
            {order.trackingNumber && (
              <p className="font-mono text-xs text-blue-900 bg-blue-50/80 p-1.5 rounded border border-blue-200 inline-block">
                Waybill: <strong>{order.trackingNumber}</strong>
              </p>
            )}
            {order.deliveryNotes && (
              <p className="mt-1.5 text-[11px] text-amber-900 bg-amber-50 p-2 rounded border border-amber-200 italic">
                Client instructions: &ldquo;{order.deliveryNotes}&rdquo;
              </p>
            )}
            {order.isGift && (
              <div className="mt-2 p-2.5 rounded bg-[#faedcd]/40 border border-[#ecdac1] text-[11px]">
                <div className="font-bold text-[#b6713e] flex items-center justify-between">
                  <span>🎁 Gift Order Service</span>
                  <span>{order.hasGiftWrap ? "Signature Gift Wrapping Included" : "Complimentary Card Included"}</span>
                </div>
                {order.giftMessage && (
                  <p className="mt-1 font-serif italic text-neutral-800 bg-white p-2 rounded border border-[#ecdac1]">
                    &ldquo;{order.giftMessage}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="py-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-neutral-300 bg-neutral-50 text-[11px] font-bold uppercase text-neutral-600">
              <th className="py-2.5 px-3 w-12 text-center">#</th>
              <th className="py-2.5 px-3">Item Description</th>
              <th className="py-2.5 px-3">Size / Variant</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {order.items.map((item, index) => (
              <tr key={item.id} className="text-xs">
                <td className="py-3 px-3 text-center text-neutral-400 font-mono">
                  {index + 1}
                </td>
                <td className="py-3 px-3">
                  <p className="font-bold text-[#1c1c1c]">{item.productName}</p>
                  {item.sku && (
                    <p className="font-mono text-[10px] text-neutral-400">SKU: {item.sku}</p>
                  )}
                </td>
                <td className="py-3 px-3 text-neutral-600 font-medium">
                  {item.variantName || "Standard Bottle"}
                </td>
                <td className="py-3 px-3 text-center font-bold text-neutral-800">
                  {item.quantity}
                </td>
                <td className="py-3 px-3 text-right font-mono text-neutral-700">
                  {formatPrice(item.unitPrice, order.country)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-[#1c1c1c]">
                  {formatPrice(item.total, order.country)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Breakdown & Totals */}
      <div className="pt-2 pb-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-start gap-6">
        {/* Payment and Authenticity Assurance */}
        <div className="max-w-xs space-y-2 text-[11px] text-neutral-500">
          <div className="p-3 bg-[#fbf9f5] border border-[#ecdac1] rounded-[6px]">
            <p className="font-bold text-[#b6713e] uppercase tracking-wider text-[10px] mb-1">
              Guaranteed Authenticity
            </p>
            <p className="leading-relaxed">
              Every Ramillette fragrance is crafted using master-grade French aromatic essences and concentrated Arabian oils.
            </p>
          </div>
          <p className="text-[10px] text-neutral-400">
            For returns or customer care inquiries, please quote your order number <strong>#{order.orderNumber}</strong>.
          </p>
        </div>

        {/* Pricing Calculation Summary */}
        <div className="w-full sm:w-72 space-y-2 bg-neutral-50 p-4 rounded-[6px] border border-neutral-200">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span className="font-mono font-semibold">{formatPrice(order.subtotal, order.country)}</span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Promotional Discount</span>
              <span className="font-mono">-{formatPrice(order.discount, order.country)}</span>
            </div>
          )}

          <div className="flex justify-between text-neutral-600">
            <span>Shipping / Delivery</span>
            <span className="font-mono">
              {order.shippingFee > 0
                ? formatPrice(order.shippingFee, order.country)
                : "FREE (Complimentary)"}
            </span>
          </div>

          {(order.giftWrapFee || 0) > 0 && (
            <div className="flex justify-between text-neutral-600">
              <span>Luxury Gift Wrap</span>
              <span className="font-mono text-[#b6713e]">
                +{formatPrice(order.giftWrapFee || 0, order.country)}
              </span>
            </div>
          )}

          {order.tax > 0 && (
            <div className="flex justify-between text-neutral-600">
              <span>VAT / Applicable Tax</span>
              <span className="font-mono">{formatPrice(order.tax, order.country)}</span>
            </div>
          )}

          <div className="pt-3 border-t-2 border-neutral-300 flex justify-between items-baseline font-bold">
            <span className="text-sm uppercase text-[#1c1c1c]">Total Amount</span>
            <span className="text-base font-mono text-[#b6713e]">
              {formatPrice(order.total, order.country)}
            </span>
          </div>
        </div>
      </div>

      {/* Invoice Bottom Legal & Signature Bar */}
      <div className="pt-8 border-t border-dashed border-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-400 text-[10px]">
        <div>
          <p>© 2026 Ramillette Perfumes. Souq Al Wakra, Qatar. All rights reserved.</p>
          <p>This is a computer-generated tax invoice and commercial receipt.</p>
        </div>
        <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
          <p className="font-mono font-semibold text-neutral-600">Authorized Signature & Stamp</p>
          <p className="italic text-neutral-400">Ramillette Fragrances Distribution</p>
        </div>
      </div>
    </div>
  );
}
