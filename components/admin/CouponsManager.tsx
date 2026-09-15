"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Plus, Tag, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CouponItem {
  id: string;
  code: string;
  type: string;
  value: number;
  minimumOrder?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  active: boolean;
}

export function CouponsManager({
  initialCoupons,
}: {
  initialCoupons: CouponItem[];
}) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showAddForm, setShowAddForm] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [value, setValue] = useState<number>(10);
  const [minimumOrder, setMinimumOrder] = useState<number>(100);
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          type,
          value,
          minimumOrder,
          usageLimit,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setCoupons([
          {
            id: created.id,
            code: created.code,
            type: created.type,
            value: Number(created.value),
            minimumOrder: created.minimumOrder ? Number(created.minimumOrder) : null,
            usageLimit: created.usageLimit ? Number(created.usageLimit) : null,
            usedCount: 0,
            active: true,
          },
          ...coupons,
        ]);
        setCode("");
        setShowAddForm(false);
        setMessage("Coupon created successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to create coupon:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1c1c1c]">
            Coupons & Discounts
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Create and manage promotional discount codes for Qatar customers.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary h-10 px-4 text-xs font-semibold flex items-center gap-2"
        >
          <Plus size={15} />
          <span>{showAddForm ? "Cancel" : "Create Coupon"}</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[5px] text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>{message}</span>
        </div>
      )}

      {/* Creation Modal/Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="p-6 bg-white rounded-[8px] border border-[#b6713e]/40 shadow-xs space-y-4"
        >
          <h3 className="text-sm font-bold text-[#1c1c1c]">New Promo Code</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Coupon Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SUMMER20"
                className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] uppercase font-bold tracking-wider focus:outline-none focus:border-[#b6713e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Discount Type
              </label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] bg-white font-semibold focus:outline-none focus:border-[#b6713e]"
              >
                <option value="PERCENTAGE">Percentage (%) Off</option>
                <option value="FIXED_AMOUNT">Fixed Amount (QAR) Off</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Discount Value ({type === "PERCENTAGE" ? "%" : "QAR"})
              </label>
              <input
                type="number"
                required
                step="1"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value))}
                className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] font-bold focus:outline-none focus:border-[#b6713e]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Minimum Order (QAR)
              </label>
              <input
                type="number"
                step="1"
                value={minimumOrder}
                onChange={(e) => setMinimumOrder(parseFloat(e.target.value))}
                className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(parseInt(e.target.value, 10))}
                className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="h-10 px-6 text-xs font-semibold"
          >
            Save & Activate Coupon
          </Button>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-[8px] border border-[#e5e5e5] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e5e5e5] bg-[#fbf9f5] text-neutral-600 font-bold uppercase">
              <th className="py-3 px-4">Coupon Code</th>
              <th className="py-3 px-4">Discount</th>
              <th className="py-3 px-4">Min. Order</th>
              <th className="py-3 px-4">Usage Count</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ece1]">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-[#fbf9f5]/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-[#b6713e]" />
                    <span className="font-mono font-bold text-sm text-[#1c1c1c]">
                      {c.code}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 font-extrabold text-[#1c1c1c]">
                  {c.type === "PERCENTAGE" ? `${c.value}% OFF` : `QAR ${c.value} OFF`}
                </td>
                <td className="py-3 px-4 text-neutral-600">
                  {c.minimumOrder ? formatPrice(c.minimumOrder) : "No minimum"}
                </td>
                <td className="py-3 px-4 text-neutral-600 font-medium">
                  {c.usedCount} / {c.usageLimit || "∞"} used
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded ${
                      c.active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
