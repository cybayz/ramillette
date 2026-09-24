"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Boxes,
  Search,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  History,
  CheckCircle2,
  X,
} from "lucide-react";

interface InventoryItem {
  id: string;
  storeId: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  displayName: string;
  sku: string;
  barcode?: string | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  damagedQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  imageUrl?: string | null;
  categoryName?: string | null;
  updatedAt: string;
}

interface LedgerEntry {
  id: string;
  type: string;
  productName: string;
  variantName?: string | null;
  displayName: string;
  sku: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceType?: string | null;
  referenceId?: string | null;
  performer: string;
  reason?: string | null;
  createdAt: string;
}

interface StoreInventoryManagerProps {
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

export function StoreInventoryManager({ storeContext }: StoreInventoryManagerProps) {
  const [activeTab, setActiveTab] = useState<"inventory" | "ledger">("inventory");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal state
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<string>("STOCK_ADJUSTMENT");
  const [adjustReason, setAdjustReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const url = `/api/erp/inventory?q=${encodeURIComponent(searchQuery)}&lowStock=${lowStockOnly}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setInventoryItems(data.items || []);
      }
    } catch (err) {
      console.error("Inventory fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadLedger = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/erp/inventory/ledger?limit=60");
      if (res.ok) {
        const data = await res.json();
        setLedgerEntries(data.transactions || []);
      }
    } catch (err) {
      console.error("Ledger fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "inventory") {
      loadInventory();
    } else {
      loadLedger();
    }
  }, [activeTab, searchQuery, lowStockOnly, storeContext.storeId]);

  const handleApplyAdjustment = async () => {
    if (!adjustingItem || adjustDelta === 0) return;
    if (!adjustReason.trim()) {
      alert("Please provide a reason for the stock adjustment (e.g. Shelf audit, Damaged during unboxing, etc.).");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/erp/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: adjustingItem.productId,
          variantId: adjustingItem.variantId,
          quantityDelta: adjustDelta,
          type: adjustType,
          reason: adjustReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust stock");

      setAdjustingItem(null);
      setAdjustReason("");
      setAdjustDelta(1);
      await loadInventory();
    } catch (err: any) {
      alert(`Adjustment Failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a2a2a] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes size={22} className="text-[#faedcd]" />
            <h1 className="text-xl font-black text-white tracking-tight">
              Store Inventory & Ledger
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage physical stock, reservations, and audit ledger for {storeContext.storeName}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#181818] border border-[#2b2b2b] rounded-[8px]">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-3.5 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "inventory"
                ? "bg-[#faedcd] text-[#1c1c1c] shadow-xs"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Boxes size={14} />
            <span>Store Stock</span>
          </button>

          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-3.5 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "ledger"
                ? "bg-[#faedcd] text-[#1c1c1c] shadow-xs"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <History size={14} />
            <span>Audit Ledger</span>
          </button>
        </div>
      </div>

      {activeTab === "inventory" ? (
        /* TAB 1: INVENTORY TABLE */
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by perfume name, SKU, or barcode..."
                className="w-full bg-[#242424] border border-[#333333] rounded-[6px] pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#faedcd]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLowStockOnly(!lowStockOnly)}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  lowStockOnly
                    ? "bg-amber-950/80 border-amber-600 text-amber-300"
                    : "bg-[#242424] border-[#333333] text-neutral-400 hover:text-white"
                }`}
              >
                <AlertTriangle size={13} />
                <span>Low Stock Only</span>
              </button>

              <button
                onClick={loadInventory}
                className="p-2 bg-[#242424] hover:bg-[#2c2c2c] border border-[#333333] rounded-[6px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Refresh Inventory"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-neutral-500 text-xs">
                Querying authoritative store stock levels...
              </div>
            ) : inventoryItems.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 text-xs">
                No matching fragrance inventory found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#262626] text-neutral-400 text-[10px] uppercase font-bold bg-[#181818]">
                      <th className="py-3 px-4">Fragrance</th>
                      <th className="py-3 px-4">SKU / Barcode</th>
                      <th className="py-3 px-4 text-center">Physical (Sellable)</th>
                      <th className="py-3 px-4 text-center">Reserved (Online)</th>
                      <th className="py-3 px-4 text-center">Available (POS)</th>
                      <th className="py-3 px-4 text-center">Damaged Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {inventoryItems.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#222222] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded bg-[#242424] overflow-hidden relative shrink-0 flex items-center justify-center">
                              {inv.imageUrl ? (
                                <Image
                                  src={inv.imageUrl}
                                  alt={inv.displayName}
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              ) : (
                                <Sparkles size={16} className="text-neutral-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">
                                {inv.productName}
                              </span>
                              {inv.variantName && (
                                <span className="text-[11px] text-neutral-400 block truncate">
                                  Size: {inv.variantName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">
                          <div>{inv.sku}</div>
                          {inv.barcode && (
                            <div className="text-[10px] text-neutral-500">{inv.barcode}</div>
                          )}
                        </td>

                        {/* Physical Quantity */}
                        <td className="py-3 px-4 text-center font-mono font-bold text-white">
                          {inv.quantity}
                        </td>

                        {/* Reserved Quantity */}
                        <td className="py-3 px-4 text-center font-mono">
                          {inv.reservedQuantity > 0 ? (
                            <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-[11px]">
                              {inv.reservedQuantity} reserved
                            </span>
                          ) : (
                            <span className="text-neutral-500">0</span>
                          )}
                        </td>

                        {/* Available Quantity */}
                        <td className="py-3 px-4 text-center font-mono">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-black ${
                              inv.availableQuantity > 10
                                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                                : inv.availableQuantity > 0
                                ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                                : "bg-red-950/80 text-red-300 border border-red-800"
                            }`}
                          >
                            {inv.availableQuantity} available
                          </span>
                        </td>

                        {/* Damaged Stock Quarantine */}
                        <td className="py-3 px-4 text-center font-mono">
                          {inv.damagedQuantity > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-950/80 text-red-400 border border-red-800">
                              {inv.damagedQuantity} damaged
                            </span>
                          ) : (
                            <span className="text-neutral-600 text-[11px]">-</span>
                          )}
                        </td>

