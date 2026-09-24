"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  ShieldCheck,
  X,
  RefreshCw,
  Sparkles,
  PackageCheck,
  Banknote,
  Boxes,
  HelpCircle,
} from "lucide-react";

interface ReturnItem {
  id: string;
  productName: string;
  variantName?: string | null;
  displayName: string;
  sku: string;
  quantity: number;
  condition?: string | null;
  restockToInventory: boolean;
  unitPrice: number;
}

interface ReturnData {
  id: string;
  returnNumber: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string | null;
  channel: string;
  status: string;
  reason?: string | null;
  refundAmount: number;
  refundMethod?: string | null;
  createdAt: string;
  items: ReturnItem[];
}

interface OrderLookupItem {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  sku: string;
  originalQuantity: number;
  previouslyReturned: number;
  remainingReturnable: number;
  unitPrice: number;
  total: number;
  imageUrl?: string | null;
}

interface SelectedReturnItem {
  productId: string;
  variantId?: string | null;
  productName: string;
  quantity: number;
  maxQuantity: number;
  unitPrice: number;
  condition: "UNOPENED" | "DAMAGED" | "DEFECTIVE";
  restockToInventory: boolean;
  imageUrl?: string | null;
}

interface CatalogOption {
  id: string;
  productId: string;
  variantId?: string | null;
  displayName: string;
  availableStock: number;
  price: number;
}

interface ReturnsDeskProps {
  storeContext: {
    storeId: string;
    storeCode: string;
    storeName: string;
    currency: string;
  };
}

