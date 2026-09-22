"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  PackageCheck,
  CreditCard,
  Banknote,
  Printer,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface StoreReportsViewProps {
  storeContext: {
    storeId: string;
    storeCode: string;
    storeName: string;
    regionName: string;
    countryName: string;
    currency: string;
  };
}

export function StoreReportsView({ storeContext }: StoreReportsViewProps) {
  const [range, setRange] = useState("today");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/erp/reports?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [range, storeContext.storeId]);

  const metrics = data?.metrics || {
    totalRevenue: 0,
    posRevenue: 0,
    onlineRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalDiscount: 0,
    totalTax: 0,
    pendingOnlineCount: 0,
    lowStockCount: 0,
  };

  const paymentMethods = data?.paymentMethods || {};
  const topProducts = data?.topProducts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a2a2a] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={22} className="text-[#faedcd]" />
            <h1 className="text-xl font-black text-white tracking-tight">
              Store Analytics & Shift Reports
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Financial breakdown and sales performance for {storeContext.storeName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex rounded-[6px] bg-[#1c1c1c] border border-[#2e2e2e] p-0.5 text-xs font-bold">
            {["today", "week", "month"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-[4px] capitalize transition-colors cursor-pointer ${
                  range === r
                    ? "bg-[#faedcd] text-[#1c1c1c]"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {r === "today" ? "Today" : r === "week" ? "Last 7 Days" : "Last 30 Days"}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-[6px] bg-[#222222] hover:bg-[#2c2c2c] border border-[#333333] text-xs font-semibold text-neutral-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Net Revenue</span>
          <div className="text-2xl font-black text-white font-mono">
            {storeContext.currency} {metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-400">Total settled transactions</div>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">In-Store POS Sales</span>
          <div className="text-2xl font-black text-[#faedcd] font-mono">
            {storeContext.currency} {metrics.posRevenue.toFixed(2)}
          </div>
          <div className="text-[10px] text-neutral-400">Physical cashier checkout</div>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Online Fulfillment</span>
          <div className="text-2xl font-black text-blue-400 font-mono">
            {storeContext.currency} {metrics.onlineRevenue.toFixed(2)}
          </div>
          <div className="text-[10px] text-neutral-400">Shipped regional orders</div>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Orders</span>
          <div className="text-2xl font-black text-white">
            {metrics.totalOrders} <span className="text-xs font-normal text-neutral-500">tickets</span>
          </div>
          <div className="text-[10px] text-neutral-400">Avg ticket: {storeContext.currency} {metrics.averageOrderValue.toFixed(2)}</div>
        </div>
      </div>

      {/* Breakdown: Payments & Top Fragrances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-5 space-y-4">
          <div className="border-b border-[#262626] pb-2">
            <h3 className="text-sm font-bold text-white">Payment Method Distribution</h3>
            <p className="text-[11px] text-neutral-400">Settled funds by tender method</p>
          </div>

          {Object.keys(paymentMethods).length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-xs">
              No payment transactions in this period.
            </div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(paymentMethods).map(([method, amount]: [string, any]) => (
                <div key={method} className="flex justify-between items-center text-xs p-2.5 bg-[#171717] rounded-[6px] border border-[#262626]">
                  <span className="font-bold text-neutral-300">{method}</span>
                  <span className="font-mono font-bold text-white">
                    {storeContext.currency} {Number(amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Fragrances */}
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-5 space-y-4">
          <div className="border-b border-[#262626] pb-2">
            <h3 className="text-sm font-bold text-white">Top Grossing Fragrances</h3>
            <p className="text-[11px] text-neutral-400">Highest gross revenue perfumes in this branch</p>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-xs">
              No sales data recorded for this time range.
            </div>
          ) : (
            <div className="space-y-2.5">
              {topProducts.map((p: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-[#171717] rounded-[6px] border border-[#262626]">
                  <div>
                    <span className="font-bold text-white block">{p.name}</span>
                    <span className="text-[10px] text-neutral-400">{p.quantity} bottles sold</span>
                  </div>
                  <span className="font-mono font-bold text-[#faedcd]">
                    {storeContext.currency} {p.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
