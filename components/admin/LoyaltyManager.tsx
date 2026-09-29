"use client";

import React, { useState } from "react";
import {
  Coins,
  Award,
  Globe,
  Save,
  Check,
  AlertCircle,
  Users,
  Search,
  PlusCircle,
  MinusCircle,
  History,
  TrendingUp,
  Percent,
  RefreshCw,
} from "lucide-react";
import { AdminCountry } from "./CountryManager";

interface CustomerLoyaltySummary {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  rewardPoints: number;
  orderCount: number;
}

interface LoyaltyTransactionSummary {
  id: string;
  points: number;
  balanceAfter: number;
  type: string;
  description: string | null;
  country: string;
  createdAt: string;
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
  order?: {
    orderNumber: string;
  } | null;
}

interface LoyaltyManagerProps {
  initialCountries: AdminCountry[];
  customers: CustomerLoyaltySummary[];
  recentTransactions: LoyaltyTransactionSummary[];
}

export function LoyaltyManager({
  initialCountries,
  customers: initialCustomers,
  recentTransactions: initialTransactions,
}: LoyaltyManagerProps) {
  const [countries, setCountries] = useState<AdminCountry[]>(initialCountries);
  const [savingCountry, setSavingCountry] = useState<string | null>(null);
  const [countryMessage, setCountryMessage] = useState<{ code: string; type: "success" | "error"; text: string } | null>(null);

  // Per-country form state
  const [configs, setConfigs] = useState<
    Record<
      string,
      {
        enabled: boolean;
        earnType: "SPEND_RATIO" | "PERCENTAGE" | "FLAT";
        earnValue: number;
        pointValue: number;
        minRedeem: number;
      }
    >
  >(() => {
    const map: any = {};
    for (const c of initialCountries) {
      map[c.code] = {
        enabled: c.loyaltyEnabled !== false,
        earnType: (c.loyaltyEarnType as any) || "SPEND_RATIO",
        earnValue: c.loyaltyEarnValue !== undefined ? Number(c.loyaltyEarnValue) : 100,
        pointValue: c.loyaltyPointValue !== undefined ? Number(c.loyaltyPointValue) : 0.10,
        minRedeem: c.loyaltyMinRedeemPoints !== undefined ? Number(c.loyaltyMinRedeemPoints) : 10,
      };
    }
    return map;
  });

  // Customers & Points Adjustments
  const [customers, setCustomers] = useState(initialCustomers);
  const [customerSearch, setCustomerSearch] = useState("");
  const [adjustModalUser, setAdjustModalUser] = useState<CustomerLoyaltySummary | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState("");

  // Transactions list
  const [transactions, setTransactions] = useState(initialTransactions);

  const handleUpdateConfig = (code: string, patch: Partial<(typeof configs)[string]>) => {
    setConfigs((prev) => ({
      ...prev,
      [code]: { ...prev[code], ...patch },
    }));
  };

  const handleSaveCountryConfig = async (code: string) => {
    setSavingCountry(code);
    setCountryMessage(null);
    try {
      const cfg = configs[code];
      const res = await fetch(`/api/admin/countries/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loyaltyEnabled: cfg.enabled,
          loyaltyEarnType: cfg.earnType,
          loyaltyEarnValue: Number(cfg.earnValue),
          loyaltyPointValue: Number(cfg.pointValue),
          loyaltyMinRedeemPoints: Number(cfg.minRedeem),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update country loyalty settings");

      setCountryMessage({ code, type: "success", text: "Loyalty configuration saved successfully!" });
      setTimeout(() => setCountryMessage(null), 3000);
    } catch (err: any) {
      setCountryMessage({ code, type: "error", text: err.message || "Failed to save settings" });
    } finally {
      setSavingCountry(null);
    }
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser) return;
    setAdjusting(true);
    setAdjustError("");

    try {
      const res = await fetch("/api/admin/loyalty/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: adjustModalUser.id,
          pointsDelta: adjustDelta,
          reason: adjustReason || "Manual Admin Adjustment",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust points");

      // Update local state
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === adjustModalUser.id ? { ...c, rewardPoints: data.rewardPoints } : c
        )
      );

      if (data.transaction) {
        setTransactions((prev) => [
          {
            ...data.transaction,
            createdAt: new Date().toISOString(),
            user: {
              email: adjustModalUser.email,
              firstName: adjustModalUser.firstName,
              lastName: adjustModalUser.lastName,
              phone: adjustModalUser.phone,
            },
          },
          ...prev,
        ]);
      }

      setAdjustModalUser(null);
      setAdjustReason("");
    } catch (err: any) {
      setAdjustError(err.message || "Failed to execute points adjustment");
    } finally {
      setAdjusting(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase();
    return (
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.firstName && c.firstName.toLowerCase().includes(q)) ||
      (c.lastName && c.lastName.toLowerCase().includes(q))
    );
  });

  const totalPointsCirculating = customers.reduce((sum, c) => sum + (c.rewardPoints || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1c1c1c] flex items-center gap-2">
            <Coins className="text-[#b6713e]" size={26} />
            <span>Customer Loyalty & Rewards Program</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure points earning rates and redemption currency values independently for each regional market. Manage customer reward balances and view redemption activity.
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-[8px] border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Points in Circulation
            </span>
            <Coins className="text-[#b6713e]" size={20} />
          </div>
          <p className="text-2xl font-extrabold text-[#1c1c1c] mt-2 font-mono">
            {totalPointsCirculating.toLocaleString()} <span className="text-xs font-normal text-neutral-400">pts</span>
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Across {customers.length} registered customers
          </span>
        </div>

        <div className="bg-white p-5 rounded-[8px] border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Active Regional Programs
            </span>
            <Globe className="text-emerald-600" size={20} />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2 font-mono">
            {Object.values(configs).filter((c) => c.enabled).length} / {countries.length}
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Qatar, UAE & Bahrain ready
          </span>
        </div>

        <div className="bg-white p-5 rounded-[8px] border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Recent Points Transactions
            </span>
            <TrendingUp className="text-indigo-600" size={20} />
          </div>
          <p className="text-2xl font-extrabold text-[#1c1c1c] mt-2 font-mono">
            {transactions.length}
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Orders rewarded & discounts redeemed
          </span>
        </div>
      </div>

      {/* SECTION 1: Country-by-Country Rules Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-bold text-[#1c1c1c] flex items-center gap-2">
              <Globe className="text-[#b6713e]" size={18} />
              <span>Regional Market Configurations</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Set separate earning criteria (e.g. 100 QAR = 1 pt) and point worth (e.g. 10 pts = 1 QAR) for each country.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {countries.map((c) => {
            const cfg = configs[c.code] || {
              enabled: true,
              earnType: "SPEND_RATIO",
              earnValue: 100,
              pointValue: 0.10,
              minRedeem: 10,
            };
            const isSaving = savingCountry === c.code;
            const msg = countryMessage?.code === c.code ? countryMessage : null;

            return (
              <div
                key={c.code}
                className={`bg-white rounded-[8px] border transition-all ${
                  cfg.enabled ? "border-amber-200 shadow-sm" : "border-neutral-200 opacity-80"
                } flex flex-col justify-between`}
              >
                <div>
                  {/* Card Header */}
                  <div className="p-4 bg-[#fbf9f5] border-b border-[#ecdec1]/60 flex items-center justify-between rounded-t-[8px]">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <h3 className="text-sm font-bold text-[#1c1c1c]">
                          {c.name} ({c.code})
                        </h3>
                        <span className="text-xs text-[#b6713e] font-semibold font-mono">
                          Currency: {c.currency}
                        </span>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1 rounded border border-[#ecdec1]">
                      <input
                        type="checkbox"
                        checked={cfg.enabled}
                        onChange={(e) => handleUpdateConfig(c.code, { enabled: e.target.checked })}
                        className="w-4 h-4 text-[#b6713e] rounded focus:ring-[#b6713e]"
                      />
                      <span className="text-[11px] font-bold text-neutral-700">
                        {cfg.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  </div>

                  {/* Settings Form */}
                  <div className="p-5 space-y-5">
                    {/* 1. Points Earning Rule */}
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[6px] space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1c1c1c]">
                        <Award size={14} className="text-[#b6713e]" />
                        <span>Points Earning Rule</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Earning Calculation Type
                        </label>
                        <select
                          value={cfg.earnType}
                          onChange={(e) => handleUpdateConfig(c.code, { earnType: e.target.value as any })}
                          className="w-full text-xs px-3 py-1.5 border border-neutral-300 rounded bg-white font-medium focus:outline-none focus:border-[#b6713e]"
                        >
                          <option value="SPEND_RATIO">Spend Ratio (e.g. 1 point per X {c.currency})</option>
                          <option value="PERCENTAGE">Percentage of Order Subtotal (%)</option>
                          <option value="FLAT">Flat Points per Order</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          {cfg.earnType === "SPEND_RATIO"
                            ? `Spend Amount per 1 Point (${c.currency})`
                            : cfg.earnType === "PERCENTAGE"
                            ? "Percentage of Order Total (%)"
                            : "Flat Points Credited per Order"}
                        </label>
                        <input
                          type="number"
                          step={cfg.earnType === "PERCENTAGE" ? "0.1" : "1"}
                          min="1"
                          value={cfg.earnValue}
                          onChange={(e) =>
                            handleUpdateConfig(c.code, { earnValue: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full text-xs px-3 py-1.5 border border-neutral-300 rounded font-mono font-bold focus:outline-none focus:border-[#b6713e]"
                        />
                      </div>

                      {/* Live preview */}
                      <div className="p-2 bg-white rounded border border-neutral-200 text-[11px] text-neutral-600">
                        💡 A <strong>1,000 {c.currency}</strong> order will grant the customer{" "}
                        <strong className="text-[#b6713e]">
                          {cfg.earnType === "SPEND_RATIO"
                            ? `${Math.floor(1000 / Math.max(1, cfg.earnValue))} points`
                            : cfg.earnType === "PERCENTAGE"
                            ? `${Math.floor((1000 * cfg.earnValue) / 100)} points`
                            : `${cfg.earnValue} points`}
                        </strong>
                        .
                      </div>
                    </div>

                    {/* 2. Redemption Rule */}
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[6px] space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1c1c1c]">
                        <Coins size={14} className="text-[#b6713e]" />
                        <span>Points Redemption Value</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Currency Worth of 1 Point ({c.currency})
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.001"
                          value={cfg.pointValue}
                          onChange={(e) =>
                            handleUpdateConfig(c.code, { pointValue: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full text-xs px-3 py-1.5 border border-neutral-300 rounded font-mono font-bold focus:outline-none focus:border-[#b6713e]"
                        />
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          Set to 0.10 for 10 pts = 1.00 {c.currency} (or 0.05 for 20 pts = 1.00 {c.currency}).
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Minimum Points to Redeem
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={cfg.minRedeem}
                          onChange={(e) =>
                            handleUpdateConfig(c.code, { minRedeem: parseInt(e.target.value, 10) || 1 })
                          }
                          className="w-full text-xs px-3 py-1.5 border border-neutral-300 rounded font-mono font-bold focus:outline-none focus:border-[#b6713e]"
                        />
                      </div>

                      <div className="p-2 bg-white rounded border border-neutral-200 text-[11px] text-neutral-600">
                        🎁 Redeeming <strong>10 points</strong> ={" "}
                        <strong className="text-emerald-700">
                          {(10 * cfg.pointValue).toFixed(c.currencyDecimals || 2)} {c.currency} discount
                        </strong>{" "}
                        after SMS OTP check.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Save Button */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-200 rounded-b-[8px] space-y-2">
                  {msg && (
                    <div
                      className={`p-2 rounded text-xs flex items-center gap-1.5 ${
                        msg.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {msg.type === "success" ? <Check size={13} /> : <AlertCircle size={13} />}
                      <span>{msg.text}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveCountryConfig(c.code)}
                    className="w-full btn-primary h-9 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Saving Rules...</span>
                      </>
                    ) : (
                      <>
                        <Save size={13} />
                        <span>Save {c.name} Rules</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Customer Points Balances */}
      <div className="bg-white rounded-[8px] border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#1c1c1c] flex items-center gap-2">
              <Users className="text-[#b6713e]" size={18} />
              <span>Customer Loyalty Balances ({customers.length})</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              View customer points balances and adjust rewards manually for VIP incentives or customer service.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-neutral-400" size={14} />
            <input
              type="text"
              placeholder="Search by email, phone, or name..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Completed Orders</th>
                <th className="py-3 px-4">Current Points</th>
                <th className="py-3 px-4">Est. QAR Discount Value</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400">
                    No customers found matching your query.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const estValue = (cust.rewardPoints * (configs["QA"]?.pointValue || 0.10)).toFixed(2);
                  return (
                    <tr key={cust.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1c1c1c]">
                          {cust.firstName || cust.lastName
                            ? `${cust.firstName || ""} ${cust.lastName || ""}`.trim()
                            : "Registered Customer"}
                        </div>
                        <div className="text-[11px] text-neutral-500">{cust.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-600">
                        {cust.phone || "—"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-700">
                        {cust.orderCount} order{cust.orderCount !== 1 ? "s" : ""}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold font-mono text-[#b6713e] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Coins size={12} />
                          {cust.rewardPoints} pts
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 font-mono">
                        ≈ QAR {estValue}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustModalUser(cust);
                            setAdjustDelta(10);
                            setAdjustReason("");
                            setAdjustError("");
                          }}
                          className="btn-outline h-7 px-2.5 text-[11px] inline-flex items-center gap-1"
                        >
                          <Coins size={11} />
                          <span>Adjust Points</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Recent Activity Ledger */}
      <div className="bg-white rounded-[8px] border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200">
          <h2 className="text-base font-bold text-[#1c1c1c] flex items-center gap-2">
            <History className="text-[#b6713e]" size={18} />
            <span>Recent Points Activity Log</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Audit history of reward points credited from orders, redeemed at checkout, and admin balance adjustments.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Points Delta</th>
                <th className="py-3 px-4">Balance After</th>
                <th className="py-3 px-4">Description / Reference</th>
                <th className="py-3 px-4">Country</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    No points transactions logged yet. Points earned and redeemed on future orders will appear here.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4 text-neutral-500 text-[11px] whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#1c1c1c]">
                        {t.user.firstName || t.user.email}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">{t.user.phone || t.user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          t.type === "EARNED"
                            ? "bg-emerald-100 text-emerald-800"
                            : t.type === "REDEEMED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={t.points > 0 ? "text-emerald-600" : "text-rose-600"}>
                        {t.points > 0 ? `+${t.points}` : t.points} pts
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-600">
                      {t.balanceAfter} pts
                    </td>
                    <td className="py-3 px-4 text-neutral-600 text-[11px]">
                      {t.description || (t.order ? `Order #${t.order.orderNumber}` : "—")}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-700">
                      {t.country}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Adjust Modal */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] border border-neutral-300 w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-[#b6713e]" />
                <h3 className="text-base font-bold text-[#1c1c1c]">Adjust Reward Points</h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustModalUser(null)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-neutral-50 p-3 rounded border border-neutral-200 text-xs space-y-1">
              <div>
                <span className="font-semibold text-neutral-500">Customer: </span>
                <span className="font-bold text-[#1c1c1c]">
                  {adjustModalUser.firstName || adjustModalUser.email}
                </span>{" "}
                ({adjustModalUser.email})
              </div>
              <div>
                <span className="font-semibold text-neutral-500">Current Balance: </span>
                <span className="font-bold text-[#b6713e] font-mono">
                  {adjustModalUser.rewardPoints} points
                </span>
              </div>
            </div>

            {adjustError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={handleAdjustPoints} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Points Adjustment (positive to add, negative to deduct) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    step="1"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded font-mono font-bold focus:outline-none focus:border-[#b6713e]"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAdjustDelta((prev) => Math.abs(prev))}
                      className="px-2 py-1 text-[11px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    >
                      + Credit
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustDelta((prev) => -Math.abs(prev))}
                      className="px-2 py-1 text-[11px] font-bold rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    >
                      - Debit
                    </button>
                  </div>
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  New balance after update:{" "}
                  <strong className="font-mono text-[#1c1c1c]">
                    {adjustModalUser.rewardPoints + adjustDelta} points
                  </strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Reason for Adjustment *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP goodwill bonus, CS resolution, phone order sync"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setAdjustModalUser(null)}
                  className="btn-outline h-9 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting || adjustDelta === 0}
                  className="btn-primary h-9 px-4 text-xs inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {adjusting ? "Processing..." : "Confirm Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
