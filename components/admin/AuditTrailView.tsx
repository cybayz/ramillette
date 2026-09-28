"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Download,
  User,
  Package,
  ShoppingCart,
  Boxes,
  RotateCcw,
  ShieldCheck,
  Calendar,
  Eye,
  X,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  oldValue: any;
  newValue: any;
  ipAddress?: string | null;
  storeId?: string | null;
  createdAt: string;
  user: {
    id: string | null;
    name: string;
    email: string | null;
    role: string;
  };
}

interface FilterOption {
  value: string;
  label: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function AuditTrailView({ title = "System Audit Trail & Activity Logs" }: { title?: string }) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");

  // Options & Stats
  const [entities, setEntities] = useState<FilterOption[]>([]);
  const [actions, setActions] = useState<FilterOption[]>([]);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    todayCount: 0,
    productCount: 0,
    salesCount: 0,
    inventoryCount: 0,
  });

  // Modal / Drawer state for inspecting log details
  const [inspectedLog, setInspectedLog] = useState<AuditLogItem | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        entity: selectedEntity,
        action: selectedAction,
        userId: selectedUserId,
        timeRange: selectedTimeRange,
      });

      if (debouncedSearch) {
        params.set("q", debouncedSearch);
      }

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load audit logs (${res.status})`);
      }

      const data = await res.json();
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);

      if (data.stats) {
        setStats(data.stats);
      }

      if (data.filterOptions) {
        if (data.filterOptions.entities) setEntities(data.filterOptions.entities);
        if (data.filterOptions.actions) setActions(data.filterOptions.actions);
        if (data.filterOptions.users) setUserOptions(data.filterOptions.users);
      }
    } catch (err: any) {
      console.error("Error loading audit logs:", err);
      setError(err?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedEntity, selectedAction, selectedUserId, selectedTimeRange, debouncedSearch]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Export to CSV
  const handleExportCsv = () => {
    if (logs.length === 0) {
      alert("No logs to export.");
      return;
    }

    const headers = ["Timestamp", "User Name", "User Email", "User Role", "Action", "Entity", "Entity ID", "Activity Summary", "IP Address", "Store ID"];
    const rows = logs.map((l) => [
      `"${new Date(l.createdAt).toLocaleString()}"`,
      `"${(l.user.name || "System").replace(/"/g, '""')}"`,
      `"${(l.user.email || "").replace(/"/g, '""')}"`,
      `"${l.user.role || ""}"`,
      `"${l.action}"`,
      `"${l.entity}"`,
      `"${l.entityId}"`,
      `"${(l.summary || "").replace(/"/g, '""')}"`,
      `"${l.ipAddress || ""}"`,
      `"${l.storeId || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit-trail-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for formatting time relative to now
  const formatTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Helper for action badges
  const getActionBadge = (action: string) => {
    if (action.includes("CREATE")) {
      return {
        bg: "bg-emerald-950/70 text-emerald-300 border-emerald-800",
        label: "CREATED",
      };
    }
    if (action.includes("UPDATE")) {
      return {
        bg: "bg-sky-950/70 text-sky-300 border-sky-800",
        label: "UPDATED",
      };
    }
    if (action.includes("DELETE")) {
      return {
        bg: "bg-rose-950/70 text-rose-300 border-rose-800",
        label: "DELETED",
      };
    }
    if (action === "POS_SALE" || action.includes("SALE")) {
      return {
        bg: "bg-[#faedcd]/15 text-[#faedcd] border-[#faedcd]/40",
        label: "SALE",
      };
    }
    if (action.includes("STOCK") || action.includes("ADJUST")) {
      return {
        bg: "bg-amber-950/70 text-amber-300 border-amber-800",
        label: "INVENTORY",
      };
    }
    if (action.includes("RETURN")) {
      return {
        bg: "bg-orange-950/70 text-orange-300 border-orange-800",
        label: "RETURN",
      };
    }
    return {
      bg: "bg-neutral-800 text-neutral-300 border-neutral-700",
      label: action,
    };
  };

  // Helper for entity icons
  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case "PRODUCT":
        return <Package size={13} className="text-[#faedcd]" />;
      case "ORDER":
        return <ShoppingCart size={13} className="text-emerald-400" />;
      case "STORE_INVENTORY":
        return <Boxes size={13} className="text-sky-400" />;
      case "RETURN":
        return <RotateCcw size={13} className="text-orange-400" />;
      case "ROLE":
        return <ShieldCheck size={13} className="text-purple-400" />;
      default:
        return <Layers size={13} className="text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1c1c1c] border border-[#2d2d2d] rounded-[10px] p-5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#faedcd]/10 text-[#faedcd] border border-[#faedcd]/20">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{title}</h2>
              <p className="text-xs text-neutral-400">
                Immutable activity log tracking product changes, sales, and operations with user attribution
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadLogs()}
            disabled={loading}
            className="px-3 py-2 rounded-[6px] bg-[#262626] hover:bg-[#303030] text-neutral-300 hover:text-white text-xs font-bold border border-[#383838] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={logs.length === 0}
            className="px-3.5 py-2 rounded-[6px] bg-[#faedcd] hover:bg-[#ebd59f] text-[#1c1c1c] text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-40"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#1c1c1c] border border-[#2d2d2d] rounded-[8px] p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Total Activities</span>
          <div className="text-xl font-black font-mono text-white">{stats.totalCount}</div>
          <span className="text-[10px] text-neutral-500">Across all operations</span>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2d2d2d] rounded-[8px] p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Today&apos;s Events</span>
          <div className="text-xl font-black font-mono text-emerald-400">{stats.todayCount}</div>
          <span className="text-[10px] text-neutral-500">Last 24 hours</span>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2d2d2d] rounded-[8px] p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Product Changes</span>
          <div className="text-xl font-black font-mono text-[#faedcd]">{stats.productCount}</div>
          <span className="text-[10px] text-neutral-500">Creations, edits, archives</span>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2d2d2d] rounded-[8px] p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Retail &amp; Sales</span>
          <div className="text-xl font-black font-mono text-sky-400">{stats.salesCount}</div>
          <span className="text-[10px] text-neutral-500">POS &amp; Online orders</span>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2d2d2d] rounded-[8px] p-3.5 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Stock &amp; Returns</span>
          <div className="text-xl font-black font-mono text-amber-400">{stats.inventoryCount}</div>
          <span className="text-[10px] text-neutral-500">Adjustments &amp; exchanges</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#1c1c1c] border border-[#2d2d2d] rounded-[10px] p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user name, product, order number, SKU, or keyword..."
              className="w-full bg-[#161616] border border-[#333333] rounded-[6px] pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-[#faedcd] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Time Preset Pills */}
          <div className="flex items-center gap-1 bg-[#161616] border border-[#333333] p-1 rounded-[6px] overflow-x-auto">
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "7d", label: "Past 7 Days" },
              { id: "30d", label: "Past 30 Days" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTimeRange(t.id);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedTimeRange === t.id
                    ? "bg-[#faedcd] text-[#1c1c1c]"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Entity Filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
              Filter by Entity:
            </label>
            <select
              value={selectedEntity}
              onChange={(e) => {
                setSelectedEntity(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#161616] border border-[#333333] rounded-[6px] px-3 py-2 text-xs text-white focus:border-[#faedcd] outline-none cursor-pointer"
            >
              <option value="all">All Entities</option>
              {entities.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
              Filter by Action:
            </label>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#161616] border border-[#333333] rounded-[6px] px-3 py-2 text-xs text-white focus:border-[#faedcd] outline-none cursor-pointer"
            >
              <option value="all">All Actions</option>
              {actions.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
              Filter by Operator / User:
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#161616] border border-[#333333] rounded-[6px] px-3 py-2 text-xs text-white focus:border-[#faedcd] outline-none cursor-pointer"
            >
              <option value="all">All Team Members</option>
              {userOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#1c1c1c] border border-[#2d2d2d] rounded-[10px] overflow-hidden shadow-sm">
        {loading && logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw size={24} className="animate-spin text-[#faedcd]" />
            <span>Loading audit records...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-400 space-y-2">
            <AlertTriangle size={24} className="mx-auto" />
            <p>{error}</p>
            <button
              onClick={() => loadLogs()}
              className="px-3 py-1.5 rounded bg-[#2e2e2e] text-white text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
            <History size={28} className="mx-auto text-neutral-600" />
            <p className="font-bold text-neutral-300">No activity logs found</p>
            <p className="text-[11px] text-neutral-500">
              Try adjusting your search keywords, entity filter, or date range.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2d2d2d] bg-[#171717] text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Operator / User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Activity Description</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const date = new Date(log.createdAt);
                  const formattedDate = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const formattedTime = date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#222222] transition-colors group cursor-pointer"
                      onClick={() => setInspectedLog(log)}
                    >
                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-neutral-200 font-bold text-[11px]">
                          {formattedDate}
                        </div>
                        <div className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
                          <Clock size={10} />
                          <span>{formattedTime}</span>
                          <span className="text-neutral-600">•</span>
                          <span className="text-[#faedcd]/80">{formatTimeAgo(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#2a2a2a] text-[#faedcd] flex items-center justify-center font-bold text-[10px] border border-[#383838]">
                            {log.user.name ? log.user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{log.user.name}</div>
                            <div className="text-[10px] text-neutral-500 font-mono">
                              {log.user.email || log.user.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                          {getEntityIcon(log.entity)}
                          <span className="font-mono text-[11px]">{log.entity}</span>
                        </div>
                      </td>

                      {/* Summary */}
                      <td className="py-3 px-4 max-w-md">
                        <p className="text-neutral-200 text-xs line-clamp-2 leading-relaxed">
                          {log.summary}
                        </p>
                      </td>

                      {/* Details Button */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedLog(log);
                          }}
                          className="px-2.5 py-1 rounded bg-[#262626] hover:bg-[#333333] text-neutral-300 hover:text-white text-[11px] font-bold border border-[#383838] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {logs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-[#2d2d2d] bg-[#171717] text-xs text-neutral-400">
            <div>
              Showing <span className="text-white font-mono font-bold">{(page - 1) * limit + 1}</span> to{" "}
              <span className="text-white font-mono font-bold">
                {Math.min(page * limit, totalCount)}
              </span>{" "}
              of <span className="text-[#faedcd] font-mono font-bold">{totalCount}</span> activity logs
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="px-3 py-1.5 rounded bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 hover:text-white border border-[#333333] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <span className="font-mono text-[11px] px-2 text-white">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="px-3 py-1.5 rounded bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 hover:text-white border border-[#333333] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Modal / Drawer */}
      {inspectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#202020] border border-[#383838] rounded-[12px] w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[#2e2e2e] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-[#2a2a2a] text-[#faedcd]">
                  <Eye size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Audit Event Details</h3>
                  <span className="text-[10px] font-mono text-neutral-400">ID: {inspectedLog.id}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectedLog(null)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Event Summary Box */}
            <div className="bg-[#181818] border border-[#2b2b2b] rounded-[8px] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262626] pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      getActionBadge(inspectedLog.action).bg
                    }`}
                  >
                    {inspectedLog.action}
                  </span>
                  <span className="text-xs text-neutral-300 font-mono">
                    Entity: <strong className="text-white">{inspectedLog.entity}</strong> (#{inspectedLog.entityId})
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  {new Date(inspectedLog.createdAt).toLocaleString()}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Activity Summary:
                </span>
                <p className="text-xs font-semibold text-white leading-relaxed bg-[#202020] p-2.5 rounded border border-[#2c2c2c]">
                  {inspectedLog.summary}
                </p>
              </div>

              {/* Attribution Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 block">Operator:</span>
                  <span className="font-bold text-white">{inspectedLog.user.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">Role:</span>
                  <span className="font-mono text-neutral-300">{inspectedLog.user.role}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">IP Address:</span>
                  <span className="font-mono text-neutral-400">{inspectedLog.ipAddress || "Internal"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">Store Context:</span>
                  <span className="font-mono text-neutral-400">{inspectedLog.storeId || "Global / Web"}</span>
                </div>
              </div>
            </div>

            {/* Changed Payload Data (Old vs New) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-300 block">
                Payload / State Changes:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Old Value */}
                <div className="space-y-1">
                  <span className="text-[11px] text-neutral-400 font-bold block">Previous State:</span>
                  <pre className="bg-[#161616] border border-[#2b2b2b] rounded-[6px] p-3 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-56">
                    {inspectedLog.oldValue
                      ? JSON.stringify(inspectedLog.oldValue, null, 2)
                      : "None (Newly created record)"}
                  </pre>
                </div>

                {/* New Value */}
                <div className="space-y-1">
                  <span className="text-[11px] text-neutral-400 font-bold block">New State / Payload:</span>
                  <pre className="bg-[#161616] border border-[#2b2b2b] rounded-[6px] p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-56">
                    {inspectedLog.newValue
                      ? JSON.stringify(inspectedLog.newValue, null, 2)
                      : "None"}
                  </pre>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 border-t border-[#2e2e2e] flex justify-end">
              <button
                onClick={() => setInspectedLog(null)}
                className="px-4 py-2 rounded bg-[#faedcd] hover:bg-[#ebd59f] text-[#1c1c1c] text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
