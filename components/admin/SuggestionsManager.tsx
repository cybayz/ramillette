"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Trash2,
  RefreshCw,
  Download,
  Filter,
  ExternalLink,
  MessageSquare,
  Check,
  ChevronDown,
  Edit2,
  X,
  Loader2,
} from "lucide-react";

interface Suggestion {
  id: string;
  productName: string;
  userEmail: string;
  searchQuery?: string | null;
  notes?: string | null;
  status: "PENDING" | "IN_REVIEW" | "AVAILABLE" | "REJECTED" | string;
  adminNotes?: string | null;
  notifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Counts {
  total: number;
  pending: number;
  inReview: number;
  available: number;
  rejected: number;
}

export function SuggestionsManager() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [counts, setCounts] = useState<Counts>({
    total: 0,
    pending: 0,
    inReview: 0,
    available: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Notify Modal State
  const [notifyTarget, setNotifyTarget] = useState<Suggestion | null>(null);
  const [notifyUrl, setNotifyUrl] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Admin Note Editing Modal
  const [noteTarget, setNoteTarget] = useState<Suggestion | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Toast / Feedback message
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/admin/suggestions?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setSuggestions(data.suggestions || []);
        if (data.counts) setCounts(data.counts);
      } else {
        showFeedback("error", data.error || "Failed to load suggestions");
      }
    } catch (err: any) {
      showFeedback("error", "Network error loading suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [selectedStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/suggestions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback("success", `Status updated to ${newStatus}`);
        setSuggestions((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        // Refresh counts
        fetchSuggestions();
      } else {
        showFeedback("error", data.error || "Failed to update status");
      }
    } catch (err) {
      showFeedback("error", "Failed to update status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete suggestion for "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/suggestions?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback("success", "Suggestion deleted");
        setSuggestions((prev) => prev.filter((item) => item.id !== id));
        fetchSuggestions();
      } else {
        showFeedback("error", data.error || "Failed to delete");
      }
    } catch (err) {
      showFeedback("error", "Error deleting suggestion");
    }
  };

  const handleOpenNotify = (suggestion: Suggestion) => {
    setNotifyTarget(suggestion);
    setNotifyUrl(`https://ramillette.com/search?q=${encodeURIComponent(suggestion.productName)}`);
    setNotifyMessage(
      `We are pleased to inform you that "${suggestion.productName}" is now available in our Qatar boutique and online store.`
    );
  };

  const handleSendNotification = async () => {
    if (!notifyTarget) return;

    setIsSendingNotification(true);
    try {
      const res = await fetch("/api/admin/suggestions/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: notifyTarget.id,
          productUrl: notifyUrl.trim() || undefined,
          customMessage: notifyMessage.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showFeedback("success", `Customer ${notifyTarget.userEmail} notified successfully!`);
        setSuggestions((prev) =>
          prev.map((item) =>
            item.id === notifyTarget.id
              ? { ...item, status: "AVAILABLE", notifiedAt: new Date().toISOString() }
              : item
          )
        );
        setNotifyTarget(null);
        fetchSuggestions();
      } else {
        showFeedback("error", data.error || "Failed to notify customer");
      }
    } catch (err) {
      showFeedback("error", "Network error notifying customer");
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleOpenNotes = (suggestion: Suggestion) => {
    setNoteTarget(suggestion);
    setNoteContent(suggestion.adminNotes || "");
  };

  const handleSaveNotes = async () => {
    if (!noteTarget) return;

    setIsSavingNote(true);
    try {
      const res = await fetch("/api/admin/suggestions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: noteTarget.id,
          adminNotes: noteContent.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showFeedback("success", "Admin note saved");
        setSuggestions((prev) =>
          prev.map((item) =>
            item.id === noteTarget.id ? { ...item, adminNotes: noteContent.trim() || null } : item
          )
        );
        setNoteTarget(null);
      } else {
        showFeedback("error", data.error || "Failed to save note");
      }
    } catch (err) {
      showFeedback("error", "Error saving admin note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const exportToCSV = () => {
    if (suggestions.length === 0) return;

    const headers = [
      "ID",
      "Product Name",
      "Customer Email",
      "Search Query",
      "Status",
      "Customer Notes",
      "Admin Notes",
      "Notified At",
      "Created At",
    ];

    const rows = suggestions.map((s) => [
      s.id,
      `"${s.productName.replace(/"/g, '""')}"`,
      `"${s.userEmail}"`,
      `"${(s.searchQuery || "").replace(/"/g, '""')}"`,
      s.status,
      `"${(s.notes || "").replace(/"/g, '""')}"`,
      `"${(s.adminNotes || "").replace(/"/g, '""')}"`,
      s.notifiedAt || "",
      new Date(s.createdAt).toISOString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ramillette_product_suggestions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Available
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            In Review
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-200 text-neutral-700 border border-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
            Declined
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-800 text-white"
              : "bg-red-800 text-white"
          }`}
        >
          {feedback.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1c1c1c] via-[#2d2d2d] to-[#1c1c1c] rounded-xl p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#3d3d3d] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#b6713e]/20 border border-[#b6713e]/40 flex items-center justify-center text-[#faedcd] shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-widest text-[#faedcd] font-bold">
              Catalog Sourcing Intelligence
            </span>
            <h1 className="text-2xl font-bold text-white">
              Customer Product Suggestions
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              Perfumes and collections requested by users when search queries return empty. Use this data to source trending fragrances and notify customers when in stock.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            type="button"
            onClick={fetchSuggestions}
            disabled={isLoading}
            className="flex-1 md:flex-none h-9 px-3.5 rounded-[6px] bg-[#2a2a2a] hover:bg-[#383838] border border-neutral-700 text-xs font-semibold text-neutral-200 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            disabled={suggestions.length === 0}
            className="flex-1 md:flex-none h-9 px-3.5 rounded-[6px] bg-[#b6713e] hover:bg-[#a05d2e] text-xs font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-[#e5e5e5] shadow-xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
            Total Suggestions
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#1c1c1c]">
              {counts.total}
            </span>
            <Sparkles size={18} className="text-[#b6713e]" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-[#e5e5e5] shadow-xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
            Pending Review
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-600">
              {counts.pending}
            </span>
            <Clock size={18} className="text-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-[#e5e5e5] shadow-xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
            In Sourcing / Review
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-blue-600">
              {counts.inReview}
            </span>
            <Filter size={18} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-[#e5e5e5] shadow-xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
            Available / In Stock
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-600">
              {counts.available}
            </span>
            <CheckCircle size={18} className="text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-lg p-4 border border-[#e5e5e5] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by perfume, customer email, or search query..."
            className="w-full bg-[#fbf9f5] border border-[#e5e5e5] rounded-[6px] pl-10 pr-4 py-2 text-xs text-[#1c1c1c] placeholder:text-neutral-400 focus:outline-none focus:border-[#b6713e] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: "All", value: "ALL", count: counts.total },
            { label: "Pending", value: "PENDING", count: counts.pending },
            { label: "In Review", value: "IN_REVIEW", count: counts.inReview },
            { label: "Available", value: "AVAILABLE", count: counts.available },
            { label: "Declined", value: "REJECTED", count: counts.rejected },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === tab.value
                  ? "bg-[#1c1c1c] text-white"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedStatus === tab.value
                    ? "bg-[#b6713e] text-white"
                    : "bg-neutral-200 text-neutral-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Table / List */}
      <div className="bg-white rounded-lg border border-[#e5e5e5] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 size={30} className="animate-spin text-[#b6713e] mx-auto mb-3" />
            <p className="text-xs text-neutral-500 font-medium">Loading suggestions...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-[#fbf9f5] border border-[#ecdac1] text-[#b6713e] flex items-center justify-center mx-auto mb-3">
              <Sparkles size={24} />
            </div>
            <h3 className="text-base font-bold text-[#1c1c1c] mb-1">
              No Product Suggestions Found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery || selectedStatus !== "ALL"
                ? "No suggestions match your current search or status filter."
                : "When customers search for fragrances not present in the catalog and submit suggestions, they will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fbf9f5] border-b border-[#e5e5e5] text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <th className="py-3.5 px-4">Requested Fragrance</th>
                  <th className="py-3.5 px-4">Customer Email</th>
                  <th className="py-3.5 px-4">Original Search</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Notes / Details</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] text-xs">
                {suggestions.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fbf9f5]/60 transition-colors">
                    {/* Fragrance Name */}
                    <td className="py-3.5 px-4 font-semibold text-[#1c1c1c]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1c1c1c]">
                          {item.productName}
                        </span>
                      </div>
                      {item.notifiedAt && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
                          <CheckCircle size={11} />
                          Notified {new Date(item.notifiedAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>

                    {/* Customer Email */}
                    <td className="py-3.5 px-4">
                      <a
                        href={`mailto:${item.userEmail}?subject=Regarding your request for ${encodeURIComponent(item.productName)}`}
                        className="text-neutral-700 hover:text-[#b6713e] font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Mail size={13} className="text-neutral-400" />
                        <span>{item.userEmail}</span>
                      </a>
                    </td>

                    {/* Original Search Query */}
                    <td className="py-3.5 px-4">
                      {item.searchQuery ? (
                        <span className="inline-block bg-[#f4ece1] text-[#7a481c] px-2 py-0.5 rounded text-[11px] font-mono">
                          "{item.searchQuery}"
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <div className="relative inline-block">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="appearance-none bg-white border border-[#e5e5e5] rounded-[6px] pl-2.5 pr-7 py-1 text-xs font-semibold text-[#1c1c1c] cursor-pointer hover:border-[#b6713e] focus:outline-none transition-colors"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="AVAILABLE">Available</option>
                          <option value="REJECTED">Declined</option>
                        </select>
                        <ChevronDown
                          size={12}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                        />
                      </div>
                    </td>

                    {/* Submitted Date */}
                    <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                      <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-neutral-400">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Notes / Details */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {item.notes ? (
                        <p className="text-[11px] text-neutral-600 line-clamp-2">
                          <strong className="text-neutral-800">User:</strong> {item.notes}
                        </p>
                      ) : null}
                      {item.adminNotes ? (
                        <p className="text-[11px] text-[#b6713e] line-clamp-1 mt-0.5">
                          <strong>Admin:</strong> {item.adminNotes}
                        </p>
                      ) : null}
                      {!item.notes && !item.adminNotes ? (
                        <span className="text-neutral-400 text-[11px]">No notes</span>
                      ) : null}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Notify button */}
                        <button
                          type="button"
                          onClick={() => handleOpenNotify(item)}
                          title="Notify Customer"
                          className="p-1.5 rounded-[5px] bg-[#faedcd]/60 hover:bg-[#faedcd] text-[#b6713e] transition-colors cursor-pointer"
                        >
                          <Send size={14} />
                        </button>

                        {/* Admin note button */}
                        <button
                          type="button"
                          onClick={() => handleOpenNotes(item)}
                          title="Edit Admin Note"
                          className="p-1.5 rounded-[5px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.productName)}
                          title="Delete Suggestion"
                          className="p-1.5 rounded-[5px] hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notify Customer Modal */}
      {notifyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setNotifyTarget(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden z-10 border border-[#ecdac1] animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#1c1c1c] text-white px-6 py-4 flex items-center justify-between border-b border-[#333]">
              <div className="flex items-center gap-2.5">
                <Send size={18} className="text-[#faedcd]" />
                <h3 className="text-sm font-bold">Notify Customer of Availability</h3>
              </div>
              <button
                type="button"
                onClick={() => setNotifyTarget(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-[#fbf9f5] border border-[#ecdac1] rounded-lg p-3 text-xs">
                <p>
                  <strong>Recipient:</strong> {notifyTarget.userEmail}
                </p>
                <p className="mt-1">
                  <strong>Requested Fragrance:</strong>{" "}
                  <span className="text-[#b6713e] font-bold">{notifyTarget.productName}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Product or Store Link
                </label>
                <input
                  type="text"
                  value={notifyUrl}
                  onChange={(e) => setNotifyUrl(e.target.value)}
                  placeholder="https://ramillette.com/product/..."
                  className="w-full bg-[#fbf9f5] border border-[#e5e5e5] rounded-[6px] px-3 py-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#b6713e]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Custom Notification Message (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  placeholder="Add a personalized note to the customer..."
                  className="w-full bg-[#fbf9f5] border border-[#e5e5e5] rounded-[6px] px-3 py-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#b6713e] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNotifyTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendNotification}
                  disabled={isSendingNotification}
                  className="btn-primary h-9 px-5 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSendingNotification ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Send Availability Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Note Modal */}
      {noteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setNoteTarget(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden z-10 border border-[#ecdac1] animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#1c1c1c] text-white px-6 py-4 flex items-center justify-between border-b border-[#333]">
              <div className="flex items-center gap-2.5">
                <MessageSquare size={18} className="text-[#faedcd]" />
                <h3 className="text-sm font-bold">Admin Internal Note</h3>
              </div>
              <button
                type="button"
                onClick={() => setNoteTarget(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-neutral-600">
                Internal note for <strong className="text-[#1c1c1c]">"{noteTarget.productName}"</strong> (only visible to admins & staff):
              </p>

              <textarea
                rows={4}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="e.g. Inquired with Paris distributor; arrival expected next month..."
                className="w-full bg-[#fbf9f5] border border-[#e5e5e5] rounded-[6px] px-3.5 py-2.5 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#b6713e] resize-none"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNote}
                  className="btn-primary h-9 px-5 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSavingNote ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Note</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
