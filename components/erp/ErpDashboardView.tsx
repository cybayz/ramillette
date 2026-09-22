"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  PackageCheck,
  AlertTriangle,
  Boxes,
  ArrowUpRight,
  Clock,
  ArrowRight,
  PlusCircle,
  Truck,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

interface ErpDashboardViewProps {
  initialStore: {
    storeId: string;
    storeCode: string;
    storeName: string;
    regionName: string;
    countryCode: string;
    countryName: string;
    currency: string;
  };
  userName: string;
  userRole: string;
}

export function ErpDashboardView({
  initialStore,
  userName,
  userRole,
}: ErpDashboardViewProps) {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/erp/reports?range=today");
        if (res.ok) {
          const data = await res.json();
          setReportData(data);
        }
      } catch (err) {
        console.error("Dashboard reports fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [initialStore.storeId]);

  const metrics = reportData?.metrics || {
    totalRevenue: 0,
    posRevenue: 0,
    onlineRevenue: 0,
    totalOrders: 0,
    pendingOnlineCount: 0,
    lowStockCount: 0,
    totalProductsCount: 0,
  };

  const recentOrders = reportData?.recentOrders || [];
  const topProducts = reportData?.topProducts || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#202020] via-[#242424] to-[#1c1c1c] border border-[#333333] rounded-[10px] p-5 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-[#faedcd] uppercase tracking-wider">
              {initialStore.countryName} • {initialStore.regionName}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#faedcd]/15 text-[#faedcd] border border-[#faedcd]/30 font-bold">
              {initialStore.storeCode}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            {initialStore.storeName}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Logged in as <strong className="text-white">{userName}</strong> ({userRole.replace("_", " ")}) • Central database live synchronization active.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/erp/pos"
            className="px-4 py-2 rounded-[6px] bg-[#faedcd] hover:bg-[#ebd59f] text-[#1c1c1c] font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <ShoppingCart size={15} />
            <span>Launch POS Register</span>
            <span className="text-[10px] font-mono px-1 py-0.2 bg-[#1c1c1c]/15 rounded">F2</span>
          </Link>

          <Link
            href="/erp/orders"
            className="px-4 py-2 rounded-[6px] bg-[#2d2d2d] hover:bg-[#383838] text-white border border-[#444444] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <PackageCheck size={15} className="text-[#faedcd]" />
            <span>Online Orders ({metrics.pendingOnlineCount})</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
        {/* Today's Gross Revenue */}
        <div className="bg-[#1c1c1c] border border-[#2c2c2c] rounded-[8px] p-4 shadow-sm hover:border-[#3d3d3d] transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today&apos;s Revenue</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            {initialStore.currency} {metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1 flex items-center justify-between">
            <span>POS: {initialStore.currency} {metrics.posRevenue.toFixed(2)}</span>
            <span>Online: {initialStore.currency} {metrics.onlineRevenue.toFixed(2)}</span>
          </div>
        </div>

        {/* Total Orders Completed */}
        <div className="bg-[#1c1c1c] border border-[#2c2c2c] rounded-[8px] p-4 shadow-sm hover:border-[#3d3d3d] transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sales Count</span>
            <ShoppingCart size={16} className="text-[#faedcd]" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            {metrics.totalOrders} <span className="text-xs font-normal text-neutral-400">transactions</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            Avg Ticket: {initialStore.currency} {metrics.averageOrderValue ? metrics.averageOrderValue.toFixed(2) : "0.00"}
          </div>
        </div>

        {/* Pending Online Orders */}
        <Link
          href="/erp/orders"
          className="bg-[#1c1c1c] border border-[#2c2c2c] rounded-[8px] p-4 shadow-sm hover:border-[#faedcd]/40 transition-all block group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-[#faedcd] transition-colors">
              Online Fulfillment
            </span>
            <PackageCheck size={16} className="text-[#faedcd]" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <span>{metrics.pendingOnlineCount}</span>
            {metrics.pendingOnlineCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800 animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1 group-hover:text-white">
            <span>Awaiting store pick & pack</span>
            <ArrowRight size={11} />
          </div>
        </Link>

        {/* Low Stock Warning */}
        <Link
          href="/erp/inventory?lowStock=true"
          className="bg-[#1c1c1c] border border-[#2c2c2c] rounded-[8px] p-4 shadow-sm hover:border-amber-500/40 transition-all block group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-300 transition-colors">
              Low Stock Alert
            </span>
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            {metrics.lowStockCount} <span className="text-xs font-normal text-neutral-400">skus</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1 group-hover:text-white">
            <span>Stock below threshold (&le; 10)</span>
            <ArrowRight size={11} />
          </div>
        </Link>
      </div>

      {/* Fast Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/erp/pos"
          className="p-3.5 rounded-[8px] bg-[#202020] border border-[#2e2e2e] hover:border-[#faedcd] hover:bg-[#252525] transition-all flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-[#faedcd]/10 text-[#faedcd] flex items-center justify-center shrink-0 group-hover:bg-[#faedcd] group-hover:text-[#1c1c1c] transition-colors">
            <ShoppingCart size={17} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">POS Register</span>
            <span className="text-[10px] text-neutral-400">Scan & Sell in Store</span>
          </div>
        </Link>

        <Link
          href="/erp/orders"
          className="p-3.5 rounded-[8px] bg-[#202020] border border-[#2e2e2e] hover:border-[#faedcd] hover:bg-[#252525] transition-all flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <PackageCheck size={17} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Fulfillment Queue</span>
            <span className="text-[10px] text-neutral-400">Pick, Pack & Ship</span>
          </div>
        </Link>

        <Link
          href="/erp/transfers"
          className="p-3.5 rounded-[8px] bg-[#202020] border border-[#2e2e2e] hover:border-[#faedcd] hover:bg-[#252525] transition-all flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <Truck size={17} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Stock Transfers</span>
            <span className="text-[10px] text-neutral-400">Inter-branch routing</span>
          </div>
        </Link>

        <Link
          href="/erp/inventory"
          className="p-3.5 rounded-[8px] bg-[#202020] border border-[#2e2e2e] hover:border-[#faedcd] hover:bg-[#252525] transition-all flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <Boxes size={17} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Stock & Ledger</span>
            <span className="text-[10px] text-neutral-400">Real-time audit log</span>
          </div>
        </Link>
      </div>

      {/* Main Two-Column Section: Recent Transactions & Top Fragrances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent Transactions */}
        <div className="lg:col-span-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
            <div>
              <h2 className="text-sm font-bold text-white">Recent Store Transactions</h2>
              <p className="text-[11px] text-neutral-400">Latest online order assignments and in-store POS receipts</p>
            </div>
            <Link
              href="/erp/orders"
              className="text-xs font-bold text-[#faedcd] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-xs">
              No transactions recorded today yet. Launch the POS register to start selling.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#262626] text-neutral-400 text-[10px] uppercase font-bold">
                    <th className="pb-2.5">Order / Receipt</th>
                    <th className="pb-2.5">Channel</th>
                    <th className="pb-2.5">Customer</th>
                    <th className="pb-2.5">Total</th>
                    <th className="pb-2.5">Payment</th>
                    <th className="pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {recentOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-[#242424] transition-colors">
                      <td className="py-3 font-mono font-bold text-white">
                        #{ord.orderNumber}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            ord.channel === "POS"
                              ? "bg-amber-950/60 text-[#faedcd] border border-amber-800"
                              : "bg-blue-950/60 text-blue-300 border border-blue-800"
                          }`}
                        >
                          {ord.channel}
                        </span>
                      </td>
                      <td className="py-3 text-neutral-300">
                        {ord.customerName}
                      </td>
                      <td className="py-3 font-bold text-white">
                        {initialStore.currency} {ord.total.toFixed(2)}
                      </td>
                      <td className="py-3 text-neutral-400 text-[11px]">
                        {ord.paymentMethod}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ord.status === "DELIVERED" || ord.status === "SHIPPED"
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                              : "bg-amber-950/80 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column (1 col): Top Selling Fragrances & Branch Info */}
        <div className="space-y-6">
          {/* Top Products */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-5 shadow-sm">
            <div className="mb-4 pb-3 border-b border-[#2a2a2a]">
              <h2 className="text-sm font-bold text-white">Top Performing Fragrances</h2>
              <p className="text-[11px] text-neutral-400">Highest grossing bottles today</p>
            </div>

            {topProducts.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 text-xs">
                No bottle sales recorded today yet.
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-white truncate">{p.name}</div>
                      <div className="text-[10px] text-neutral-400">{p.quantity} bottles sold</div>
                    </div>
                    <div className="font-mono font-bold text-[#faedcd] shrink-0">
                      {initialStore.currency} {p.revenue.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location Details Card */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-5 shadow-sm text-xs space-y-3">
            <div className="border-b border-[#2a2a2a] pb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#faedcd] block">
                Branch Location Info
              </span>
              <span className="font-bold text-white text-sm">{initialStore.storeName}</span>
            </div>

            <div className="space-y-1.5 text-neutral-400 text-[11px]">
              <div className="flex justify-between">
                <span>Store Code:</span>
                <strong className="text-white font-mono">{initialStore.storeCode}</strong>
              </div>
              <div className="flex justify-between">
                <span>Region:</span>
                <strong className="text-white">{initialStore.regionName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Country:</span>
                <strong className="text-white">{initialStore.countryName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Currency:</span>
                <strong className="text-white">{initialStore.currency}</strong>
              </div>
              <div className="flex justify-between">
                <span>Stock Mode:</span>
                <strong className="text-emerald-400 font-bold">Authoritative DB</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
