"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, ShoppingBag, ShoppingCart, RotateCcw, Mail, Phone, MapPin } from "lucide-react";

interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  city: string;
  country: string;
  totalSpent: number;
  ordersCount: number;
  posOrdersCount: number;
  onlineOrdersCount: number;
  recentOrders: Array<{
    orderNumber: string;
    total: number;
    channel: string;
    createdAt: string;
  }>;
}

interface CustomersViewProps {
  storeContext: {
    currency: string;
  };
}

export function CustomersView({ storeContext }: CustomersViewProps) {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCustomers = async (q = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/erp/customers?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Customers fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a2a2a] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users size={22} className="text-[#faedcd]" />
            <h1 className="text-xl font-black text-white tracking-tight">
              Customer Profiles & Cross-Channel History
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Unified view of customer purchases across online website and physical in-store POS
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadCustomers(searchQuery)}
              placeholder="Search by name, phone, email..."
              className="w-full bg-[#1c1c1c] border border-[#333333] rounded-[6px] pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#faedcd]"
            />
          </div>
          <button
            onClick={() => loadCustomers(searchQuery)}
            className="px-3 py-1.5 rounded bg-[#faedcd] text-[#1c1c1c] text-xs font-bold"
          >
            Search
          </button>
        </div>
      </div>

      {/* Customers Cards / Table */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 text-xs">
          Loading customer records...
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-12 text-center text-neutral-500">
          No customer records matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {customers.map((cust) => (
            <div
              key={cust.id}
              className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[8px] p-4 space-y-3 shadow-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm text-white">{cust.name}</div>
                  <div className="flex items-center gap-3 text-neutral-400 text-xs mt-1">
                    {cust.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} /> {cust.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Mail size={12} /> {cust.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-1">
                    <MapPin size={11} /> {cust.city}, {cust.country}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                    Lifetime Spend
                  </span>
                  <span className="font-mono font-black text-sm text-[#faedcd]">
                    {storeContext.currency} {cust.totalSpent.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Channel Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262626] text-xs">
                <div className="bg-[#181818] p-2 rounded flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <ShoppingCart size={13} className="text-[#faedcd]" />
                    <span>In-Store POS:</span>
                  </span>
                  <strong className="text-white font-mono">{cust.posOrdersCount} sales</strong>
                </div>

                <div className="bg-[#181818] p-2 rounded flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <ShoppingBag size={13} className="text-blue-400" />
                    <span>Online Store:</span>
                  </span>
                  <strong className="text-white font-mono">{cust.onlineOrdersCount} orders</strong>
                </div>
              </div>

              {/* Recent Orders Stream */}
              {cust.recentOrders.length > 0 && (
                <div className="pt-2 border-t border-[#262626] text-[11px]">
                  <span className="text-neutral-500 font-bold block mb-1">Recent Activity:</span>
                  <div className="space-y-1">
                    {cust.recentOrders.map((ord, idx) => (
                      <div key={idx} className="flex justify-between text-neutral-400">
                        <span className="font-mono text-neutral-300">
                          #{ord.orderNumber} ({ord.channel})
                        </span>
                        <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