                        {/* Action: Stock Adjustment */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setAdjustingItem(inv);
                              setAdjustDelta(1);
                              setAdjustType("STOCK_ADJUSTMENT");
                            }}
                            className="px-3 py-1 rounded-[5px] bg-[#292929] hover:bg-[#333333] text-neutral-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB 2: INVENTORY LEDGER AUDIT TRAIL */
        <div className="space-y-4">
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#262626] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Immutable Transaction Ledger</h3>
                <p className="text-[11px] text-neutral-400">
                  Every increase, reservation, sale, and transfer is permanently recorded with user attribution
                </p>
              </div>
              <button
                onClick={loadLedger}
                className="px-3 py-1.5 rounded bg-[#242424] hover:bg-[#2c2c2c] text-xs font-bold text-neutral-300"
              >
                Refresh Ledger
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-neutral-500 text-xs">
                Querying ledger transactions...
              </div>
            ) : ledgerEntries.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 text-xs">
                No ledger transactions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#262626] text-neutral-400 text-[10px] uppercase font-bold bg-[#181818]">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Fragrance</th>
                      <th className="py-3 px-4 text-center">Change</th>
                      <th className="py-3 px-4 text-center">Before &rarr; After</th>
                      <th className="py-3 px-4">Reference / Reason</th>
                      <th className="py-3 px-4">Performed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {ledgerEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[#222222] transition-colors">
                        <td className="py-3 px-4 font-mono text-neutral-400 text-[11px] whitespace-nowrap">
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                              entry.type === "SALE" || entry.type === "ONLINE_ORDER"
                                ? "bg-blue-950 text-blue-300 border border-blue-800"
                                : entry.type === "ONLINE_ORDER_RESERVATION"
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : entry.type === "PURCHASE" || entry.type === "RETURN"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : entry.type === "DAMAGE" || entry.type === "LOST"
                                ? "bg-red-950 text-red-300 border border-red-800"
                                : "bg-purple-950 text-purple-300 border border-purple-800"
                            }`}
                          >
                            {entry.type}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">
                            {entry.displayName}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500">
                            {entry.sku}
                          </span>
                        </td>

                        {/* Quantity Delta */}
                        <td className="py-3 px-4 text-center font-mono font-black text-sm">
                          <span className={entry.quantity >= 0 ? "text-emerald-400" : "text-red-400"}>
                            {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity}
                          </span>
                        </td>

                        {/* Previous -> New */}
                        <td className="py-3 px-4 text-center font-mono text-[11px] text-neutral-400">
                          {entry.previousQuantity} &rarr; <strong className="text-white">{entry.newQuantity}</strong>
                        </td>

                        {/* Reason / Reference */}
                        <td className="py-3 px-4 text-neutral-300 max-w-xs">
                          <div>{entry.reason || "Standard operation"}</div>
                          {entry.referenceId && (
                            <span className="text-[10px] font-mono text-neutral-500">
                              Ref: #{entry.referenceId}
                            </span>
                          )}
                        </td>

                        {/* Performer */}
                        <td className="py-3 px-4 text-neutral-400 text-[11px] whitespace-nowrap">
                          {entry.performer}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Stock Adjustment */}
      {adjustingItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#202020] border border-[#383838] rounded-[10px] w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-2">
              <div>
                <span className="text-[10px] font-mono text-[#faedcd] font-bold uppercase tracking-wider">
                  Store Inventory Audit
                </span>
                <h3 className="text-sm font-black text-white">Manual Stock Adjustment</h3>
              </div>
              <button onClick={() => setAdjustingItem(null)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Product Snapshot */}
            <div className="p-3 bg-[#181818] border border-[#2b2b2b] rounded-[6px] space-y-1 text-xs">
              <div className="font-bold text-white">{adjustingItem.displayName}</div>
              <div className="text-neutral-400 font-mono text-[11px]">
                SKU: {adjustingItem.sku} • Current Stock: {adjustingItem.quantity} (Available: {adjustingItem.availableQuantity})
              </div>
            </div>

            {/* Adjustment Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Adjustment Type:
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333333] rounded-[6px] px-3 py-2 text-white"
                >
                  <option value="STOCK_ADJUSTMENT">Stocktaking / Inventory Count Correction</option>
                  <option value="DAMAGE">Damaged / Broken Bottle</option>
                  <option value="LOST">Lost / Missing Stock</option>
                  <option value="PURCHASE">Direct Store Intake</option>
                  <option value="MANUAL_CORRECTION">Manual Correction</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Quantity Adjustment (positive or negative):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdjustDelta((prev) => prev - 1)}
                    className="w-8 h-8 rounded bg-[#2a2a2a] text-white flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#333333] rounded-[6px] px-3 py-1.5 text-center font-mono font-bold text-white text-sm"
                  />
                  <button
                    onClick={() => setAdjustDelta((prev) => prev + 1)}
                    className="w-8 h-8 rounded bg-[#2a2a2a] text-white flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">
                  New physical quantity will become: <strong>{Math.max(0, adjustingItem.quantity + adjustDelta)}</strong>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Mandatory Audit Reason:
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Broken during shelf display rearrangement"
                  className="w-full bg-[#181818] border border-[#333333] rounded-[6px] px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#2d2d2d]">
              <button
                onClick={() => setAdjustingItem(null)}
                className="py-2.5 px-4 rounded bg-[#2a2a2a] text-xs font-bold text-neutral-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAdjustment}
                disabled={isSubmitting || adjustDelta === 0 || !adjustReason.trim()}
                className="flex-1 py-2.5 rounded bg-[#faedcd] text-[#1c1c1c] text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-40"
              >
                <CheckCircle2 size={15} />
                <span>Confirm & Log to Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
