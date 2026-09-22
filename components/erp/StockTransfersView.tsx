"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  Truck,
  Plus,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  X,
} from "lucide-react";

interface TransferItem {
  id: string;
  productName: string;
  variantName?: string | null;
  displayName: string;
  sku: string;
  quantityRequested: number;
  quantityShipped: number;
  quantityReceived: number;
}

interface TransferData {
  id: string;
  transferNumber: string;
  sourceStoreName: string;
  sourceStoreCode: string;
  destinationStoreName: string;
  destinationStoreCode: string;
  status: string;
  notes?: string | null;
  isOutbound: boolean;
  isInbound: boolean;
  itemsCount: number;
  dispatchedAt?: string | null;
  receivedAt?: string | null;
  createdAt: string;
  items: TransferItem[];
}

interface StockTransfersViewProps {
  storeContext: {
    storeId: string;
    storeCode: string;
    storeName: string;
    currency: string;
  };
}

export function StockTransfersView({ storeContext }: StockTransfersViewProps) {
  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // New transfer form state
  const [destStoreId, setDestStoreId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [transferQty, setTransferQty] = useState(5);
  const [transferNotes, setTransferNotes] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [transfersRes, storesRes, catalogRes] = await Promise.all([
        fetch("/api/erp/transfers"),
        fetch("/api/erp/stores"),
        fetch("/api/erp/pos/products"),
      ]);

      if (transfersRes.ok) {
        const data = await transfersRes.json();
        setTransfers(data.transfers || []);
      }
      if (storesRes.ok) {
        const data = await storesRes.json();
        setStores((data.stores || []).filter((s: any) => s.id !== storeContext.storeId));
      }
      if (catalogRes.ok) {
        const data = await catalogRes.json();
        setCatalog(data.items || []);
      }
    } catch (err) {
      console.error("Transfers fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [storeContext.storeId]);

  const handleCreateTransfer = async () => {
    if (!destStoreId || !selectedProductId || transferQty <= 0) {
      alert("Please select a destination store, fragrance, and valid quantity.");
      return;
    }

    const item = catalog.find((i) => i.id === selectedProductId);
    if (!item) return;

    try {
      setProcessingId("new");
      const res = await fetch("/api/erp/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationStoreId: destStoreId,
          items: [
            {
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: transferQty,
            },
          ],
          notes: transferNotes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create transfer");

      setIsModalOpen(false);
      setTransferNotes("");
      await loadData();
    } catch (err: any) {
      alert(`Transfer Creation Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDispatch = async (id: string) => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/erp/transfers/${id}/dispatch`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch transfer");
      await loadData();
    } catch (err: any) {
      alert(`Dispatch Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReceive = async (id: string) => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/erp/transfers/${id}/receive`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to receive transfer");
      await loadData();
    } catch (err: any) {
      alert(`Receive Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a2a2a] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={22} className="text-[#faedcd]" />
            <h1 className="text-xl font-black text-white tracking-tight">
              Inter-Branch Stock Transfers
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Safely transfer inventory between physical stores with multi-stage dispatch and receipt
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 bg-[#222222] hover:bg-[#2c2c2c] border border-[#333333] rounded-[6px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-[6px] bg-[#faedcd] hover:bg-[#ebd59f] text-[#1c1c1c] font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus size={15} />
            <span>New Transfer Request</span>
          </button>
        </div>
      </div>

      {/* Transfers List */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 text-xs">
          Loading stock transfers...
        </div>
      ) : transfers.length === 0 ? (
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-12 text-center text-neutral-500 space-y-2">
          <Truck size={36} className="mx-auto text-neutral-600 mb-1" />
          <div className="text-sm font-bold text-neutral-300">No Transfers In Progress</div>
          <p className="text-xs text-neutral-500">
            Create a transfer request to move bottles to or from another store branch.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map((tr) => {
            const isProcessing = processingId === tr.id;
            return (
              <div
                key={tr.id}
                className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-4 space-y-3 shadow-xs"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-white">
                      #{tr.transferNumber}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                        tr.status === "RECEIVED"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : tr.status === "IN_TRANSIT"
                          ? "bg-amber-950 text-amber-300 border border-amber-800 animate-pulse"
                          : "bg-blue-950 text-blue-300 border border-blue-800"
                      }`}
                    >
                      {tr.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-400 font-mono">
                    Created: {new Date(tr.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Route & Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Route */}
                  <div className="p-3 bg-[#181818] border border-[#262626] rounded-[6px] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Transfer Routing:
                    </span>
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span>{tr.sourceStoreName} ({tr.sourceStoreCode})</span>
                      <ArrowRight size={13} className="text-[#faedcd]" />
                      <span>{tr.destinationStoreName} ({tr.destinationStoreCode})</span>
                    </div>
                    {tr.notes && (
                      <div className="text-[11px] text-neutral-400 mt-1">
                        Notes: {tr.notes}
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="p-3 bg-[#181818] border border-[#262626] rounded-[6px] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Transfer Items:
                    </span>
                    <div className="space-y-1">
                      {tr.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-xs">
                          <span className="font-bold text-white">{it.displayName}</span>
                          <span className="font-mono text-neutral-400 font-bold">
                            {it.quantityRequested} units
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end items-center gap-2 pt-1">
                  {/* Outbound Dispatch Action */}
                  {tr.isOutbound && (tr.status === "REQUESTED" || tr.status === "APPROVED") && (
                    <button
                      onClick={() => handleDispatch(tr.id)}
                      disabled={isProcessing}
                      className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Truck size={13} />
                      <span>{isProcessing ? "Dispatching..." : "Dispatch Transfer (Mark In Transit)"}</span>
                    </button>
                  )}

                  {/* Inbound Receive Action */}
                  {tr.isInbound && tr.status === "IN_TRANSIT" && (
                    <button
                      onClick={() => handleReceive(tr.id)}
                      disabled={isProcessing}
                      className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} />
                      <span>{isProcessing ? "Receiving..." : "Confirm Goods Received"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: New Transfer Request */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#202020] border border-[#333333] rounded-[10px] w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-2">
              <h3 className="text-sm font-black text-white">Create Stock Transfer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Destination Store Branch:
                </label>
                <select
                  value={destStoreId}
                  onChange={(e) => setDestStoreId(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333333] rounded-[6px] px-3 py-2 text-white"
                >
                  <option value="">Select Destination Store...</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - {s.countryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Fragrance to Transfer:
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333333] rounded-[6px] px-3 py-2 text-white"
                >
                  <option value="">Select Fragrance...</option>
                  {catalog.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.displayName} (Current Stock: {i.availableStock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Transfer Quantity:
                </label>
                <input
                  type="number"
                  min="1"
                  value={transferQty}
                  onChange={(e) => setTransferQty(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#181818] border border-[#333333] rounded-[6px] px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Reason / Notes (Optional):
                </label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="e.g. Replenishing best-sellers for weekend rush"
                  className="w-full bg-[#181818] border border-[#333333] rounded-[6px] px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#2d2d2d]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-4 rounded bg-[#2a2a2a] text-xs font-bold text-neutral-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTransfer}
                disabled={processingId !== null}
                className="flex-1 py-2 rounded bg-[#faedcd] text-[#1c1c1c] text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Submit Transfer Request</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
