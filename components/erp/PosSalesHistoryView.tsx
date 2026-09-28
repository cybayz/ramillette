"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Printer,
  FileText,
  Clock,
  User,
  CreditCard,
  Banknote,
  RotateCcw,
  Sparkles,
  Receipt,
  X,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { ErpInvoiceTemplate, ErpInvoiceData } from "@/components/erp/ErpInvoiceTemplate";

interface PosSalesHistoryViewProps {
  initialPeriod?: "today" | "all";
  onClose?: () => void;
  isModal?: boolean;
}

export function PosSalesHistoryView({
  initialPeriod = "today",
  onClose,
  isModal = false,
}: PosSalesHistoryViewProps) {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState<"today" | "all">(initialPeriod);
  const [summary, setSummary] = useState<{ todayCount: number; todayTotal: number; currency: string } | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<ErpInvoiceData | null>(null);

  const fetchSales = async (q = searchQuery, p = period) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/erp/pos/sales?q=${encodeURIComponent(q)}&period=${p}`);
      if (res.ok) {
        const data = await res.json();
        setSales(data.sales || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error("Failed to load POS sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(searchQuery, period);
  }, [period]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSales(searchQuery, period);
  };

  const handlePrintSale = (receiptData: ErpInvoiceData) => {
    setActiveReceipt(receiptData);
    setTimeout(() => {
      document.body.classList.add("printing-erp-invoice");
      window.print();
      setTimeout(() => {
        document.body.classList.remove("printing-erp-invoice");
      }, 1000);
    }, 150);
  };

  return (
    <div className={`space-y-4 ${isModal ? "p-1" : "p-6 max-w-6xl mx-auto"}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2b2b2b] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt size={20} className="text-[#faedcd]" />
            <h2 className="text-base sm:text-lg font-black text-white">
              POS Order History & Invoices
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            View completed in-store sales, inspect line items, and reprint official customer invoices.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-end sm:self-auto p-1.5 rounded bg-[#242424] hover:bg-[#333333] text-neutral-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Summary KPI Bar */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-[8px] bg-[#1a1a1a] border border-[#2e2e2e]">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold block">
              Today&apos;s Store Sales
            </span>
            <div className="text-lg font-black text-white mt-0.5">
              {summary.todayCount} <span className="text-xs text-neutral-400 font-normal">transactions</span>
            </div>
          </div>

          <div className="p-3 rounded-[8px] bg-[#1a1a1a] border border-[#2e2e2e]">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold block">
              Today&apos;s POS Revenue
            </span>
            <div className="text-lg font-black text-[#faedcd] font-mono mt-0.5">
              {summary.currency} {summary.todayTotal.toFixed(2)}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-[8px] bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold block">
                Active Filter
              </span>
              <span className="text-xs font-bold text-white capitalize mt-0.5 block">
                {period === "today" ? "Today's Register Shift" : "All Past Transactions"}
              </span>
            </div>
            <button
              onClick={() => fetchSales(searchQuery, period)}
              className="p-2 rounded bg-[#252525] hover:bg-[#333333] text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh Sales"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Invoice # (e.g. RP-2026), customer, or phone..."
            className="w-full bg-[#181818] border border-[#2d2d2d] focus:border-[#faedcd] rounded-[6px] pl-10 pr-20 py-2 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#282828] hover:bg-[#333333] text-neutral-300 text-[11px] font-bold rounded cursor-pointer"
          >
            Find
          </button>
        </form>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPeriod("today")}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
              period === "today"
                ? "bg-[#faedcd] text-[#1c1c1c] shadow-xs"
                : "bg-[#202020] text-neutral-400 hover:text-white border border-[#2e2e2e]"
            }`}
          >
            Today&apos;s Shift
          </button>
          <button
            type="button"
            onClick={() => setPeriod("all")}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
              period === "all"
                ? "bg-[#faedcd] text-[#1c1c1c] shadow-xs"
                : "bg-[#202020] text-neutral-400 hover:text-white border border-[#2e2e2e]"
            }`}
          >
            All Sales
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
        {loading ? (
          <div className="py-12 text-center text-xs text-neutral-500">
            Loading store order history...
          </div>
        ) : sales.length === 0 ? (
          <div className="py-12 text-center bg-[#181818] border border-[#282828] rounded-[8px] p-6 space-y-2">
            <Receipt size={32} className="mx-auto text-neutral-600" />
            <div className="text-sm font-bold text-neutral-300">No POS Sales Found</div>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery
                ? `No transactions matched "${searchQuery}". Check the invoice number or customer phone.`
                : "No sales recorded for this store register yet."}
            </p>
          </div>
        ) : (
          sales.map((sale) => {
            const dateStr = new Date(sale.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const timeStr = new Date(sale.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={sale.id}
                className="bg-[#181818] hover:bg-[#1e1e1e] border border-[#282828] hover:border-[#383838] rounded-[8px] p-3.5 transition-all space-y-3"
              >
                {/* Row Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252525] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-[#faedcd] bg-[#222222] px-2 py-0.5 rounded border border-[#333333]">
                      #{sale.orderNumber}
                    </span>
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <Clock size={12} />
                      <span>
                        {dateStr} at {timeStr}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                      Paid • {sale.paymentMethod || "CARD"}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-white">
                      {sale.currency} {sale.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Customer & Items Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                      <User size={13} className="text-neutral-500" />
                      <span>{sale.customerName || "Walk-in Customer"}</span>
                      {sale.customerPhone && (
                        <span className="text-neutral-500 font-mono text-[11px]">
                          ({sale.customerPhone})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate max-w-md">
                      {sale.itemCount} bottle(s):{" "}
                      {sale.items.map((it: any) => `${it.name} (${it.quantity})`).join(", ")}
                    </div>
                  </div>

                  {/* Actions: View Invoice & Print */}
                  <div className="flex items-center gap-2 pt-1 sm:pt-0">
                    <button
                      onClick={() => setActiveReceipt(sale.receiptData)}
                      className="px-3 py-1.5 rounded-[5px] bg-[#252525] hover:bg-[#303030] text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#333333]"
                      title="View Invoice Template"
                    >
                      <FileText size={13} />
                      <span>View Invoice</span>
                    </button>

                    <button
                      onClick={() => handlePrintSale(sale.receiptData)}
                      className="px-3.5 py-1.5 rounded-[5px] bg-[#faedcd] hover:bg-[#ebd59f] text-[#1c1c1c] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Print Customer Thermal Invoice"
                    >
                      <Printer size={13} />
                      <span>Print Invoice</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* POPUP MODAL: View Invoice Preview */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] border border-[#333333] rounded-[12px] w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#2e2e2e] pb-3 print:hidden">
              <div className="flex items-center gap-1.5 text-[#faedcd] font-bold text-xs">
                <Receipt size={16} />
                <span>Invoice #{activeReceipt.invoiceNumber || activeReceipt.orderNumber}</span>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-sm hover:bg-neutral-800 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Receipt Canvas */}
            <div className="overflow-x-auto flex justify-center py-1">
              <ErpInvoiceTemplate receipt={activeReceipt} />
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2 border-t border-[#2e2e2e] print:hidden">
              <button
                onClick={() => {
                  document.body.classList.add("printing-erp-invoice");
                  window.print();
                  setTimeout(() => {
                    document.body.classList.remove("printing-erp-invoice");
                  }, 1000);
                }}
                className="flex-1 py-2.5 rounded bg-[#faedcd] hover:bg-[#ebd59f] text-[#1c1c1c] font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <Printer size={15} />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="py-2.5 px-4 rounded bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 text-xs font-bold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
