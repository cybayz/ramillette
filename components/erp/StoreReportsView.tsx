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
    totalGrossRevenue: 0,
    totalRevenue: 0,
    posRevenue: 0,
    onlineRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalDiscount: 0,
    totalTax: 0,
    pendingOnlineCount: 0,
    lowStockCount: 0,
    totalReturnsCount: 0,
    totalRefundAmount: 0,
    replacementsCount: 0,
    returnedItemsCount: 0,
    restockedItemsCount: 0,
    damagedReturnsCount: 0,
    totalDamagedInStore: 0,
  };

  const paymentMethods = data?.paymentMethods || {};
  const topProducts = data?.topProducts || [];
  const recentReturns = data?.recentReturns || [];

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
            Financial reconciliation, returns breakdown, and sales performance for {storeContext.storeName}
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Net Settled Revenue</span>
          <div className="text-2xl font-black text-white font-mono">
            {storeContext.currency} {Number(metrics.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-400">
            Gross: {storeContext.currency} {Number(metrics.totalGrossRevenue || metrics.totalRevenue || 0).toFixed(2)}
          </div>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">In-Store POS Sales</span>
          <div className="text-2xl font-black text-[#faedcd] font-mono">
            {storeContext.currency} {Number(metrics.posRevenue || 0).toFixed(2)}
          </div>
          <div className="text-[10px] text-neutral-400">Physical cashier checkout</div>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Online Fulfillment</span>
          <div className="text-2xl font-black text-blue-400 font-mono">
            {storeContext.currency} {Number(metrics.onlineRevenue || 0).toFixed(2)}
          </div>
          <div className="text-[10px] text-neutral-400">Shipped regional orders</div>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Orders</span>
          <div className="text-2xl font-black text-white">
            {metrics.totalOrders} <span className="text-xs font-normal text-neutral-500">tickets</span>
          </div>
          <div className="text-[10px] text-neutral-400">Avg ticket: {storeContext.currency} {Number(metrics.averageOrderValue || 0).toFixed(2)}</div>
        </div>
      </div>

      {/* Returns & Inventory Health Breakdown Banner */}
      <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#262626] pb-2">
          <div className="flex items-center gap-2">
            <RotateCcw size={16} className="text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Returns, Refunds & Damaged Stock Report
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">
            Reporting Period: {range === "today" ? "Today" : range === "week" ? "Last 7 Days" : "Last 30 Days"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          <div className="p-3 bg-[#171717] rounded-[6px] border border-[#262626] space-y-0.5">
            <span className="text-[10px] text-neutral-400 font-semibold block">Total Returns</span>
            <div className="text-lg font-black text-white font-mono">{metrics.totalReturnsCount || 0}</div>
            <span className="text-[9px] text-neutral-500 block">claims accepted</span>
          </div>

          <div className="p-3 bg-[#171717] rounded-[6px] border border-[#262626] space-y-0.5">
            <span className="text-[10px] text-neutral-400 font-semibold block">Refunds Issued</span>
            <div className="text-lg font-black text-red-400 font-mono">
              -{storeContext.currency} {Number(metrics.totalRefundAmount || 0).toFixed(2)}
            </div>
            <span className="text-[9px] text-neutral-500 block">deducted from revenue</span>
          </div>

          <div className="p-3 bg-[#171717] rounded-[6px] border border-[#262626] space-y-0.5">
            <span className="text-[10px] text-neutral-400 font-semibold block">Replacements</span>
            <div className="text-lg font-black text-amber-300 font-mono">{metrics.replacementsCount || 0}</div>
            <span className="text-[9px] text-neutral-500 block">exchanged in store</span>
          </div>

          <div className="p-3 bg-[#171717] rounded-[6px] border border-[#262626] space-y-0.5">
            <span className="text-[10px] text-neutral-400 font-semibold block">Restocked to Sellable</span>
            <div className="text-lg font-black text-emerald-400 font-mono">+{metrics.restockedItemsCount || 0}</div>
            <span className="text-[9px] text-neutral-500 block">clean / unopened bottles</span>
          </div>

          <div className="p-3 bg-[#171717] rounded-[6px] border border-[#262626] space-y-0.5">
            <span className="text-[10px] text-neutral-400 font-semibold block">Damaged Returns</span>
            <div className="text-lg font-black text-red-400 font-mono">{metrics.damagedReturnsCount || 0}</div>
            <span className="text-[9px] text-neutral-500 block">quarantined period</span>
          </div>

          <div className="p-3 bg-[#171717] rounded-[6px] border border-[#262626] space-y-0.5">
            <span className="text-[10px] text-neutral-400 font-semibold block">Total Damaged Stock</span>
            <div className="text-lg font-black text-orange-400 font-mono">{metrics.totalDamagedInStore || 0}</div>
            <span className="text-[9px] text-neutral-500 block">cumulative on hand</span>
          </div>
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

      {/* Recent Returns In This Period Table */}
      {recentReturns.length > 0 && (
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#262626] pb-2">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Return Claims in Period</h3>
              <p className="text-[11px] text-neutral-400">Audit list of returns processed for this time window</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#262626] text-neutral-400 text-[10px] uppercase font-bold bg-[#181818]">
                  <th className="py-2.5 px-3">Return #</th>
                  <th className="py-2.5 px-3">Orig Order</th>
                  <th className="py-2.5 px-3">Resolution</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {recentReturns.map((r: any) => (
                  <tr key={r.id} className="hover:bg-[#222222] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">#{r.returnNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-neutral-400">#{r.orderNumber} ({r.channel})</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#262626] text-neutral-300 border border-[#333333]">
                        {r.refundMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-red-400">
                      {r.refundAmount > 0 ? `-${storeContext.currency} ${r.refundAmount.toFixed(2)}` : "Replacement (0.00)"}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300 max-w-xs truncate">{r.reason || "Customer return"}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[11px] text-neutral-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
