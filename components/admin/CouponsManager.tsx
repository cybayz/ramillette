"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import {
  Plus,
  Tag,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Lock,
  Sparkles,
  Edit3,
  Search,
  X,
  Check,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface CouponItem {
  id: string;
  code: string;
  type: string;
  value: number;
  minimumOrder?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  isPublic: boolean;
  description: string;
  active: boolean;
}

export function CouponsManager({
  initialCoupons,
}: {
  initialCoupons: CouponItem[];
}) {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [filterTab, setFilterTab] = useState<"ALL" | "PUBLIC" | "SECRET">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // New Coupon Form State
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [value, setValue] = useState<number>(10);
  const [minimumOrder, setMinimumOrder] = useState<number>(100);
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Coupon Form State
  const [editCode, setEditCode] = useState("");
  const [editType, setEditType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [editValue, setEditValue] = useState<number>(10);
  const [editMinimumOrder, setEditMinimumOrder] = useState<number | "">("");
  const [editUsageLimit, setEditUsageLimit] = useState<number | "">("");
  const [editIsPublic, setEditIsPublic] = useState<boolean>(true);
  const [editDescription, setEditDescription] = useState<string>("");
  const [editActive, setEditActive] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Notifications
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Toggle Visibility directly from table
  const handleToggleVisibility = async (coupon: CouponItem) => {
    const nextPublicState = !coupon.isPublic;

    // Optimistic UI update
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === coupon.id ? { ...c, isPublic: nextPublicState } : c
      )
    );

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, isPublic: nextPublicState }),
      });

      if (!res.ok) {
        // Revert if error
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupon.id ? { ...c, isPublic: coupon.isPublic } : c
          )
        );
        throw new Error("Failed to toggle coupon visibility.");
      }

      setMessage(
        nextPublicState
          ? `✨ "${coupon.code}" is now PUBLIC — customers can see and apply it at checkout!`
          : `🔒 "${coupon.code}" is now HIDDEN — customers must manually enter this secret promo code.`
      );
      setTimeout(() => setMessage(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to update visibility.");
      setTimeout(() => setError(""), 4000);
    }
  };

  // Toggle Active/Disabled directly from table
  const handleToggleActive = async (coupon: CouponItem) => {
    const nextActiveState = !coupon.active;

    setCoupons((prev) =>
      prev.map((c) =>
        c.id === coupon.id ? { ...c, active: nextActiveState } : c
      )
    );

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, active: nextActiveState }),
      });

      if (!res.ok) {
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupon.id ? { ...c, active: coupon.active } : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle coupon active:", err);
    }
  };

  // Create Coupon
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          type,
          value,
          minimumOrder,
          usageLimit,
          isPublic,
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create coupon");
      }

      setCoupons([
        {
          id: data.id,
          code: data.code,
          type: data.type,
          value: Number(data.value),
          minimumOrder: data.minimumOrder ? Number(data.minimumOrder) : null,
          usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
          usedCount: 0,
          isPublic: data.isPublic,
          description: data.description || "",
          active: true,
        },
        ...coupons,
      ]);

      setCode("");
      setDescription("");
      setShowAddForm(false);
      setMessage(
        isPublic
          ? `Coupon ${data.code} created as a PUBLIC offer.`
          : `Coupon ${data.code} created as a SECRET hidden promo.`
      );
      setTimeout(() => setMessage(""), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to create coupon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (c: CouponItem) => {
    setEditingCoupon(c);
    setEditCode(c.code);
    setEditType(c.type === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE");
    setEditValue(c.value);
    setEditMinimumOrder(c.minimumOrder ?? "");
    setEditUsageLimit(c.usageLimit ?? "");
    setEditIsPublic(c.isPublic);
    setEditDescription(c.description || "");
    setEditActive(c.active);
  };

  // Save Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !editCode.trim()) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCoupon.id,
          code: editCode.trim().toUpperCase(),
          type: editType,
          value: Number(editValue),
          minimumOrder: editMinimumOrder === "" ? null : Number(editMinimumOrder),
          usageLimit: editUsageLimit === "" ? null : Number(editUsageLimit),
          isPublic: editIsPublic,
          description: editDescription.trim(),
          active: editActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update coupon.");

      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? {
                ...c,
                code: editCode.trim().toUpperCase(),
                type: editType,
                value: Number(editValue),
                minimumOrder: editMinimumOrder === "" ? null : Number(editMinimumOrder),
                usageLimit: editUsageLimit === "" ? null : Number(editUsageLimit),
                isPublic: editIsPublic,
                description: editDescription.trim(),
                active: editActive,
              }
            : c
        )
      );

      setEditingCoupon(null);
      setMessage(`Coupon "${editCode}" updated successfully!`);
      setTimeout(() => setMessage(""), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to update coupon.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Coupon
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this coupon?")) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete coupon:", err);
    }
  };

  // Filtered List
  const filteredCoupons = coupons.filter((c) => {
    // Filter tab
    if (filterTab === "PUBLIC" && !c.isPublic) return false;
    if (filterTab === "SECRET" && c.isPublic) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const publicCount = coupons.filter((c) => c.isPublic).length;
  const secretCount = coupons.filter((c) => !c.isPublic).length;

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1c1c1c]">
            Coupons & Promo Offers
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Toggle visibility between <strong>Public Offers</strong> (displayed in the customer checkout offers list) and <strong>Secret / Hidden Promos</strong> (unlocked only via manual entry).
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary h-10 px-4 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus size={15} />
          <span>{showAddForm ? "Cancel" : "Create New Offer"}</span>
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[5px] text-xs text-emerald-800 font-medium flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[5px] text-xs text-red-800 font-medium flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Creation Modal/Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="p-6 bg-white rounded-[8px] border border-[#b6713e]/40 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Sparkles size={16} className="text-[#b6713e]" />
            <h3 className="text-sm font-bold text-[#1c1c1c]">Create New Promo Offer</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. LUXURY15"
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
                Discount Value ({type === "PERCENTAGE" ? "%" : "QAR"}) *
              </label>
              <input
                type="number"
                required
                step="1"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] font-bold focus:outline-none focus:border-[#b6713e]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Offer Description / Terms (Shown to customers)
            </label>
            <input
              type="text"
              placeholder="e.g. 15% off orders above QAR 500 across Qatar & UAE"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Minimum Order (QAR)
              </label>
              <input
                type="number"
                step="1"
                value={minimumOrder}
                onChange={(e) => setMinimumOrder(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Total Usage Limit
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(parseInt(e.target.value, 10) || 0)}
                className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
              />
            </div>

            {/* Visibility Switch */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Storefront Visibility
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPublic}
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isPublic ? "bg-emerald-600" : "bg-purple-600"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isPublic ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>

                <span
                  className={`text-xs font-bold flex items-center gap-1.5 ${
                    isPublic ? "text-emerald-700" : "text-purple-700"
                  }`}
                >
                  {isPublic ? (
                    <>
                      <Eye size={13} />
                      <span>Public Offer</span>
                    </>
                  ) : (
                    <>
                      <Lock size={13} />
                      <span>Secret / Hidden</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="h-10 px-6 text-xs font-semibold"
            >
              Save & Activate Offer
            </Button>
          </div>
        </form>
      )}

      {/* Filter Tabs & Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#e5e5e5]">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-md text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              filterTab === "ALL"
                ? "bg-white text-[#1c1c1c] shadow-2xs font-bold"
                : "text-neutral-600 hover:text-[#1c1c1c]"
            }`}
          >
            All Offers ({coupons.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("PUBLIC")}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTab === "PUBLIC"
                ? "bg-white text-emerald-800 shadow-2xs font-bold"
                : "text-neutral-600 hover:text-emerald-800"
            }`}
          >
            <Eye size={12} className="text-emerald-600" />
            <span>Public ({publicCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("SECRET")}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTab === "SECRET"
                ? "bg-white text-purple-800 shadow-2xs font-bold"
                : "text-neutral-600 hover:text-purple-800"
            }`}
          >
            <Lock size={12} className="text-purple-600" />
            <span>Secret / Hidden ({secretCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-neutral-200 rounded focus:outline-none focus:border-[#b6713e]"
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-[8px] border border-[#e5e5e5] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e5e5e5] bg-[#fbf9f5] text-neutral-600 font-bold uppercase text-[11px]">
              <th className="py-3 px-4">Coupon Code</th>
              <th className="py-3 px-4">Discount</th>
              <th className="py-3 px-4">Description & Terms</th>
              <th className="py-3 px-4">Min. Order</th>
              <th className="py-3 px-4">Visibility Toggle</th>
              <th className="py-3 px-4">Usage</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ece1]">
            {filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-400">
                  No coupons found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredCoupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#fbf9f5]/50 transition-colors">
                  {/* Code */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-[#b6713e] shrink-0" />
                      <span className="font-mono font-bold text-sm text-[#1c1c1c]">
                        {c.code}
                      </span>
                    </div>
                  </td>

                  {/* Discount */}
                  <td className="py-3.5 px-4 font-extrabold text-[#1c1c1c]">
                    {c.type === "PERCENTAGE" ? `${c.value}% OFF` : `QAR ${c.value} OFF`}
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 text-neutral-600 max-w-xs">
                    {c.description ? (
                      <span className="line-clamp-2">{c.description}</span>
                    ) : (
                      <span className="text-neutral-400 italic">No description</span>
                    )}
                  </td>

                  {/* Min Order */}
                  <td className="py-3.5 px-4 text-neutral-700 font-medium">
                    {c.minimumOrder ? formatPrice(c.minimumOrder) : "No minimum"}
                  </td>

                  {/* Visibility Toggle Switch */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={c.isPublic}
                        onClick={() => handleToggleVisibility(c)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          c.isPublic ? "bg-emerald-600" : "bg-neutral-300"
                        }`}
                        title={
                          c.isPublic
                            ? "Currently Public: Click to hide from checkout list"
                            : "Currently Hidden: Click to make visible at checkout"
                        }
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            c.isPublic ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>

                      <span
                        className={`text-[11px] font-bold flex items-center gap-1 ${
                          c.isPublic ? "text-emerald-800" : "text-neutral-500"
                        }`}
                      >
                        {c.isPublic ? (
                          <>
                            <Eye size={12} className="text-emerald-600" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <Lock size={11} className="text-neutral-400" />
                            <span>Hidden</span>
                          </>
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Usage */}
                  <td className="py-3.5 px-4 text-neutral-600 font-medium">
                    {c.usedCount} / {c.usageLimit || "∞"}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        className="btn-secondary h-7 px-2 text-[11px] font-semibold flex items-center gap-1 text-neutral-600 hover:text-[#1c1c1c] cursor-pointer"
                        title="Edit all coupon details"
                      >
                        <Edit3 size={11} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        className={`font-bold text-[10px] uppercase px-2 py-1 rounded cursor-pointer transition-colors ${
                          c.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {c.active ? "Active" : "Disabled"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Coupon"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Coupon Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[#b6713e]" />
                <h3 className="text-sm font-bold text-[#1c1c1c]">
                  Edit Coupon: {editingCoupon.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Discount Value ({editType === "PERCENTAGE" ? "%" : "QAR"}) *
                </label>
                <input
                  type="number"
                  required
                  value={editValue}
                  onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Description / Promo Terms
              </label>
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded"
                placeholder="e.g. 15% off orders over QAR 500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Minimum Order (QAR)
                </label>
                <input
                  type="number"
                  value={editMinimumOrder}
                  onChange={(e) =>
                    setEditMinimumOrder(
                      e.target.value === "" ? "" : parseFloat(e.target.value)
                    )
                  }
                  placeholder="Optional"
                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  value={editUsageLimit}
                  onChange={(e) =>
                    setEditUsageLimit(
                      e.target.value === "" ? "" : parseInt(e.target.value, 10)
                    )
                  }
                  placeholder="Optional"
                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded"
                />
              </div>
            </div>

            {/* Visibility Toggle Inside Edit Modal */}
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-[#1c1c1c]">
                  Storefront Visibility
                </span>
                <span className="block text-[11px] text-neutral-500">
                  {editIsPublic
                    ? "Public: Visible in customer checkout offers list"
                    : "Hidden: Secret promo code, customer must type it manually"}
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={editIsPublic}
                onClick={() => setEditIsPublic(!editIsPublic)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  editIsPublic ? "bg-emerald-600" : "bg-neutral-400"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    editIsPublic ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div>
                <span className="block text-xs font-bold text-[#1c1c1c]">
                  Active Status
                </span>
                <span className="block text-[11px] text-neutral-500">
                  Enable or disable this coupon code
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={editActive}
                onClick={() => setEditActive(!editActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  editActive ? "bg-emerald-600" : "bg-neutral-400"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    editActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="btn-secondary h-8 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn-primary h-8 px-4 text-xs font-bold flex items-center gap-1.5"
              >
                {isUpdating ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Check size={12} />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
