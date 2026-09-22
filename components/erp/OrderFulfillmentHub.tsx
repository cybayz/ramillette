"use client";

import React, { useState, useEffect } from "react";
import {
  PackageCheck,
  Clock,
  CheckCircle2,
  Truck,
  Box,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  RotateCcw,
  Search,
} from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  currency: string;
  country: string;
  city: string;
  addressLine1: string;
  area?: string | null;
  itemsCount: number;
  acceptedAt?: string | null;
  pickedAt?: string | null;
  packedAt?: string | null;
  shippedAt?: string | null;
  carrierName?: string | null;
  trackingNumber?: string | null;
  deliveryNotes?: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface OrderFulfillmentHubProps {
  storeContext: {
    storeId: string;
    storeCode: string;
    storeName: string;
    regionName: string;
    countryCode: string;
    countryName: string;
    currency: string;
  };
}

export function OrderFulfillmentHub({ storeContext }: OrderFulfillmentHubProps) {
  const [activeStage, setActiveStage] = useState<string>("all");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [counts, setCounts] = useState({
    newCount: 0,
    pickingCount: 0,
    packingCount: 0,
    readyToShipCount: 0,
    shippedTodayCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modals state
  const [activePickingOrder, setActivePickingOrder] = useState<OrderData | null>(null);
  const [pickedItemIds, setPickedItemIds] = useState<Set<string>>(new Set());

  const [activeShippingOrder, setActiveShippingOrder] = useState<OrderData | null>(null);
  const [carrierName, setCarrierName] = useState("Aramex Express");
  const [trackingNumber, setTrackingNumber] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/erp/orders?stage=${activeStage}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to load store orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000); // Poll for fresh orders
    return () => clearInterval(interval);
  }, [activeStage, storeContext.storeId]);

  // Handle Order Acceptance (Reserves Store Stock)
  const handleAcceptOrder = async (orderId: string) => {
    try {
      setProcessingId(orderId);
      const res = await fetch(`/api/erp/orders/${orderId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept order");
      await loadOrders();
    } catch (err: any) {
      alert(`Order Acceptance Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Open Picking Modal
  const handleOpenPicking = (order: OrderData) => {
    setActivePickingOrder(order);
    setPickedItemIds(new Set());
  };

  // Toggle item picked
  const toggleItemPicked = (itemId: string) => {
    setPickedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  // Confirm Picking Complete
  const handleCompletePicking = async () => {
    if (!activePickingOrder) return;
    try {
      setProcessingId(activePickingOrder.id);
      const res = await fetch(`/api/erp/orders/${activePickingOrder.id}/pick`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete picking");
      setActivePickingOrder(null);
      await loadOrders();
    } catch (err: any) {
      alert(`Picking Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Confirm Packing Complete
  const handleCompletePacking = async (orderId: string) => {
    try {
      setProcessingId(orderId);
      const res = await fetch(`/api/erp/orders/${orderId}/pack`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete packing");
      await loadOrders();
    } catch (err: any) {
      alert(`Packing Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Open Shipping Modal
  const handleOpenShipping = (order: OrderData) => {
    setActiveShippingOrder(order);
    const prefix = order.country === "AE" ? "DXB" : order.country === "BH" ? "BAH" : "DOH";
    setTrackingNumber(`${prefix}-${Math.floor(10000000 + Math.random() * 90000000)}`);
  };

  // Confirm Dispatch & Shipping
  const handleCompleteShipping = async () => {
    if (!activeShippingOrder) return;
    try {
      setProcessingId(activeShippingOrder.id);
      const res = await fetch(`/api/erp/orders/${activeShippingOrder.id}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrierName,
          trackingNumber,
          trackingUrl: `https://track.ramillette.com/?awb=${trackingNumber}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch order");

      setActiveShippingOrder(null);
      await loadOrders();
    } catch (err: any) {
      alert(`Shipping Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const stages = [
    { id: "all", label: "All Orders", count: orders.length },
    { id: "new", label: "New Incoming", count: counts.newCount, highlight: counts.newCount > 0 },
    { id: "picking", label: "To Pick", count: counts.pickingCount },
    { id: "packing", label: "To Pack", count: counts.packingCount },
    { id: "ready_to_ship", label: "Ready to Ship", count: counts.readyToShipCount },
    { id: "shipped", label: "Dispatched", count: counts.shippedTodayCount },
  ];

  return (
    <div className="space-y-5">
      {/* Header & Pipeline Stages */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a2a2a] pb-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <PackageCheck size={22} className="text-[#faedcd]" />
            <span>Store Order Fulfillment Hub</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Fulfill regional online orders dispatched from {storeContext.storeName}
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="px-3 py-1.5 rounded-[6px] bg-[#222222] hover:bg-[#2c2c2c] border border-[#333333] text-xs font-semibold text-neutral-300 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {/* Stage Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {stages.map((st) => (
          <button
            key={st.id}
            onClick={() => setActiveStage(st.id)}
            className={`px-3.5 py-2 rounded-[6px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeStage === st.id
                ? "bg-[#faedcd] text-[#1c1c1c] shadow-sm"
                : "bg-[#1c1c1c] border border-[#2a2a2a] text-neutral-400 hover:text-white hover:bg-[#242424]"
            }`}
          >
            <span>{st.label}</span>
            <span
              className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded ${
                activeStage === st.id
                  ? "bg-[#1c1c1c]/15 text-[#1c1c1c]"
                  : st.highlight
                  ? "bg-red-950 text-red-300 border border-red-800"
                  : "bg-[#282828] text-neutral-400"
              }`}
            >
              {st.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List / Cards */}
      {loading && orders.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 text-xs">
          Checking store fulfillment pipeline...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-12 text-center text-neutral-500 space-y-2">
          <CheckCircle2 size={36} className="mx-auto text-neutral-600 mb-1" />
          <div className="text-sm font-bold text-neutral-300">All caught up in this stage!</div>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            No active orders waiting in the &quot;{activeStage.replace("_", " ")}&quot; pipeline for this branch.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {orders.map((ord) => {
            const isProcessingThis = processingId === ord.id;
            const isPendingAcceptance = ord.fulfillmentStatus === "UNFULFILLED" && !ord.acceptedAt;
            const isReadyForPicking = ord.acceptedAt && !ord.pickedAt;
            const isReadyForPacking = ord.pickedAt && !ord.packedAt;
            const isReadyForShipping = ord.packedAt && !ord.shippedAt;
            const isShipped = Boolean(ord.shippedAt);

            return (
              <div
                key={ord.id}
                className="bg-[#1c1c1c] border border-[#2a2a2a] hover:border-[#383838] rounded-[8px] p-4.5 transition-all shadow-sm space-y-3.5"
              >
                {/* Top Row: Order Number, Customer, Value, and Stage Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-white">
                      #{ord.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isPendingAcceptance
                          ? "bg-amber-950/80 text-amber-300 border border-amber-800 animate-pulse"
                          : isReadyForPicking
                          ? "bg-blue-950/80 text-blue-300 border border-blue-800"
                          : isReadyForPacking
                          ? "bg-purple-950/80 text-purple-300 border border-purple-800"
                          : isReadyForShipping
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                          : "bg-neutral-800 text-neutral-300"
                      }`}
                    >
                      {isPendingAcceptance
                        ? "New Order (Awaiting Acceptance)"
                        : isReadyForPicking
                        ? "Accepted • Ready to Pick"
                        : isReadyForPacking
                        ? "Picked • Ready to Pack"
                        : isReadyForShipping
                        ? "Packed • Ready to Dispatch"
                        : "Shipped / In Transit"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-neutral-400">
                      Payment: <strong className="text-white">{ord.paymentMethod} ({ord.paymentStatus})</strong>
                    </span>
                    <span className="font-mono font-black text-sm text-[#faedcd]">
                      {ord.currency} {ord.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Middle: Customer Details & Items Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Customer & Address */}
                  <div className="space-y-1 text-neutral-400">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{ord.customerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} />
                      <span>{ord.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="shrink-0" />
                      <span className="truncate">
                        {[ord.addressLine1, ord.area, ord.city].filter(Boolean).join(", ")}
                      </span>
                    </div>
                    {ord.deliveryNotes && (
                      <div className="p-1.5 rounded bg-[#242424] text-[10px] text-amber-300/90 mt-1">
                        Note: {ord.deliveryNotes}
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="md:col-span-2 space-y-1.5 bg-[#171717] p-3 rounded-[6px] border border-[#262626]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Ordered Items ({ord.items.length} lines):
                    </span>
                    <div className="space-y-1">
                      {ord.items.map((it) => (
                        <div key={it.id} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-[#262626] font-mono text-[10px] font-bold text-white flex items-center justify-center">
                              {it.quantity}&times;
                            </span>
                            <span className="font-bold text-white">{it.productName}</span>
                            {it.variantName && (
                              <span className="text-neutral-400 text-[11px]">({it.variantName})</span>
                            )}
                          </div>
                          <span className="font-mono text-neutral-400 text-[11px]">
                            SKU: {it.sku || "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-2 border-t border-[#262626] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
                    <Clock size={12} />
                    <span>Created: {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {ord.trackingNumber && (
                      <span>• Courier: <strong>{ord.carrierName} ({ord.trackingNumber})</strong></span>
                    )}
                  </div>

                  {/* Stage Transition Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Stage 1: Accept Order & Reserve Stock */}
                    {isPendingAcceptance && (
                      <button
                        onClick={() => handleAcceptOrder(ord.id)}
                        disabled={isProcessingThis}
                        className="px-4 py-2 rounded-[5px] bg-[#faedcd] hover:bg-[#ebd59f] text-[#1c1c1c] font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} />
                        <span>{isProcessingThis ? "Reserving..." : "Accept Order & Reserve Stock"}</span>
                      </button>
                    )}

                    {/* Stage 2: Pick Products */}
                    {isReadyForPicking && (
                      <button
                        onClick={() => handleOpenPicking(ord)}
                        className="px-4 py-2 rounded-[5px] bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <CheckSquare size={14} />
                        <span>Start Picking Items</span>
                      </button>
                    )}

                    {/* Stage 3: Pack Products */}
                    {isReadyForPacking && (
                      <button
                        onClick={() => handleCompletePacking(ord.id)}
                        disabled={isProcessingThis}
                        className="px-4 py-2 rounded-[5px] bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Box size={14} />
                        <span>{isProcessingThis ? "Packing..." : "Mark Order Packed"}</span>
                      </button>
                    )}

                    {/* Stage 4: Ship & Enter Tracking */}
                    {isReadyForShipping && (
                      <button
                        onClick={() => handleOpenShipping(ord)}
                        className="px-4 py-2 rounded-[5px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Truck size={14} />
                        <span>Dispatch & Ship Order</span>
                      </button>
                    )}

                    {/* Shipped / Completed State */}
                    {isShipped && (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Fulfilled from {storeContext.storeName}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Barcode-Verified Picking Checklist */}
      {activePickingOrder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#202020] border border-[#333333] rounded-[10px] w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#faedcd] font-bold uppercase tracking-wider">
                  Store Picking Terminal
                </span>
                <h3 className="text-base font-black text-white">
                  Order #{activePickingOrder.orderNumber}
                </h3>
              </div>
              <button onClick={() => setActivePickingOrder(null)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Pick each fragrance bottle from shelf and tick it off (or scan its barcode):
            </p>

            {/* Checklist Items */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {activePickingOrder.items.map((it) => {
                const isPicked = pickedItemIds.has(it.id);
                return (
                  <button
                    key={it.id}
                    onClick={() => toggleItemPicked(it.id)}
                    className={`w-full p-3 rounded-[6px] border flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isPicked
                        ? "bg-emerald-950/40 border-emerald-700 text-white"
                        : "bg-[#181818] border-[#2e2e2e] text-neutral-300 hover:border-neutral-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isPicked ? (
                        <CheckSquare size={18} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Square size={18} className="text-neutral-500 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold">
                          {it.productName} {it.variantName ? `(${it.variantName})` : ""}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          Qty to pick: <strong>{it.quantity} bottle(s)</strong> • SKU: {it.sku || "N/A"}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-neutral-400">
                      {isPicked ? "PICKED" : "PENDING"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#2d2d2d]">
              <button
                onClick={() => setActivePickingOrder(null)}
                className="py-2.5 px-4 rounded bg-[#2a2a2a] text-xs font-bold text-neutral-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCompletePicking}
                disabled={pickedItemIds.size < activePickingOrder.items.length || processingId !== null}
                className="flex-1 py-2.5 rounded bg-[#faedcd] text-[#1c1c1c] text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={16} />
                <span>Confirm All {activePickingOrder.items.length} Items Picked</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Dispatch & Shipping Modal */}
      {activeShippingOrder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#202020] border border-[#333333] rounded-[10px] w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#faedcd] font-bold uppercase tracking-wider">
                  Dispatch & Shipping
                </span>
                <h3 className="text-base font-black text-white">
                  Order #{activeShippingOrder.orderNumber}
                </h3>
              </div>
              <button onClick={() => setActiveShippingOrder(null)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Courier / Shipping Provider
                </label>
                <input
                  type="text"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  placeholder="e.g. Aramex Express, Qatar Post, DHL"
                  className="w-full bg-[#181818] border border-[#333333] rounded-[6px] px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Waybill / Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. DOH-84920193"
                  className="w-full bg-[#181818] border border-[#333333] rounded-[6px] px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-[#181818] border border-[#2b2b2b] rounded-[6px] text-neutral-400 space-y-1 text-[11px]">
                <div>Customer: <strong className="text-white">{activeShippingOrder.customerName}</strong></div>
                <div>Destination: <strong className="text-white">{activeShippingOrder.city}, {activeShippingOrder.addressLine1}</strong></div>
                <div>Customer Phone: <strong className="text-white">{activeShippingOrder.customerPhone}</strong></div>
              </div>

              <p className="text-[10px] text-neutral-500">
                Confirming shipment will permanently convert the store&apos;s reserved stock into physical deduction, log an ONLINE_ORDER transaction, and notify the customer via SMS.
              </p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#2d2d2d]">
              <button
                onClick={() => setActiveShippingOrder(null)}
                className="py-2.5 px-4 rounded bg-[#2a2a2a] text-xs font-bold text-neutral-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteShipping}
                disabled={!trackingNumber.trim() || processingId !== null}
                className="flex-1 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-40"
              >
                <Truck size={15} />
                <span>Confirm Dispatch & Ship</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
