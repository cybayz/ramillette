"use client";

import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  ShieldCheck,
  X,
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
  const [selectedItems, setSelectedItems] = useState<
    Array<{
      productId: string;
      variantId?: string | null;
      productName: string;
      quantity: number;
      unitPrice: number;
      condition: string;
      restockToInventory: boolean;
    }>
  >([]);
  const [returnReason, setReturnReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("CASH");

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

  // Lookup order
  const handleLookupOrder = async () => {
    if (!orderQuery.trim()) return;
    try {
      setSearchingOrder(true);
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setFoundOrder(data);
        // Pre-fill returnable items
        setSelectedItems(
          data.items.map((it: any) => ({
            productId: it.productId,
            variantId: it.variantId || null,
            productName: it.variantName ? `${it.productName} (${it.variantName})` : it.productName,
            quantity: 1,
            unitPrice: Number(it.unitPrice),
            condition: "UNOPENED",
            restockToInventory: true,
          }))
        );
      } else {
        alert("Order / Receipt not found. Please verify the order number.");
      }
    } catch (err) {
      console.error("Lookup error:", err);
    } finally {
      setSearchingOrder(false);
    }
  };

  const handleProcessReturn = async () => {
    if (!foundOrder || selectedItems.length === 0) return;

    try {
      setProcessing(true);
      const res = await fetch("/api/erp/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: foundOrder.orderNumber,
          items: selectedItems,
          reason: returnReason || "Customer return request",
          refundMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process return");

      setIsModalOpen(false);
      setFoundOrder(null);
      setOrderQuery("");
      setReturnReason("");
      await loadReturns();
    } catch (err: any) {
      alert(`Return Processing Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
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
            Process in-store and online customer returns with item condition verification and selective restock
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setFoundOrder(null);
          }}
          className="px-3.5 py-2 rounded-[6px] bg-[#faedcd] hover:bg-[#ebd59f] text-[#1c1c1c] font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          <Plus size={15} />
          <span>Process Return / Exchange</span>
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
            When customers return bottles, verify their receipt here.
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
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    {ret.status}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Orig. Order: <strong className="text-white font-mono">#{ret.orderNumber}</strong> ({ret.channel})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-neutral-400">
                    Refunded: <strong className="font-mono text-red-400">-{storeContext.currency} {ret.refundAmount.toFixed(2)}</strong> ({ret.refundMethod})
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
                  {ret.reason && <div className="text-neutral-400 mt-1">Reason: {ret.reason}</div>}
                </div>

                <div className="p-3 bg-[#181818] border border-[#262626] rounded-[6px] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Returned Items:
                  </span>
                  <div className="space-y-1">
                    {ret.items.map((it) => (
                      <div key={it.id} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">
                          {it.displayName} &times; {it.quantity}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            it.restockToInventory
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                              : "bg-red-950/80 text-red-300 border border-red-800"
                          }`}
                        >
                          {it.restockToInventory ? "RESTOCKED TO INVENTORY" : "DAMAGED QUARANTINE"}
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

      {/* MODAL: Process Return */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#202020] border border-[#333333] rounded-[10px] w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-2">
              <h3 className="text-sm font-black text-white">Process Customer Return</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Step 1: Order Lookup */}
            {!foundOrder ? (
              <div className="space-y-3 text-xs">
                <label className="text-[11px] font-bold text-neutral-400 block">
                  Enter Order Number or Receipt # (e.g. RAM-QA-2609-8472 or POS-DOH-001-...):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    placeholder="Enter order number..."
                    className="w-full bg-[#181818] border border-[#333333] rounded-[6px] px-3 py-2 text-white font-mono"
                  />
                  <button
                    onClick={handleLookupOrder}
                    disabled={searchingOrder || !orderQuery.trim()}
                    className="px-4 py-2 rounded bg-[#faedcd] text-[#1c1c1c] font-black text-xs cursor-pointer disabled:opacity-50"
                  >
                    {searchingOrder ? "Finding..." : "Find"}
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Inspection & Restock Options */
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#181818] border border-[#2b2b2b] rounded-[6px] text-[11px] text-neutral-400 space-y-1">
                  <div>Order: <strong className="text-white font-mono">#{foundOrder.orderNumber}</strong></div>
                  <div>Customer: <strong className="text-white">{foundOrder.customerName}</strong></div>
                  <div>Channel: <strong className="text-white">{foundOrder.channel || "ONLINE"}</strong></div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-400 block">
                    Verify Returned Items & Condition:
                  </label>
                  {selectedItems.map((it, idx) => (
                    <div key={idx} className="p-3 bg-[#181818] border border-[#2e2e2e] rounded-[6px] space-y-2">
                      <div className="flex justify-between font-bold text-white">
                        <span>{it.productName}</span>
                        <span>{storeContext.currency} {it.unitPrice.toFixed(2)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <label className="text-neutral-500 block mb-0.5">Condition:</label>
                          <select
                            value={it.condition}
                            onChange={(e) => {
                              const cond = e.target.value;
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
                            className="w-full bg-[#242424] border border-[#383838] rounded px-2 py-1 text-white"
                          >
                            <option value="UNOPENED">Unopened / Clean Box</option>
                            <option value="DAMAGED">Damaged Flacon / Leaking</option>
                            <option value="DEFECTIVE">Defective Atomizer</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                          <input
                            type="checkbox"
                            id={`restock-${idx}`}
                            checked={it.restockToInventory}
                            onChange={(e) => {
                              setSelectedItems((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, restockToInventory: e.target.checked } : item
                                )
                              );
                            }}
                            className="rounded border-[#383838]"
                          />
                          <label htmlFor={`restock-${idx}`} className="text-neutral-300">
                            Restock to sellable stock
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                      Refund Method:
                    </label>
                    <select
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value)}
                      className="w-full bg-[#181818] border border-[#333333] rounded px-3 py-1.5 text-white"
                    >
                      <option value="CASH">Cash Refund</option>
                      <option value="CARD">Original Card Refund</option>
                      <option value="STORE_CREDIT">Store Credit Voucher</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                      Reason for Return:
                    </label>
                    <input
                      type="text"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="e.g. Unwanted gift"
                      className="w-full bg-[#181818] border border-[#333333] rounded px-3 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-[#2d2d2d]">
                  <button
                    onClick={() => setFoundOrder(null)}
                    className="py-2 px-4 rounded bg-[#2a2a2a] text-xs font-bold text-neutral-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleProcessReturn}
                    disabled={processing}
                    className="flex-1 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Confirm Refund & Process</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
