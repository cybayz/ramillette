"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  ChevronDown,
  Bell,
  Wifi,
  WifiOff,
  User,
  ExternalLink,
  Search,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";

interface StoreOption {
  id: string;
  code: string;
  name: string;
  regionName: string;
  countryCode: string;
  countryName: string;
  currency: string;
}

interface ErpHeaderProps {
  activeStore: {
    storeId: string;
    storeCode: string;
    storeName: string;
    regionName: string;
    countryCode: string;
    countryName: string;
    currency: string;
  } | null;
  availableStores: StoreOption[];
  userName: string;
  userRole: string;
}

export function ErpHeader({
  activeStore,
  availableStores,
  userName,
  userRole,
}: ErpHeaderProps) {
  const router = useRouter();
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    // Monitor online/offline state
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Fetch pending online orders count periodically
    const fetchPendingOrders = async () => {
      try {
        const res = await fetch("/api/erp/orders?stage=new");
        if (res.ok) {
          const data = await res.json();
          if (data.counts?.newCount !== undefined) {
            setPendingOrdersCount(data.counts.newCount);
          }
        }
      } catch {
        // silent fail
      }
    };

    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 20000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSwitchStore = async (storeId: string) => {
    if (activeStore && activeStore.storeId === storeId) {
      setIsStoreOpen(false);
      return;
    }

    try {
      setIsSwitching(true);
      const res = await fetch("/api/erp/stores/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });

      if (res.ok) {
        setIsStoreOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to switch store:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  const getFlag = (code: string) => {
    if (code === "QA") return "🇶🇦";
    if (code === "AE") return "🇦🇪";
    if (code === "BH") return "🇧🇭";
    return "🌍";
  };

  return (
    <header className="h-16 bg-[#181818] border-b border-[#2a2a2a] text-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-md">
      {/* Left: Active Store Context Switcher */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setIsStoreOpen(!isStoreOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] bg-[#242424] hover:bg-[#2e2e2e] border border-[#383838] transition-all cursor-pointer text-left group"
          >
            <span className="text-base">
              {activeStore ? getFlag(activeStore.countryCode) : "🏪"}
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-white group-hover:text-[#faedcd] transition-colors">
                  {activeStore ? activeStore.storeName : "Select Physical Store"}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#faedcd]/10 text-[#faedcd] rounded border border-[#faedcd]/20">
                  {activeStore?.storeCode}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 block">
                {activeStore ? `${activeStore.countryName} • ${activeStore.regionName} (${activeStore.currency})` : "Configure Store"}
              </span>
            </div>
            <ChevronDown size={14} className="text-neutral-400 ml-1 group-hover:text-white" />
          </button>

          {/* Store Switcher Dropdown */}
          {isStoreOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-[#222222] border border-[#333333] rounded-[8px] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-[#303030] mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#faedcd]">
                  Switch Physical Branch
                </span>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {availableStores.map((s) => {
                  const isCurrent = activeStore?.storeId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSwitchStore(s.id)}
                      disabled={isSwitching}
                      className={`w-full text-left px-3 py-2 rounded-[5px] flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrent
                          ? "bg-[#faedcd]/10 border border-[#faedcd]/30 text-white"
                          : "hover:bg-[#2c2c2c] text-neutral-300 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{getFlag(s.countryCode)}</span>
                        <div>
                          <div className="text-xs font-bold leading-tight">
                            {s.name}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {s.countryName} • {s.regionName} ({s.currency})
                          </div>
                        </div>
                      </div>
                      {isCurrent ? (
                        <CheckCircle2 size={14} className="text-[#faedcd] shrink-0" />
                      ) : (
                        <span className="text-[9px] font-mono text-neutral-400">
                          {s.code}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-[#303030] px-2 flex justify-between items-center text-[10px]">
                <Link
                  href="/erp/setup"
                  onClick={() => setIsStoreOpen(false)}
                  className="text-[#faedcd] hover:underline font-semibold"
                >
                  + Add New Store Location
                </Link>
                <button
                  onClick={() => setIsStoreOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Network Connectivity Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#222222] border border-[#303030] text-[10px] font-semibold">
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400">Live Sync</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-400">Offline Queue</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions, Incoming Orders Alert, and Cashier Profile */}
      <div className="flex items-center gap-3">
        {/* Fast Action: New POS Sale button */}
        <Link
          href="/erp/pos"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-[#faedcd] text-[#1c1c1c] hover:bg-[#ebd59f] font-extrabold text-xs transition-colors cursor-pointer shadow-xs"
        >
          <ShoppingCart size={13} />
          <span>POS Register</span>
          <kbd className="text-[9px] font-mono bg-[#1c1c1c]/15 px-1 py-0.5 rounded ml-1">F2</kbd>
        </Link>

        {/* Incoming Online Orders Notification */}
        <Link
          href="/erp/orders"
          className="relative p-2 rounded-[5px] bg-[#242424] hover:bg-[#2c2c2c] border border-[#333333] text-neutral-300 hover:text-white transition-colors cursor-pointer"
          title="Online Orders Fulfillment Queue"
        >
          <Bell size={16} />
          {pendingOrdersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 animate-pulse shadow-xs">
              {pendingOrdersCount}
            </span>
          )}
        </Link>

        {/* View Public Storefront */}
        <Link
          href="/"
          target="_blank"
          className="p-2 rounded-[5px] bg-[#242424] hover:bg-[#2c2c2c] border border-[#333333] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Open Customer Storefront in New Tab"
        >
          <ExternalLink size={15} />
        </Link>

        {/* Staff Identity & Role */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#303030]">
          <div className="w-7 h-7 rounded-full bg-[#faedcd] text-[#1c1c1c] flex items-center justify-center font-extrabold text-xs">
            {userName.slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden lg:block leading-tight text-right">
            <span className="text-xs font-bold text-white block">
              {userName}
            </span>
            <span className="text-[9px] font-mono font-bold text-[#faedcd] uppercase tracking-wider block">
              {userRole.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
