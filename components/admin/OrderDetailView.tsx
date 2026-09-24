"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Share2,
  Download,
  Phone,
  Mail,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Check,
  Loader2,
  ExternalLink,
  MessageCircle,
  FileText,
  Lock,
  ChevronDown,
  Gift,
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { InvoiceOrderData, generateWhatsAppInvoiceUrl } from "@/lib/admin/invoiceUtils";

interface OrderDetailViewProps {
  initialOrder: InvoiceOrderData;
}

export function OrderDetailView({ initialOrder }: OrderDetailViewProps) {
  const [order, setOrder] = useState<InvoiceOrderData>(initialOrder);

  // Admin notes state
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  // Status update state
  const [status, setStatus] = useState(order.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Tracking modal state
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [carrierName, setCarrierName] = useState(order.carrierName || "Aramex");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || "");
  const [isSavingTracking, setIsSavingTracking] = useState(false);

  const statuses = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });

      if (res.ok) {
        setNotesSaved(true);
        setOrder({ ...order, adminNotes });
        setTimeout(() => setNotesSaved(false), 3000);
      } else {
        alert("Failed to save admin notes. Please try again.");
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
      alert("Network error while saving notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setIsUpdatingStatus(true);
    try {
      const payload: any = { status: newStatus };
      if (newStatus === "SHIPPED" && !order.shippedAt) {
        payload.shippedAt = new Date().toISOString();
        payload.fulfillmentStatus = "FULFILLED";
      }

      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrder({
          ...order,
          status: newStatus,
          fulfillmentStatus: updated.fulfillmentStatus || order.fulfillmentStatus,
          shippedAt: updated.shippedAt || order.shippedAt,
        });
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTracking(true);
    try {
      const payload = {
        carrierName: carrierName.trim() || "Courier",
        trackingNumber: trackingNumber.trim(),
        trackingUrl: trackingUrl.trim() || null,
        status: "SHIPPED",
        fulfillmentStatus: "FULFILLED",
        shippedAt: order.shippedAt || new Date().toISOString(),
      };

      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOrder({
          ...order,
          ...payload,
        });
        setStatus("SHIPPED");
        setIsTrackingModalOpen(false);
      } else {
        alert("Failed to update tracking info.");
      }
    } catch (err) {
      console.error("Failed to update tracking:", err);
      alert("Network error updating tracking info.");
    } finally {
      setIsSavingTracking(false);
    }
  };

  const handleWhatsAppShare = () => {
    const url = generateWhatsAppInvoiceUrl(order);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const fullAddress = [order.addressLine1, order.area, order.city, order.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e5e5e5]">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <Link href="/admin/orders" className="hover:text-[#1c1c1c] flex items-center gap-1">
              <ArrowLeft size={13} />
              <span>All Orders</span>
            </Link>
            <span>/</span>
            <span className="font-mono text-neutral-700 font-bold">#{order.orderNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#1c1c1c] font-mono">
              Order #{order.orderNumber}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#faedcd] border border-[#ecdec1] text-[#b6713e]">
              {order.country} Market
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString("en-US", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* WhatsApp Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-[6px] transition-all shadow-xs cursor-pointer"
            title="Share invoice with customer on WhatsApp"
          >
            <Share2 size={14} />
            <span>WhatsApp Invoice</span>
          </button>

          {/* View / Print Full Invoice */}
          <Link
            href={`/admin/orders/${order.id}/invoice`}
            className="btn-primary h-9 px-4 text-xs font-bold inline-flex items-center gap-1.5"
            title="Open printable invoice document"
          >
            <Printer size={14} />
            <span>Print Invoice</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Line Items, Admin Notes & Pricing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table Card */}
          <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fbf9f5]">
              <h2 className="text-sm font-bold text-[#1c1c1c] flex items-center gap-2">
                <FileText size={16} className="text-[#b6713e]" />
                <span>Ordered Fragrances ({order.items.length})</span>
              </h2>
              <span className="text-xs text-neutral-500 font-mono">
                Subtotal: {formatPrice(order.subtotal, order.country)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e5e5e5] bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Item Details</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ece1]">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#1c1c1c] text-xs">{item.productName}</p>
                        {item.sku && (
                          <p className="font-mono text-[10px] text-neutral-400">SKU: {item.sku}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600 font-medium">
                        {item.variantName || "Standard"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-neutral-800">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-neutral-600">
                        {formatPrice(item.unitPrice, order.country)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#b6713e]">
                        {formatPrice(item.total, order.country)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Inside Card */}
            <div className="p-6 bg-neutral-50 border-t border-[#e5e5e5] space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal</span>
                <span className="font-mono">{formatPrice(order.subtotal, order.country)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount Applied</span>
                  <span className="font-mono">-{formatPrice(order.discount, order.country)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Shipping & Express Logistics</span>
                <span className="font-mono">
                  {order.shippingFee > 0
                    ? formatPrice(order.shippingFee, order.country)
                    : "Free Express Delivery"}
                </span>
              </div>

              {(order.giftWrapFee || 0) > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span className="flex items-center gap-1">
                    <Gift size={12} className="text-[#b6713e]" />
                    <span>Luxury Gift Wrap</span>
                  </span>
                  <span className="font-mono text-[#b6713e]">
                    +{formatPrice(order.giftWrapFee || 0, order.country)}
                  </span>
                </div>
              )}

              {order.tax > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>VAT / Taxes</span>
                  <span className="font-mono">{formatPrice(order.tax, order.country)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline font-bold">
                <span className="text-sm text-[#1c1c1c]">Grand Total Amount</span>
                <span className="text-lg font-mono text-[#b6713e]">
                  {formatPrice(order.total, order.country)}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Internal Notes Card */}
          <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Lock size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1c1c1c]">
                    Admin Internal Notes
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Private operational notes strictly visible to administrators only.
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                🔒 Admin Only
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Internal Note / Status Memo
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                placeholder="e.g. Stock wasn't there so preparing from batch 2. Called customer to confirm evening delivery. Will dispatch via Aramex tomorrow morning..."
                className="w-full text-xs p-3 border border-[#d1d5db] rounded-[6px] focus:outline-none focus:border-[#b6713e] focus:ring-1 focus:ring-[#b6713e] transition-all font-sans placeholder:text-neutral-400"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-neutral-400 italic">
                Customers and public receipts never see this field.
              </p>

              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="btn-primary h-8 px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isSavingNotes ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : notesSaved ? (
                  <Check size={13} className="text-emerald-300" />
                ) : null}
                <span>{notesSaved ? "Saved!" : isSavingNotes ? "Saving..." : "Save Admin Note"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Status, Customer, Logistics, Payment */}
        <div className="space-y-6">
          {/* Order Status & Quick Controls */}
          <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Fulfillment Status
            </h3>

            <div className="space-y-2">
              <label className="block text-[11px] text-neutral-600 font-medium">
                Current Status:
              </label>
              <div className="relative">
                <select
                  disabled={isUpdatingStatus}
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`w-full text-xs font-bold py-2.5 px-3 rounded-[6px] border appearance-none pr-8 cursor-pointer focus:outline-none transition-colors ${
                    status === "DELIVERED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : status === "SHIPPED"
                      ? "bg-blue-50 text-blue-800 border-blue-300"
                      : status === "PROCESSING"
                      ? "bg-purple-50 text-purple-800 border-purple-300"
                      : status === "CANCELLED"
                      ? "bg-red-50 text-red-800 border-red-300"
                      : "bg-[#faedcd]/60 text-[#b6713e] border-[#ecdec1]"
                  }`}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500"
                />
              </div>
            </div>

            {/* Shipment Tracking Details Box */}
            <div className="pt-2 border-t border-neutral-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                  <Truck size={14} className="text-blue-600" />
                  <span>Logistics & Courier</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsTrackingModalOpen(true)}
                  className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 size={11} />
                  <span>{order.trackingNumber ? "Edit" : "+ Add Tracking"}</span>
                </button>
              </div>

              <div className="p-3 bg-neutral-50 rounded-[6px] border border-neutral-200 space-y-1">
                <p className="text-neutral-600">
                  <span className="text-neutral-400">Carrier: </span>
                  <strong>{order.carrierName || "Pending Carrier Assignment"}</strong>
                </p>
                <p className="text-neutral-600">
                  <span className="text-neutral-400">Tracking #: </span>
                  <span className="font-mono font-bold text-[#1c1c1c]">
                    {order.trackingNumber || "Not assigned yet"}
                  </span>
                </p>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline font-bold text-[11px] inline-flex items-center gap-1 pt-1"
                  >
                    <span>Track on Carrier Website</span>
                    <ExternalLink size={11} />
                  </a>
                )}
                {order.shippedAt && (
                  <p className="text-[10px] text-neutral-400 pt-1">
                    Dispatched: {new Date(order.shippedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Details Card */}
          <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs p-5 space-y-3.5 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Customer Information
            </h3>

            <div className="space-y-1.5">
              <p className="text-sm font-bold text-[#1c1c1c]">{order.customerName}</p>
              <div className="flex items-center justify-between text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <Phone size={12} className="text-neutral-400" />
                  <span>{order.customerPhone}</span>
                </span>
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="text-[#25D366] hover:text-[#20ba5a] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  title="Direct WhatsApp"
                >
                  <MessageCircle size={12} />
                  <span>WhatsApp</span>
                </button>
              </div>
              <p className="text-neutral-600 flex items-center gap-1.5">
                <Mail size={12} className="text-neutral-400" />
                <span>{order.customerEmail}</span>
              </p>
            </div>

            {/* Delivery Destination */}
            <div className="pt-3 border-t border-neutral-100">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                Delivery Address
              </span>
              <p className="text-neutral-700 flex items-start gap-1.5 leading-relaxed">
                <MapPin size={13} className="shrink-0 mt-0.5 text-[#b6713e]" />
                <span>{fullAddress || "No address details provided"}</span>
              </p>
              {order.deliveryNotes && (
                <div className="mt-2 text-[11px] text-amber-900 bg-amber-50 p-2 rounded-[6px] border border-amber-200">
                  <span className="font-bold block">Delivery Instructions:</span>
                  <span>{order.deliveryNotes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Gift Order & Message Card */}
          {order.isGift && (
            <div className="bg-white rounded-[10px] border border-[#ecdac1] shadow-xs p-5 space-y-3 text-xs bg-gradient-to-br from-[#fbf9f5] to-white">
              <div className="flex items-center justify-between pb-2 border-b border-[#f0ece1]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#faedcd] flex items-center justify-center text-[#b6713e]">
                    <Gift size={14} />
                  </div>
                  <h3 className="font-bold text-[#1c1c1c]">Gift Order Service</h3>
                </div>
                {order.giftWrapName ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#faedcd] text-[#b6713e] border border-[#ecdec1]">
                    <Sparkles size={10} />
                    <span>{order.giftWrapName}</span>
                  </span>
                ) : order.hasGiftWrap ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#faedcd] text-[#b6713e] border border-[#ecdec1]">
                    <Sparkles size={10} />
                    <span>Gift Wrap Included</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600">
                    Complimentary Card Only
                  </span>
                )}
              </div>

              {(order.hasGiftWrap || Number(order.giftWrapFee) > 0) && (
                <div className="p-2.5 rounded bg-white border border-[#ecdec1] text-[11px] text-[#b6713e] font-medium flex items-center justify-between">
                  <span>{order.giftWrapName || "Luxury Gift Wrap Added"}</span>
                  <span className="font-bold font-mono">+{formatPrice(order.giftWrapFee || 0, order.country)}</span>
                </div>
              )}

              {order.giftMessage ? (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Client Gift Card Message:
                  </span>
                  <div className="p-3 bg-white rounded-[6px] border border-[#f0ece1] text-xs font-serif italic text-neutral-800 leading-relaxed">
                    &ldquo;{order.giftMessage}&rdquo;
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-400 italic">
                  Customer selected gift service without adding custom card message.
                </p>
              )}
            </div>
          )}

          {/* Payment Card */}
          <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs p-5 space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Payment Information
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Method</span>
                <strong className="text-[#1c1c1c]">{order.paymentMethod}</strong>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 text-[10px] uppercase block">Status</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    order.paymentStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {order.paymentGatewayRef && (
              <div className="pt-2 border-t border-neutral-100 text-[11px]">
                <span className="text-neutral-400 block">Gateway Reference</span>
                <code className="font-mono text-neutral-700 bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-200 block truncate">
                  {order.paymentGatewayRef}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Tracking Modal */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-lg border border-[#e5e5e5] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fbf9f5]">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-[#b6713e]" />
                <h3 className="text-sm font-bold text-[#1c1c1c]">Update Shipment Tracking</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTrackingModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Courier / Carrier *
                </label>
                <input
                  type="text"
                  required
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  placeholder="e.g. Aramex, DHL, Qatar Post, SMSA"
                  className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Waybill / Tracking Number *
                </label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. ARMX-89230198"
                  className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Customer Tracking URL (Optional)
                </label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://www.aramex.com/track/..."
                  className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsTrackingModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 text-xs font-semibold text-neutral-600 rounded-[5px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTracking}
                  className="btn-primary h-9 px-5 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  {isSavingTracking ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>Save Tracking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
