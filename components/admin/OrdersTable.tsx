"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Search, ChevronDown, Loader2, ExternalLink } from "lucide-react";

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  area?: string | null;
  itemsCount: number;
  createdAt: string;
}

export function OrdersTable({
  initialOrders,
}: {
  initialOrders: AdminOrder[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statuses = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesQuery =
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.customerName.toLowerCase().includes(query.toLowerCase()) ||
      o.customerPhone.includes(query);

    const matchesStatus =
      statusFilter === "ALL" || o.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="bg-white rounded-[8px] border border-[#e5e5e5] shadow-xs p-6 space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order #, client name, or phone..."
            className="w-full text-xs pl-9 pr-3 py-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 font-medium">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#e5e5e5] rounded-[5px] px-3 py-2 text-xs font-semibold text-[#1c1c1c] focus:outline-none focus:border-[#b6713e]"
          >
            <option value="ALL">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e5e5e5] bg-[#fbf9f5] text-neutral-600 font-bold uppercase">
              <th className="py-3 px-3">Order #</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Client</th>
              <th className="py-3 px-3">Area (Qatar)</th>
              <th className="py-3 px-3">Payment</th>
              <th className="py-3 px-3">Total</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ece1]">
            {filtered.map((order) => {
              const isUpdating = updatingId === order.id;

              return (
                <tr key={order.id} className="hover:bg-[#fbf9f5]/50">
                  <td className="py-3 px-3 font-extrabold text-[#1c1c1c]">
                    #{order.orderNumber}
                  </td>
                  <td className="py-3 px-3 text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString("en-QA", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-[#1c1c1c] block">
                      {order.customerName}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {order.customerPhone}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-600 font-medium">
                    {order.area || "Doha"}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold block text-[#1c1c1c]">
                      {order.paymentMethod}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        order.paymentStatus === "PAID"
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-[#1c1c1c]">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3 px-3">
                    <div className="relative inline-block">
                      {isUpdating ? (
                        <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                          <Loader2 size={12} className="animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className={`font-bold text-[11px] uppercase rounded px-2 py-1 border cursor-pointer ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : order.status === "SHIPPED"
                              ? "bg-blue-50 text-blue-800 border-blue-300"
                              : order.status === "CONFIRMED"
                              ? "bg-purple-50 text-purple-800 border-purple-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/checkout/success?orderNumber=${order.orderNumber}`}
                      target="_blank"
                      className="text-xs text-[#b6713e] hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