export function ReturnsDesk({ storeContext }: ReturnsDeskProps) {
  const [returnsList, setReturnsList] = useState<ReturnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Return creation form
  const [orderQuery, setOrderQuery] = useState("");
  const [foundOrder, setFoundOrder] = useState<any>(null);
  const [searchingOrder, setSearchingOrder] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Return mode: Refund vs Replacement
  const [resolutionType, setResolutionType] = useState<"REFUND" | "REPLACEMENT">("REFUND");

  // Items to return
  const [selectedItems, setSelectedItems] = useState<SelectedReturnItem[]>([]);
  const [returnReason, setReturnReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("CASH");

  // Replacement specific options
  const [storeCatalog, setStoreCatalog] = useState<CatalogOption[]>([]);
  const [selectedReplacementItemKey, setSelectedReplacementItemKey] = useState<string>("");
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/erp/returns");
      if (res.ok) {
        const data = await res.json();
        setReturnsList(data.returns || []);
      }
    } catch (err) {
      console.error("Returns fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, [storeContext.storeId]);

  // Load available store items for replacement option
  const loadStoreCatalog = async () => {
    try {
      setLoadingCatalog(true);
      const res = await fetch("/api/erp/pos/products");
      if (res.ok) {
        const data = await res.json();
        const availableItems: CatalogOption[] = (data.items || [])
          .filter((it: any) => it.availableStock > 0)
          .map((it: any) => ({
            id: it.id,
            productId: it.productId,
            variantId: it.variantId || null,
            displayName: it.displayName,
            availableStock: it.availableStock,
            price: it.price,
          }));
        setStoreCatalog(availableItems);
      }
    } catch (err) {
      console.error("Catalog load error:", err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  // Lookup order by Order # or Receipt #
  const handleLookupOrder = async () => {
    if (!orderQuery.trim()) return;
    try {
      setSearchingOrder(true);
      setSearchError(null);
      const res = await fetch(`/api/erp/orders/lookup?q=${encodeURIComponent(orderQuery.trim())}`);
      const data = await res.json();

      if (res.ok && data.order) {
        const ord = data.order;
        setFoundOrder(ord);

        // Pre-fill returnable items with remaining returnable quantity
        const initialSelected: SelectedReturnItem[] = ord.items
          .filter((it: OrderLookupItem) => it.remainingReturnable > 0)
          .map((it: OrderLookupItem) => ({
            productId: it.productId,
            variantId: it.variantId || null,
            productName: it.variantName ? `${it.productName} (${it.variantName})` : it.productName,
            quantity: 1,
            maxQuantity: it.remainingReturnable,
            unitPrice: Number(it.unitPrice),
            condition: "UNOPENED",
            restockToInventory: true, // Default to unopened = restock
            imageUrl: it.imageUrl,
          }));

        if (initialSelected.length === 0) {
          setSearchError("All items from this order have already been returned.");
        } else {
          setSelectedItems(initialSelected);
          loadStoreCatalog();
        }
      } else {
        setSearchError(data.error || "Order or Receipt not found. Please verify the number.");
      }
    } catch (err: any) {
      console.error("Lookup error:", err);
      setSearchError(err?.message || "Failed to search for order.");
    } finally {
      setSearchingOrder(false);
    }
  };

  const handleProcessReturn = async () => {
    if (!foundOrder || selectedItems.length === 0) return;

    try {
      setProcessing(true);

      let repProductId = null;
      let repVariantId = null;

      if (resolutionType === "REPLACEMENT") {
        if (selectedReplacementItemKey) {
          const match = storeCatalog.find((c) => c.id === selectedReplacementItemKey);
          if (match) {
            repProductId = match.productId;
            repVariantId = match.variantId || null;
          }
        } else {
          // Default to replacing with the identical product returned
          repProductId = selectedItems[0].productId;
          repVariantId = selectedItems[0].variantId || null;
        }
      }

      const payload = {
        orderNumber: foundOrder.orderNumber,
        resolutionType,
        items: selectedItems.map((it) => ({
          productId: it.productId,
          variantId: it.variantId || null,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          condition: it.condition,
          restockToInventory: it.restockToInventory,
        })),
        reason: returnReason || "Customer in-store return",
        refundMethod: resolutionType === "REFUND" ? refundMethod : "EXCHANGE_REPLACEMENT",
        replacementProductId: repProductId,
        replacementVariantId: repVariantId,
        replacementQuantity: 1,
      };

      const res = await fetch("/api/erp/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process return");

      alert(data.message || "Return processed successfully!");
      setIsModalOpen(false);
      setFoundOrder(null);
      setOrderQuery("");
      setReturnReason("");
      setSelectedItems([]);
      await loadReturns();
    } catch (err: any) {
      alert(`Return Processing Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotalRefund = () => {
    return selectedItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a2a2a] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <RotateCcw size={22} className="text-[#faedcd]" />
            <h1 className="text-xl font-black text-white tracking-tight">
              Returns & Customer Service Desk
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Accept customer returns, choose refund or replacement, and route stock to sellable vs damaged quarantine
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setFoundOrder(null);
            setSearchError(null);
            setOrderQuery("");
            setResolutionType("REFUND");
          }}
          className="px-3.5 py-2 rounded-[6px] bg-[#faedcd] hover:bg-[#ebd59f] text-[#1c1c1c] font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          <Plus size={15} />
          <span>Accept Return / Exchange</span>
        </button>
      </div>

      {/* Returns List */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 text-xs">
          Loading returns records...
        </div>
      ) : returnsList.length === 0 ? (
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-12 text-center text-neutral-500 space-y-2">
          <ShieldCheck size={36} className="mx-auto text-neutral-600 mb-1" />
          <div className="text-sm font-bold text-neutral-300">No Return Claims on Record</div>
          <p className="text-xs text-neutral-500">
            Sales associates can look up order receipts and accept customer returns or replacements here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {returnsList.map((ret) => (
            <div
              key={ret.id}
              className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-4 space-y-3 shadow-xs"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-xs text-white">
                    #{ret.returnNumber}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                      ret.refundMethod === "EXCHANGE_REPLACEMENT"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    }`}
                  >
                    {ret.refundMethod === "EXCHANGE_REPLACEMENT" ? "EXCHANGE / REPLACED" : ret.status}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Orig. Order: <strong className="text-white font-mono">#{ret.orderNumber}</strong> ({ret.channel})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-neutral-400">
                    {ret.refundMethod === "EXCHANGE_REPLACEMENT" ? (
                      <span className="text-amber-300 font-bold">Product Replaced (0.00 refunded)</span>
                    ) : (
                      <>
                        Refunded: <strong className="font-mono text-red-400">-{storeContext.currency} {ret.refundAmount.toFixed(2)}</strong> ({ret.refundMethod})
                      </>
                    )}
                  </span>
                  <span className="text-neutral-500 text-[11px] font-mono">
                    {new Date(ret.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Items & Reasons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#181818] border border-[#262626] rounded-[6px] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Customer Info:
                  </span>
                  <div className="font-bold text-white">{ret.customerName}</div>
                  {ret.customerPhone && <div className="text-neutral-400">{ret.customerPhone}</div>}
                  {ret.reason && <div className="text-neutral-400 mt-1">Note: {ret.reason}</div>}
                </div>

                <div className="p-3 bg-[#181818] border border-[#262626] rounded-[6px] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Returned Items & Stock Routing:
                  </span>
                  <div className="space-y-1.5">
                    {ret.items.map((it) => (
                      <div key={it.id} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">
                          {it.displayName} &times; {it.quantity}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                            it.restockToInventory
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                              : "bg-red-950/80 text-red-300 border border-red-800"
                          }`}
                        >
                          {it.restockToInventory ? "RESTOCKED TO SELLABLE" : "MOVED TO DAMAGED STOCK"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Process Return / Exchange */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#202020] border border-[#333333] rounded-[10px] w-full max-w-xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-2">
              <div className="flex items-center gap-2">
                <RotateCcw size={17} className="text-[#faedcd]" />
                <h3 className="text-sm font-black text-white">Accept Customer Return / Exchange</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Step 1: Order Lookup */}
            {!foundOrder ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                    Search Order Number, Receipt #, or Customer Phone:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={orderQuery}
                      onChange={(e) => setOrderQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleLookupOrder();
                      }}
                      placeholder="e.g. RAM-QA-2609-8472 or POS receipt #..."
                      className="w-full bg-[#181818] border border-[#333333] focus:border-[#faedcd] rounded-[6px] px-3 py-2 text-white font-mono focus:outline-none"
                    />
                    <button
                      onClick={handleLookupOrder}
                      disabled={searchingOrder || !orderQuery.trim()}
                      className="px-5 py-2 rounded bg-[#faedcd] hover:bg-[#ebd59f] text-[#1c1c1c] font-black text-xs cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      {searchingOrder ? "Searching..." : "Find Order"}
                    </button>
                  </div>
                </div>

                {searchError && (
                  <div className="p-3 rounded bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle size={15} className="shrink-0 text-red-400" />
                    <span>{searchError}</span>
                  </div>
                )}

                <div className="p-3 bg-[#181818] border border-[#2b2b2b] rounded-[6px] text-neutral-400 space-y-1">
                  <span className="font-bold text-neutral-300 block">Sales Associate Guide:</span>
                  <p className="text-[11px]">
                    1. Ask the customer for their physical receipt or confirmation email.
                  </p>
                  <p className="text-[11px]">
                    2. Type the order number or customer phone number to pull up verified purchase lines.
                  </p>
                  <p className="text-[11px]">
                    3. Inspect bottle seals: if unopened, stock restocks to store shelves. If opened or damaged, it automatically moves to damaged stock.
                  </p>
                </div>
              </div>
            ) : (
              /* Step 2: Resolution Selection & Inspection */
              <div className="space-y-4 text-xs">
                {/* Order Summary Header */}
                <div className="p-3 bg-[#181818] border border-[#2b2b2b] rounded-[6px] text-[11px] grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-neutral-500 block">Order Number</span>
                    <strong className="text-white font-mono">#{foundOrder.orderNumber}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Customer</span>
                    <strong className="text-white">{foundOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Original Channel</span>
                    <strong className="text-white">{foundOrder.channel}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Purchase Total</span>
                    <strong className="text-white font-mono">{foundOrder.currency} {foundOrder.total.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Payment Method</span>
                    <strong className="text-white">{foundOrder.paymentMethod}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Fulfilled Branch</span>
                    <strong className="text-white">{foundOrder.assignedStore?.name || "Central"}</strong>
                  </div>
                </div>

                {/* Resolution Choice: Refund vs Replacement */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-300 block">
                    Choose Customer Resolution:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setResolutionType("REFUND")}
                      className={`p-3 rounded-[6px] border text-left cursor-pointer transition-all ${
                        resolutionType === "REFUND"
                          ? "bg-red-950/40 border-red-600 text-white shadow-xs"
                          : "bg-[#181818] border-[#2e2e2e] text-neutral-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <Banknote size={16} className={resolutionType === "REFUND" ? "text-red-400" : "text-neutral-500"} />
                        <span>Issue Refund</span>
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Refund customer by cash, original card, or store credit voucher.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setResolutionType("REPLACEMENT")}
                      className={`p-3 rounded-[6px] border text-left cursor-pointer transition-all ${
                        resolutionType === "REPLACEMENT"
                          ? "bg-amber-950/40 border-amber-600 text-white shadow-xs"
                          : "bg-[#181818] border-[#2e2e2e] text-neutral-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <RefreshCw size={16} className={resolutionType === "REPLACEMENT" ? "text-amber-400" : "text-neutral-500"} />
                        <span>Issue Replacement</span>
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Exchange for a fresh unit or alternative bottle from current store stock.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Returnable Items Inspection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-300 block">
                    Inspect Item Condition & Quantity:
                  </label>
                  {selectedItems.map((it, idx) => (
                    <div key={idx} className="p-3 bg-[#181818] border border-[#2e2e2e] rounded-[6px] space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{it.productName}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            (Max returnable: {it.maxQuantity})
                          </span>
                        </div>
                        <span className="font-mono font-bold text-white text-xs">
                          {storeContext.currency} {(it.unitPrice * it.quantity).toFixed(2)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] items-end">
                        {/* Quantity selection */}
                        <div>
                          <label className="text-neutral-500 block mb-1">Return Quantity:</label>
                          <input
                            type="number"
                            min="1"
                            max={it.maxQuantity}
                            value={it.quantity}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(it.maxQuantity, Number(e.target.value) || 1));
                              setSelectedItems((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, quantity: val } : item))
                              );
                            }}
                            className="w-full bg-[#242424] border border-[#383838] rounded px-2.5 py-1.5 text-white font-mono"
                          />
                        </div>

                        {/* Condition selector */}
                        <div>
                          <label className="text-neutral-500 block mb-1">Item Condition:</label>
                          <select
                            value={it.condition}
                            onChange={(e) => {
                              const cond = e.target.value as "UNOPENED" | "DAMAGED" | "DEFECTIVE";
                              setSelectedItems((prev) =>
                                prev.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        condition: cond,
                                        restockToInventory: cond === "UNOPENED",
                                      }
                                    : item
                                )
                              );
                            }}
                            className="w-full bg-[#242424] border border-[#383838] rounded px-2.5 py-1.5 text-white"
                          >
                            <option value="UNOPENED">Unopened & Clean Box (Restock)</option>
                            <option value="DAMAGED">Damaged Flacon / Leaking</option>
                            <option value="DEFECTIVE">Defective Atomizer / Broken</option>
                          </select>
                        </div>

                        {/* Inventory stock routing indication */}
                        <div className="p-1.5 rounded bg-[#141414] border border-[#262626]">
                          <span className="text-[10px] text-neutral-400 block font-semibold">Stock Destination:</span>
                          <span
                            className={`text-[10px] font-bold font-mono ${
                              it.restockToInventory ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {it.restockToInventory ? "✓ Sellable Store Stock (+1)" : "⚠ Damaged Stock Quarantine (+1)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Replacement product selection (Only if REPLACEMENT resolution is active) */}
                {resolutionType === "REPLACEMENT" && (
                  <div className="p-3 bg-[#191919] border border-amber-900/50 rounded-[6px] space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                      <Boxes size={14} />
                      <span>Select Replacement Product from Store Inventory:</span>
                    </div>
                    <select
                      value={selectedReplacementItemKey}
                      onChange={(e) => setSelectedReplacementItemKey(e.target.value)}
                      className="w-full bg-[#242424] border border-[#383838] rounded px-3 py-2 text-white text-xs"
                    >
                      <option value="">
                        Same Product ({selectedItems[0]?.productName || "Original"}) - 1 bottle from stock
                      </option>
                      {storeCatalog.map((catItem) => (
                        <option key={catItem.id} value={catItem.id}>
                          {catItem.displayName} — {storeContext.currency} {catItem.price.toFixed(2)} ({catItem.availableStock} in stock)
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-neutral-400">
                      Dispensing a replacement will immediately deduct 1 unit from sellable store inventory and record a replacement exchange voucher.
                    </p>
                  </div>
                )}

                {/* Refund tender method & Reason */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resolutionType === "REFUND" ? (
                    <div>
                      <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                        Refund Tender Method:
                      </label>
                      <select
                        value={refundMethod}
                        onChange={(e) => setRefundMethod(e.target.value)}
                        className="w-full bg-[#181818] border border-[#333333] rounded px-3 py-1.5 text-white"
                      >
                        <option value="CASH">Cash Refund (Register)</option>
                        <option value="CARD">Original Card / POS Refund</option>
                        <option value="STORE_CREDIT">Store Credit Voucher</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                        Settlement Type:
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Direct In-Store Exchange (No cash refund)"
                        className="w-full bg-[#181818] border border-[#333333] rounded px-3 py-1.5 text-amber-300 text-xs font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                      Reason for Return:
                    </label>
                    <input
                      type="text"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="e.g. Unwanted scent, bottle defective..."
                      className="w-full bg-[#181818] border border-[#333333] rounded px-3 py-1.5 text-white"
                    />
                  </div>
                </div>

                {/* Footer summary & confirm button */}
                <div className="pt-2 border-t border-[#2d2d2d] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs">
                    {resolutionType === "REFUND" ? (
                      <div>
                        <span className="text-neutral-400">Total Refund Due: </span>
                        <strong className="text-red-400 font-mono text-sm">
                          {storeContext.currency} {calculateTotalRefund().toFixed(2)}
                        </strong>
                      </div>
                    ) : (
                      <div>
                        <span className="text-neutral-400">Exchange Value: </span>
                        <strong className="text-amber-300 font-mono text-sm">
                          {storeContext.currency} {calculateTotalRefund().toFixed(2)} (Direct Replacement)
                        </strong>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setFoundOrder(null)}
                      className="py-2 px-4 rounded bg-[#2a2a2a] hover:bg-[#333333] text-xs font-bold text-neutral-300 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessReturn}
                      disabled={processing}
                      className={`flex-1 sm:flex-initial py-2 px-5 rounded text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors ${
                        resolutionType === "REFUND"
                          ? "bg-red-600 hover:bg-red-500 disabled:opacity-50"
                          : "bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
                      }`}
                    >
                      <span>
                        {processing
                          ? "Processing..."
                          : resolutionType === "REFUND"
                          ? "Confirm Refund & Process"
                          : "Dispense Replacement & Finish"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
