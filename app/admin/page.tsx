import React from "react";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  Globe,
  TrendingUp,
  Truck,
} from "lucide-react";

export const revalidate = 0; // Real-time admin metrics

export default async function AdminDashboardPage() {
  const [
    totalProducts,
    totalOrders,
    totalUsers,
    ordersRaw,
    lowStockRaw,
    revenueRaw,
    countriesRaw,
  ] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { items: true },
    }),
    // Check low warehouse stock across country records
    prisma.productCountry.findMany({
      where: { active: true, stock: { lte: 30 } },
      take: 6,
      include: { product: true },
      orderBy: { stock: "asc" },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
    }),
    prisma.country.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const totalRevenue = Number(revenueRaw._sum.total || 0);

  // Group orders by country
  const allOrders = await prisma.order.findMany({
    select: { country: true, total: true, currency: true },
  });

  const regionalStats: Record<string, { count: number; revenue: number; currency: string }> = {};
  for (const o of allOrders) {
    const c = o.country || "QA";
    if (!regionalStats[c]) {
      regionalStats[c] = { count: 0, revenue: 0, currency: o.currency || "QAR" };
    }
    regionalStats[c].count += 1;
    regionalStats[c].revenue += Number(o.total);
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1c1c1c]">
            Dashboard Overview
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time multi-country metrics for your independent Ramillette e-commerce platform.
          </p>
        </div>

        <Link
          href="/admin/countries"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[6px] bg-[#faedcd]/60 border border-[#ecdec1] text-[#b6713e] font-semibold text-xs hover:bg-[#faedcd] transition-colors self-start"
        >
          <Globe size={15} />
          <span>Manage Regional Markets ({countriesRaw.length})</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue */}
        <div className="p-5 bg-white rounded-[8px] border border-[#e5e5e5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
              Total Revenue
            </span>
            <span className="text-2xl font-extrabold text-[#1c1c1c] mt-1 block">
              {formatPrice(totalRevenue, "QA")}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              Across all regional stores
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#faedcd] border border-[#ecdec1] flex items-center justify-center text-[#b6713e]">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Orders */}
        <div className="p-5 bg-white rounded-[8px] border border-[#e5e5e5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
              Total Orders
            </span>
            <span className="text-2xl font-extrabold text-[#1c1c1c] mt-1 block">
              {totalOrders}
            </span>
            <span className="text-[11px] text-neutral-400">
              GCC logistics volume
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Products */}
        <div className="p-5 bg-white rounded-[8px] border border-[#e5e5e5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
              Catalog Fragrances
            </span>
            <span className="text-2xl font-extrabold text-[#1c1c1c] mt-1 block">
              {totalProducts}
            </span>
            <span className="text-[11px] text-neutral-400">
              Active in catalog
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Package size={22} />
          </div>
        </div>

        {/* Customers */}
        <div className="p-5 bg-white rounded-[8px] border border-[#e5e5e5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
              Registered Clients
            </span>
            <span className="text-2xl font-extrabold text-[#1c1c1c] mt-1 block">
              {totalUsers}
            </span>
            <span className="text-[11px] text-neutral-400">
              Customer accounts
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Regional Performance Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <Globe size={14} className="text-[#b6713e]" />
            <span>Regional Market Performance</span>
          </h2>
          <Link
            href="/admin/countries"
            className="text-xs font-semibold text-[#b6713e] hover:underline"
          >
            Market settings &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {countriesRaw.map((c) => {
            const stat = regionalStats[c.code] || { count: 0, revenue: 0, currency: c.currency };

            return (
              <div
                key={c.code}
                className="p-4 bg-white rounded-[8px] border border-[#e5e5e5] shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.flag}</span>
                    <span className="font-bold text-xs text-[#1c1c1c]">{c.name}</span>
                  </div>
                  <span className="text-lg font-extrabold text-[#1c1c1c] mt-1.5 block">
                    {formatPrice(stat.revenue, c.code)}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {stat.count} orders • VAT: {Number(c.taxRate)}% • Fee: {c.currency} {Number(c.standardShippingFee)}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      c.active ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {c.active ? "Active" : "Paused"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[8px] border border-[#e5e5e5] shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e5e5e5]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1c1c]">
              Recent Orders Across Markets
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#b6713e] hover:underline inline-flex items-center gap-1"
            >
              <span>Manage all orders</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {ordersRaw.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              No orders placed yet. As customers place orders, they will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#f0ece1] text-neutral-500 font-bold uppercase">
                    <th className="py-2.5">Order #</th>
                    <th className="py-2.5">Market</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Payment</th>
                    <th className="py-2.5">Total</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f5]">
                  {ordersRaw.map((order) => {
                    const countryFlag =
                      countriesRaw.find((c) => c.code === order.country)?.flag || "🌍";

                    return (
                      <tr key={order.id} className="hover:bg-[#fbf9f5]">
                        <td className="py-3 font-mono font-bold text-[#1c1c1c]">
                          {order.orderNumber}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-100 rounded text-[11px] font-semibold">
                            <span>{countryFlag}</span>
                            <span>{order.country}</span>
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="font-semibold block text-[#1c1c1c]">
                            {order.customerName}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {order.customerPhone}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-[11px] font-semibold text-neutral-600 block">
                            {order.paymentMethod}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium">
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 font-extrabold text-[#1c1c1c]">
                          {formatPrice(order.total, order.country)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              order.status === "DELIVERED"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.status === "SHIPPED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Regional Warehouse Low Stock Alert List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-[8px] border border-[#e5e5e5] shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
              <AlertTriangle size={15} />
              <span>Warehouse Stock Alerts</span>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-[#b6713e] hover:underline"
            >
              Inventory
            </Link>
          </div>

          {lowStockRaw.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              All regional warehouse inventory levels are healthy (&gt; 30 bottles).
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockRaw.map((item) => {
                const flag =
                  countriesRaw.find((c) => c.code === item.country)?.flag || "🌍";

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-[6px] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{flag}</span>
                        <span className="font-bold text-[#1c1c1c] line-clamp-1">
                          {item.product.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        {item.country} Warehouse • {formatPrice(item.price, item.country)}
                      </span>
                    </div>
                    <span className="font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200 shrink-0 ml-2">
                      {item.stock} left
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
