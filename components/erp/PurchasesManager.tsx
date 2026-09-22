"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  RotateCcw,
  CheckCircle2,
  Boxes,
  Building2,
  Calendar,
  X,
} from "lucide-react";

interface PurchaseItem {
  id: string;
  productName: string;
  variantName?: string | null;
  displayName: string;
  sku: string;
  unitCost: number;
  quantityOrdered: number;
  quantityReceived: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierCompany?: string | null;
  status: string;
  totalAmount: number;
  notes?: string | null;
  orderedAt?: string | null;
  receivedAt?: string | null;
  createdAt: string;
  itemsCount: number;
  items: PurchaseItem[];
}

interface PurchasesManagerProps {
  storeContext: {
    storeId: string;
    storeCode: string;
    storeName: string;
    currency: string;
  };
}

export function PurchasesManager({ storeContext }: PurchasesManagerProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // New PO form state
  const [supplierId, setSupplierId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [orderQty, setOrderQty] = useState(25);
  const [unitCost, setUnitCost] = useState(45);
  const [poNotes, setPoNotes] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [purchasesRes, catalogRes] = await Promise.all([
        fetch("/api/erp/purchases"),
        fetch("/api/erp/pos/products"),
      ]);

      if (purchasesRes.ok) {
        const data = await purchasesRes.json();
        setPurchaseOrders(data.purchaseOrders || []);
        setSuppliers(data.suppliers || []);
      }
      if (catalogRes.ok) {
        const data = await catalogRes.json();
        setCatalog(data.items || []);
      }
    } catch (err) {
      console.error("Purchases fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [storeContext.storeId]);

  const handleCreatePO = async () => {
    if (!supplierId || !selectedProductId || orderQty <= 0) {
      alert("Please choose a supplier, fragrance item, and valid quantity.");
      return;
    }

    const item = catalog.find((i) => i.id === selectedProductId);
    if (!item) return;

    try {
      setProcessingId("new");
      const res = await fetch("/api/erp/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          items: [
            {
              productId: item.productId,
              variantId: item.variantId || null,
              unitCost,
              quantityOrdered: orderQty,
            },
          ],
          notes: poNotes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create purchase order");

      setIsModalOpen(false);
      setPoNotes("");
      await loadData();
    } catch (err: any) {
      alert(`PO Creation Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReceivePO = async (id: string) => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/erp/purchases/${id}/receive`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to receive goods");
      await loadData();
    } catch (err: any) {
      alert(`Goods Receipt Error: ${err.message}`);
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
            <Truck size={22} className="text-[#faedcd]" />
            <h1 className="text-xl font-black text-white tracking-tight">
              Purchasing & Goods Receipt
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage fragrance suppliers, purchase orders, and stock receiving for {storeContext.storeName}
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
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Purchase Orders List */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 text-xs">
          Loading purchase orders...
        </div>
      ) : purchaseOrders.length === 0 ? (
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-12 text-center text-neutral-500 space-y-2">
          <Truck size={36} className="mx-auto text-neutral-600 mb-1" />
          <div className="text-sm font-bold text-neutral-300">No Purchase Orders Found</div>
          <p className="text-xs text-neutral-500">
            Create a PO to order fragrance inventory from verified suppliers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchaseOrders.map((po) => {
            const isProcessing = processingId === po.id;
            const isReceived = po.status === "RECEIVED";
            return (
              <div
                key={po.id}
                className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-4 space-y-3 shadow-xs"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-white">
                      #{po.poNumber}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                        isReceived
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-blue-950 text-blue-300 border border-blue-800 animate-pulse"
                      }`}
                    >
                      {po.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-neutral-400">
                      Total: <strong className="font-mono text-[#faedcd]">{storeContext.currency} {po.totalAmount.toFixed(2)}</strong>
                    </span>
                    <span className="text-neutral-500 text-[11px] font-mono">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Supplier */}
                  <div className="p-3 bg-[#181818] border border-[#262626] rounded-[6px] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                      <Building2 size={12} />
                      <span>Supplier Details:</span>
                    </span>
                    <div className="font-bold text-white">{po.supplierName}</div>
                    {po.supplierCompany && (
                      <div className="text-[11px] text-neutral-400">{po.supplierCompany}</div>
                    )}
                    {po.notes && (
                      <div className="text-[11px] text-neutral-400 mt-1">Note: {po.notes}</div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="p-3 bg-[#181818] border border-[#262626] rounded-[6px] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                      <Boxes size={12} />
                      <span>Ordered Products:</span>
                    </span>
                    <div className="space-y-1">
                      {po.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-xs">
                          <span className="font-bold text-white">{it.displayName}</span>
                          <span className="font-mono text-neutral-400">
                            {it.quantityOrdered} units @ {storeContext.currency} {it.unitCost.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Receive Action */}
                <div className="flex justify-end items-center gap-2 pt-1">
                  {!isReceived ? (
                    <button
                      onClick={() => handleReceivePO(po.id)}
                      disabled={isProcessing}
                      className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} />
                      <span>{isProcessing ? "Processing Intake..." : "Receive Goods (Intake Stock)"}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Fully Received on {po.receivedAt ? new Date(po.receivedAt).toLocaleDateString() : "Record"}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Create Purchase Order */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#202020] border border-[#333333] rounded-[10px] w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-2">
              <h3 className="text-sm font-black text-white">Create Purchase Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Select Supplier:
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333333] rounded-[6px] px-3 py-2 text-white"
                >
                  <option value="">Select Supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.country || "Global"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Product Item:
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                    Units to Order:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={orderQty}
                    onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#181818] border border-[#333333] rounded-[6px] px-3 py-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                    Unit Cost ({storeContext.currency}):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#181818] border border-[#333333] rounded-[6px] px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Purchase Notes (Optional):
                </label>
                <input
                  type="text"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="e.g. Q4 seasonal replenishment"
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
                onClick={handleCreatePO}
                disabled={processingId !== null}
                className="flex-1 py-2 rounded bg-[#faedcd] text-[#1c1c1c] text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Submit Purchase Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
