"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  Loader2,
  ExternalLink,
  Eye,
  X,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  Percent,
  Edit2,
  Copy,
  Check,
  Printer,
  Share2,
  Lock,
  FileText,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { generateWhatsAppInvoiceUrl, InvoiceOrderData } from "@/lib/admin/invoiceUtils";

export interface AdminOrderItem {
  id: string;
  productName: string;
  variantName?: string | null;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  currency: string;
  country: string;
  city?: string;
  addressLine1?: string;
  area?: string | null;
  deliveryNotes?: string | null;
  adminNotes?: string | null;
  paymentGatewayRef?: string | null;
  carrierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippedAt?: string | null;
  itemsCount: number;
  items: AdminOrderItem[];
  createdAt: string;
}

interface OrdersTableProps {
  initialOrders: AdminOrder[];
  availableCountries?: Array<{ code: string; name: string; flag: string }>;
}

export function OrdersTable({
  initialOrders,
  availableCountries = [
    { code: "QA", name: "Qatar", flag: "🇶🇦" },
    { code: "AE", name: "UAE", flag: "🇦🇪" },
    { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  ],
}: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [modalAdminNotes, setModalAdminNotes] = useState("");
  const [isSavingModalNotes, setIsSavingModalNotes] = useState(false);
  const [modalNotesSaved, setModalNotesSaved] = useState(false);

  const handleOpenOrderModal = (order: AdminOrder) => {
    setSelectedOrder(order);
    setModalAdminNotes(order.adminNotes || "");
    setModalNotesSaved(false);
  };

  const handleSaveModalNotes = async () => {
    if (!selectedOrder) return;
    setIsSavingModalNotes(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: modalAdminNotes }),
      });

      if (res.ok) {
        setModalNotesSaved(true);
        setOrders(
          orders.map((o) =>
            o.id === selectedOrder.id ? { ...o, adminNotes: modalAdminNotes } : o
          )
        );
        setSelectedOrder({ ...selectedOrder, adminNotes: modalAdminNotes });
        setTimeout(() => setModalNotesSaved(false), 2500);
      } else {
        alert("Failed to save admin notes.");
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
      alert("Network error saving notes.");
    } finally {
      setIsSavingModalNotes(false);
    }
  };

  // Shipment tracking popup modal state
  const [shippingModalOrder, setShippingModalOrder] = useState<AdminOrder | null>(null);
  const [shippingCarrier, setShippingCarrier] = useState("Aramex");
  const [shippingTrackingNumber, setShippingTrackingNumber] = useState("");
  const [shippingTrackingUrl, setShippingTrackingUrl] = useState("");
  const [isSavingShipment, setIsSavingShipment] = useState(false);

  const CARRIER_PRESETS = [
    {
      name: "Aramex",
      generateUrl: (num: string) =>
        num ? `https://www.aramex.com/track/results?shipmentNumber=${encodeURIComponent(num)}` : "",
    },
    {
      name: "DHL Express",
      generateUrl: (num: string) =>
        num ? `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(num)}` : "",
    },
    {
      name: "Qatar Post",
      generateUrl: (num: string) =>
        num ? `https://qatarpost.qa/track?trackingNumber=${encodeURIComponent(num)}` : "",
    },
    {
      name: "SMSA Express",
      generateUrl: (num: string) =>
        num ? `https://www.smsaexpress.com/track/${encodeURIComponent(num)}` : "",
    },
    {
      name: "Fetchr",
      generateUrl: (num: string) =>
        num ? `https://track.fetchr.us/${encodeURIComponent(num)}` : "",
    },
    {
      name: "Boutique Courier",
      generateUrl: () => "",
    },
  ];

  const handleSelectCarrier = (cName: string) => {
    setShippingCarrier(cName);
    const preset = CARRIER_PRESETS.find((p) => p.name === cName);
    if (preset && shippingTrackingNumber) {
      const generated = preset.generateUrl(shippingTrackingNumber);
      if (generated) setShippingTrackingUrl(generated);
    }
  };

  const handleTrackingNumberChange = (val: string) => {
    setShippingTrackingNumber(val);
    const preset = CARRIER_PRESETS.find((p) => p.name === shippingCarrier);
    if (preset) {
      const generated = preset.generateUrl(val);
      if (generated) setShippingTrackingUrl(generated);
    }
  };

  const statuses = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (newStatus === "SHIPPED") {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setShippingModalOrder(order);
        setShippingCarrier(order.carrierName || "Aramex");
        setShippingTrackingNumber(order.trackingNumber || "");
        setShippingTrackingUrl(order.trackingUrl || "");
        return; // Intercept to show shipment popup modal!
      }
    }

    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingModalOrder) return;

    setIsSavingShipment(true);
    try {
      const payload = {
        status: "SHIPPED",
        fulfillmentStatus: "FULFILLED",
        carrierName: shippingCarrier.trim() || "Courier",
        trackingNumber: shippingTrackingNumber.trim(),
        trackingUrl: shippingTrackingUrl.trim() || undefined,
        shippedAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/admin/orders/${shippingModalOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOrders(
          orders.map((o) =>
            o.id === shippingModalOrder.id ? { ...o, ...payload } : o
          )
        );
        if (selectedOrder && selectedOrder.id === shippingModalOrder.id) {
          setSelectedOrder({ ...selectedOrder, ...payload });
        }
        setShippingModalOrder(null);
      } else {
        alert("Failed to update order tracking details. Please try again.");
      }
    } catch (err) {
      console.error("Failed to ship order:", err);
      alert("Network error updating order tracking details.");
    } finally {
      setIsSavingShipment(false);
    }
  };

  const getCountryFlag = (code: string) => {
    const found = availableCountries.find((c) => c.code === code.toUpperCase());
    return found ? found.flag : "🌍";
  };

  const filtered = orders.filter((o) => {
    const matchesQuery =
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.customerName.toLowerCase().includes(query.toLowerCase()) ||
      o.customerPhone.includes(query);

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesCountry = countryFilter === "ALL" || o.country === countryFilter;

    return matchesQuery && matchesStatus && matchesCountry;
  });

  return (
    <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs p-6 space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order #, client name, or phone..."
            className="w-full text-xs pl-9 pr-3 py-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Country Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium">Market:</span>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-white border border-[#e5e5e5] rounded-[5px] px-3 py-2 text-xs font-semibold text-[#1c1c1c] focus:outline-none focus:border-[#b6713e]"
            >
              <option value="ALL">All Markets</option>
              {availableCountries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-[#e5e5e5] rounded-[5px] px-3 py-2 text-xs font-semibold text-[#1c1c1c] focus:outline-none focus:border-[#b6713e]"
            >
              <option value="ALL">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e5e5e5] bg-[#fbf9f5] text-neutral-600 font-bold uppercase">
              <th className="py-3 px-3">Order Number</th>
              <th className="py-3 px-3">Market</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">City / Area</th>
              <th className="py-3 px-3">Payment</th>
              <th className="py-3 px-3">Total Amount</th>
              <th className="py-3 px-3">Fulfillment Status</th>
              <th className="py-3 px-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ece1]">
            {filtered.map((order) => {
              const isUpdating = updatingId === order.id;

              return (
                <tr key={order.id} className="hover:bg-[#fbf9f5]/60 transition-colors">
                  {/* Order Number */}
                  <td className="py-3.5 px-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono font-bold text-[#1c1c1c] hover:text-[#b6713e] hover:underline block"
                      title="View Full Order Details"
                    >
                      #{order.orderNumber}
                    </Link>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {order.adminNotes && (
                      <div
                        className="mt-1 flex items-center gap-1 text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 max-w-[150px] truncate"
                        title={`Admin Note: ${order.adminNotes}`}
                      >
                        <Lock size={9} className="shrink-0 text-amber-700" />
                        <span className="truncate">{order.adminNotes}</span>
                      </div>
                    )}
                  </td>

                  {/* Market / Country */}
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 font-bold text-[11px]">
                      <span>{getCountryFlag(order.country)}</span>
                      <span>{order.country}</span>
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-[#1c1c1c] block">
                      {order.customerName}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {order.customerPhone}
                    </span>
                  </td>

                  {/* City */}
                  <td className="py-3.5 px-3 text-neutral-600 font-medium">
                    {order.city || order.area || "Standard Delivery"}
                  </td>

                  {/* Payment */}
                  <td className="py-3.5 px-3">
                    <span className="block font-semibold text-[11px]">
                      {order.paymentMethod}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>

                  {/* Amount with currency */}
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-[#1c1c1c] block text-sm">
                      {formatPrice(order.total, order.country)}
                    </span>
                    {order.tax > 0 && (
                      <span className="text-[10px] text-neutral-400">
                        incl. VAT {formatPrice(order.tax, order.country)}
                      </span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-3">
                    <div className="relative inline-block">
                      <select
                        disabled={isUpdating}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-[4px] border appearance-none pr-6 cursor-pointer focus:outline-none ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : order.status === "SHIPPED"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : order.status === "PROCESSING"
                            ? "bg-purple-50 text-purple-800 border-purple-300"
                            : order.status === "CANCELLED"
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
                        size={12}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500"
                      />
                    </div>

                    {/* Tracking ID Badge preview in row if shipped */}
                    {order.trackingNumber && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-700 font-mono">
                        <Truck size={10} />
                        <span className="truncate max-w-[100px]">{order.trackingNumber}</span>
                      </div>
                    )}
                  </td>

                  {/* View Details */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenOrderModal(order)}
                        className="p-1.5 text-[#b6713e] hover:bg-[#faedcd]/50 rounded transition-colors cursor-pointer"
                        title="Quick Inspect Popup"
                      >
                        <Eye size={16} />
                      </button>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors"
                        title="Open Full Order Page"
                      >
                        <ExternalLink size={15} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-[#e5e5e5] overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fbf9f5] gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">{getCountryFlag(selectedOrder.country)}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#1c1c1c] font-mono truncate">
                      {selectedOrder.orderNumber}
                    </h2>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200/80 text-neutral-700">
                      {selectedOrder.country}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 truncate">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href={`/admin/orders/${selectedOrder.id}`}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#b6713e] hover:bg-[#faedcd]/40 rounded transition-colors"
                  title="Open Full Page"
                >
                  <span>Full Page</span>
                  <ExternalLink size={12} />
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-md hover:bg-neutral-100 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Customer & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-neutral-50 border border-neutral-200 rounded-[8px]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Customer Information
                  </span>
                  <p className="font-bold text-[#1c1c1c]">{selectedOrder.customerName}</p>
                  <p className="text-neutral-600 flex items-center gap-1.5 mt-0.5">
                    <Phone size={12} /> {selectedOrder.customerPhone}
                  </p>
                  <p className="text-neutral-600 flex items-center gap-1.5 mt-0.5">
                    <Mail size={12} /> {selectedOrder.customerEmail}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Shipping Destination
                  </span>
                  <p className="text-neutral-700 flex items-start gap-1.5">
                    <MapPin size={12} className="shrink-0 mt-0.5 text-[#b6713e]" />
                    <span>
                      {selectedOrder.addressLine1 || "Address not provided"}
                      {selectedOrder.area ? `, ${selectedOrder.area}` : ""}
                      {selectedOrder.city ? `, ${selectedOrder.city}` : ""}
                    </span>
                  </p>
                  {selectedOrder.deliveryNotes && (
                    <p className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                      Note: {selectedOrder.deliveryNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Admin Internal Notes in Quick Modal */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-[8px] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <Lock size={13} className="text-amber-700" />
                    <span>Admin Internal Notes</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    🔒 Admin Only
                  </span>
                </div>
                <textarea
                  value={modalAdminNotes}
                  onChange={(e) => setModalAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Stock wasn't there so preparing, called customer to confirm delivery..."
                  className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-[5px] focus:outline-none focus:border-[#b6713e] placeholder:text-neutral-400"
                />
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] text-amber-700 italic">
                    Strictly internal • Never visible to customer
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveModalNotes}
                    disabled={isSavingModalNotes}
                    className="btn-primary h-7 px-3 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {isSavingModalNotes ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : modalNotesSaved ? (
                      <Check size={11} className="text-emerald-300" />
                    ) : null}
                    <span>{modalNotesSaved ? "Saved!" : isSavingModalNotes ? "Saving..." : "Save Note"}</span>
                  </button>
                </div>
              </div>

              {/* Tracking Information Card in Modal */}
              {(selectedOrder.status === "SHIPPED" || selectedOrder.trackingNumber) && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-[8px] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-900 font-bold">
                      <Truck size={15} />
                      <span>Shipment Tracking Details</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShippingModalOrder(selectedOrder);
                        setShippingCarrier(selectedOrder.carrierName || "Aramex");
                        setShippingTrackingNumber(selectedOrder.trackingNumber || "");
                        setShippingTrackingUrl(selectedOrder.trackingUrl || "");
                      }}
                      className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <Edit2 size={11} />
                      <span>Edit Tracking Details</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Courier</span>
                      <span className="font-semibold text-[#1c1c1c]">{selectedOrder.carrierName || "Standard Express"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Tracking Number</span>
                      <span className="font-mono font-bold text-[#1c1c1c]">{selectedOrder.trackingNumber || "—"}</span>
                    </div>
                  </div>

                  {selectedOrder.trackingUrl && (
                    <div className="pt-1">
                      <a
                        href={selectedOrder.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 underline"
                      >
                        <span>Track on {selectedOrder.carrierName || "Courier"} Website</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  {selectedOrder.shippedAt && (
                    <p className="text-[10px] text-neutral-400 pt-0.5">
                      Dispatched on {new Date(selectedOrder.shippedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Items List */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                  Order Items ({selectedOrder.items?.length || 0})
                </span>
                <div className="border border-neutral-200 rounded-[8px] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#fbf9f5] border-b border-neutral-200 text-neutral-600">
                      <tr>
                        <th className="py-2 px-3 font-semibold">Perfume</th>
                        <th className="py-2 px-3 font-semibold text-center">Qty</th>
                        <th className="py-2 px-3 font-semibold text-right">Unit Price</th>
                        <th className="py-2 px-3 font-semibold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {selectedOrder.items?.map((it) => (
                        <tr key={it.id}>
                          <td className="py-2 px-3">
                            <span className="font-bold text-[#1c1c1c] block">
                              {it.productName}
                            </span>
                            {it.variantName && (
                              <span className="text-[10px] text-neutral-400 block">
                                Size: {it.variantName}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center font-bold">
                            {it.quantity}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            {formatPrice(it.unitPrice, selectedOrder.country)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#b6713e]">
                            {formatPrice(it.total, selectedOrder.country)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-neutral-50 p-4 rounded-[8px] border border-neutral-200 space-y-2">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatPrice(selectedOrder.subtotal, selectedOrder.country)}</span>
                </div>

                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-mono">-{formatPrice(selectedOrder.discount, selectedOrder.country)}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Fee</span>
                  <span className="font-mono">
                    {selectedOrder.shippingFee > 0
                      ? formatPrice(selectedOrder.shippingFee, selectedOrder.country)
                      : "Free Delivery"}
                  </span>
                </div>

                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>VAT / Taxes</span>
                    <span className="font-mono">{formatPrice(selectedOrder.tax, selectedOrder.country)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-sm text-[#1c1c1c] pt-2 border-t border-neutral-200">
                  <span>Total Amount</span>
                  <span className="font-mono text-[#b6713e]">
                    {formatPrice(selectedOrder.total, selectedOrder.country)}
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Payment Method</span>
                  <span className="font-semibold text-[#1c1c1c]">{selectedOrder.paymentMethod}</span>
                  {selectedOrder.paymentGatewayRef && (
                    <span className="text-[10px] text-neutral-500 font-mono block">
                      Ref: {selectedOrder.paymentGatewayRef}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Status</span>
                  <span className="font-bold text-emerald-700">{selectedOrder.paymentStatus}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 py-3.5 border-t border-[#e5e5e5] bg-[#fbf9f5] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/orders/${selectedOrder.id}`}
                  className="text-xs font-bold text-[#b6713e] hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Full Order Page</span>
                  <ExternalLink size={12} />
                </Link>
                <span className="text-neutral-300 hidden sm:inline">•</span>
                <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
                  {selectedOrder.id.substring(0, 12)}...
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const url = generateWhatsAppInvoiceUrl(selectedOrder as any);
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-[5px] transition-colors cursor-pointer shadow-2xs"
                  title="Share invoice on WhatsApp"
                >
                  <Share2 size={12} />
                  <span>WhatsApp</span>
                </button>

                <Link
                  href={`/admin/orders/${selectedOrder.id}/invoice`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-black text-white text-xs font-bold rounded-[5px] transition-colors shadow-2xs"
                  title="Print / Save PDF Invoice"
                >
                  <Printer size={12} />
                  <span>Invoice</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="btn-primary h-8 px-4 text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Tracking Popup Modal */}
      {shippingModalOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-lg border border-[#e5e5e5] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fbf9f5]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#faedcd] border border-[#ecdec1] flex items-center justify-center text-[#b6713e]">
                  <Truck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1c1c1c]">
                    Shipment Tracking & Fulfillment
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Order #{shippingModalOrder.orderNumber} • {shippingModalOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShippingModalOrder(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-md hover:bg-neutral-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmShipment} className="p-6 space-y-4 text-xs">
              {/* Carrier Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Shipping Courier / Carrier *
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {CARRIER_PRESETS.map((preset) => {
                    const isSel = shippingCarrier.toLowerCase() === preset.name.toLowerCase();
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleSelectCarrier(preset.name)}
                        className={`px-2.5 py-1 rounded-[4px] border text-xs font-semibold transition-all ${
                          isSel
                            ? "bg-[#faedcd] border-[#b6713e] text-[#1c1c1c]"
                            : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-400"
                        }`}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  required
                  value={shippingCarrier}
                  onChange={(e) => setShippingCarrier(e.target.value)}
                  placeholder="e.g. Aramex, DHL, Qatar Post, etc."
                  className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                />
              </div>

              {/* Tracking Number */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Tracking ID / Waybill Number *
                </label>
                <input
                  type="text"
                  required
                  value={shippingTrackingNumber}
                  onChange={(e) => handleTrackingNumberChange(e.target.value)}
                  placeholder="e.g. ARMX-89230198 or DHL-902341"
                  className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e] font-mono"
                />
              </div>

              {/* Tracking Link URL */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Customer Tracking URL / Link (Optional)
                </label>
                <input
                  type="url"
                  value={shippingTrackingUrl}
                  onChange={(e) => setShippingTrackingUrl(e.target.value)}
                  placeholder="https://www.aramex.com/track/results?shipmentNumber=..."
                  className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Customers can click this link directly from their Order History page to track their shipment in real-time.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0ece1]">
                <button
                  type="button"
                  onClick={() => setShippingModalOrder(null)}
                  className="px-4 py-2 border border-[#e5e5e5] text-xs font-semibold text-neutral-600 rounded-[5px] hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingShipment}
                  className="btn-primary h-9 px-5 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                >
                  {isSavingShipment ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Truck size={13} />
                  )}
                  <span>Save & Mark as Shipped</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
