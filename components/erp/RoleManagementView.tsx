"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Plus,
  Save,
  Check,
  X,
  Lock,
  Sparkles,
  ArrowRight,
  Store,
  Layers,
  ChevronDown,
  Info,
  CheckCircle2,
  Trash2,
} from "lucide-react";

interface RoleData {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  isSystem: boolean;
  defaultLanding: string;
  usersCount: number;
  permissions: string[];
}

interface PermissionItem {
  key: string;
  label: string;
  description: string;
}

interface PermissionCategory {
  category: string;
  permissions: PermissionItem[];
}

interface StaffUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: string;
  customRoleId?: string | null;
  customRoleName: string;
  assignedStoreId?: string | null;
  storeName: string;
  storeCode?: string | null;
}

const LANDING_OPTIONS = [
  { value: "/erp/pos", label: "POS Register (/erp/pos)", hint: "Dedicated sales terminal for cashiers" },
  { value: "/erp/orders", label: "Online Fulfillment (/erp/orders)", hint: "Picking & packing queue for warehouse staff" },
  { value: "/erp/inventory", label: "Store Inventory (/erp/inventory)", hint: "Stock counts & ledger for stock managers" },
  { value: "/erp/transfers", label: "Stock Transfers (/erp/transfers)", hint: "Inter-store transfer logistics" },
  { value: "/erp/purchases", label: "Purchases & Intake (/erp/purchases)", hint: "Supplier purchase orders & goods receiving" },
  { value: "/erp/returns", label: "Returns Desk (/erp/returns)", hint: "Customer return & exchange desk" },
  { value: "/erp/reports", label: "Shift Reports (/erp/reports)", hint: "Daily shift reconciliation for accountants" },
  { value: "/erp", label: "Store Dashboard (/erp)", hint: "Full branch overview for store managers" },
  { value: "/admin", label: "Central Admin (/admin)", hint: "Global platform administration" },
];

export function RoleManagementView() {
  const [activeTab, setActiveTab] = useState<"matrix" | "staff">("matrix");
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [catalog, setCatalog] = useState<PermissionCategory[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New role modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleLanding, setNewRoleLanding] = useState("/erp/pos");
  const [newRolePerms, setNewRolePerms] = useState<string[]>(["pos:access"]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRolesAndCatalog();
    fetchStaff();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchRolesAndCatalog = async () => {
    try {
      const res = await fetch("/api/erp/roles");
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles);
        setCatalog(data.catalog);
      }
    } catch (err) {
      console.error("Failed to load roles", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/erp/roles/users");
      const data = await res.json();
      if (data.success) {
        setStaff(data.users);
      }
    } catch (err) {
      console.error("Failed to load staff", err);
    }
  };

  const togglePermission = async (role: RoleData, permKey: string) => {
    if (role.name === "SUPER_ADMIN") {
      showToast("Super Administrator retains all privileges by system architecture.");
      return;
    }

    const currentPerms = role.permissions;
    const hasIt = currentPerms.includes(permKey);
    const newPerms = hasIt
      ? currentPerms.filter((p) => p !== permKey)
      : [...currentPerms, permKey];

    // Optimistically update UI
    setRoles((prev) =>
      prev.map((r) => (r.id === role.id ? { ...r, permissions: newPerms } : r))
    );

    setSavingRoleId(role.id);
    try {
      const res = await fetch("/api/erp/roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: role.id,
          permissions: newPerms,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Updated permissions for ${role.displayName}`);
      } else {
        showToast(data.error || "Failed to update role");
        fetchRolesAndCatalog();
      }
    } catch (err) {
      showToast("Network error updating role");
      fetchRolesAndCatalog();
    } finally {
      setSavingRoleId(null);
    }
  };

  const updateLandingPage = async (role: RoleData, newLanding: string) => {
    setSavingRoleId(role.id);
    try {
      const res = await fetch("/api/erp/roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: role.id,
          defaultLanding: newLanding,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRoles((prev) =>
          prev.map((r) => (r.id === role.id ? { ...r, defaultLanding: newLanding } : r))
        );
        showToast(`Default landing workspace set to ${newLanding}`);
      }
    } catch (err) {
      showToast("Failed to update default workspace");
    } finally {
      setSavingRoleId(null);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleTitle.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/erp/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: newRoleTitle,
          description: newRoleDesc,
          defaultLanding: newRoleLanding,
          permissions: newRolePerms,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Custom role "${data.role.displayName}" created!`);
        setShowCreateModal(false);
        setNewRoleTitle("");
        setNewRoleDesc("");
        setNewRoleLanding("/erp/pos");
        setNewRolePerms(["pos:access"]);
        fetchRolesAndCatalog();
      } else {
        showToast(data.error || "Failed to create custom role");
      }
    } catch (err) {
      showToast("Network error creating role");
    } finally {
      setCreating(false);
    }
  };

  const handleAssignRole = async (userId: string, customRoleId: string) => {
    try {
      const res = await fetch("/api/erp/roles/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, customRoleId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Staff member role updated!");
        fetchStaff();
        fetchRolesAndCatalog();
      } else {
        showToast(data.error || "Failed to reassign role");
      }
    } catch (err) {
      showToast("Network error reassigning role");
    }
  };

  const handleDeleteRole = async (role: RoleData) => {
    if (role.isSystem) return;
    if (!confirm(`Are you sure you want to delete custom role "${role.displayName}"?`)) return;

    try {
      const res = await fetch(`/api/erp/roles?id=${role.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Role "${role.displayName}" deleted`);
        fetchRolesAndCatalog();
      } else {
        showToast(data.error || "Failed to delete role");
      }
    } catch (err) {
      showToast("Network error deleting role");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-neutral-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#faedcd] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono">Loading Dynamic Permission Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1c1c1c] border border-[#faedcd]/40 text-white px-4 py-2.5 rounded-[8px] shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} className="text-[#faedcd]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#141414] border border-[#262626] rounded-[10px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#faedcd]/10 border border-[#faedcd]/30 flex items-center justify-center text-[#faedcd]">
              <ShieldCheck size={18} />
            </div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              Role & Permission Matrix
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-bold uppercase">
              Live Enforcement
            </span>
          </div>
          <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
            Manage granular capabilities per role. When employees log in, they are immediately isolated into their designated dashboard and cannot access unpermitted functional modules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-[#faedcd] hover:bg-[#faedcd]/90 text-[#1c1c1c] px-4 py-2 rounded-[6px] text-xs font-bold transition-all shadow-xs"
          >
            <Plus size={14} />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262626] pb-2">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-xs font-bold transition-all ${
            activeTab === "matrix"
              ? "bg-[#faedcd] text-[#1c1c1c]"
              : "text-neutral-400 hover:text-white hover:bg-[#202020]"
          }`}
        >
          <Layers size={14} />
          <span>Permissions Matrix</span>
        </button>
        <button
          onClick={() => setActiveTab("staff")}
          className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-xs font-bold transition-all ${
            activeTab === "staff"
              ? "bg-[#faedcd] text-[#1c1c1c]"
              : "text-neutral-400 hover:text-white hover:bg-[#202020]"
          }`}
        >
          <Users size={14} />
          <span>Staff Directory ({staff.length})</span>
        </button>
      </div>

      {/* TAB 1: PERMISSION MATRIX */}
      {activeTab === "matrix" && (
        <div className="space-y-6">
          {/* Matrix Overview Cards for Roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roles.map((r) => (
              <div
                key={r.id}
                className="bg-[#141414] border border-[#222222] rounded-[8px] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      {r.displayName}
                      {r.isSystem && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-blue-400 font-bold">
                          System
                        </span>
                      )}
                    </span>
                    {!r.isSystem && (
                      <button
                        onClick={() => handleDeleteRole(r)}
                        className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                        title="Delete custom role"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 mb-3 leading-snug line-clamp-2">
                    {r.description || "Custom operational role"}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#202020] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500">Default Workspace:</span>
                    <select
                      value={r.defaultLanding}
                      disabled={r.name === "SUPER_ADMIN"}
                      onChange={(e) => updateLandingPage(r, e.target.value)}
                      className="bg-[#1b1b1b] border border-[#2c2c2c] text-[#faedcd] text-[10px] font-mono rounded px-2 py-0.5 outline-hidden cursor-pointer"
                    >
                      {LANDING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                    <span>{r.usersCount} Staff Assigned</span>
                    <span className="text-emerald-400">{r.permissions.length} Enabled</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Matrix Table */}
          <div className="bg-[#141414] border border-[#222222] rounded-[10px] overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#222222] bg-[#181818] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Detailed Capability Matrix
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Click any checkbox to grant or revoke that capability in real-time.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1b1b1b] text-neutral-400 border-b border-[#262626]">
                    <th className="p-3.5 min-w-[240px] font-bold text-neutral-300">
                      Module Capability
                    </th>
                    {roles.map((r) => (
                      <th
                        key={r.id}
                        className="p-3.5 text-center min-w-[130px] font-semibold text-white whitespace-nowrap"
                      >
                        <div className="flex flex-col items-center">
                          <span>{r.displayName}</span>
                          <span className="text-[9px] font-mono text-neutral-500 font-normal mt-0.5">
                            {r.defaultLanding}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {catalog.map((cat, catIdx) => (
                    <React.Fragment key={catIdx}>
                      {/* Section Header Row */}
                      <tr className="bg-[#181818]">
                        <td
                          colSpan={roles.length + 1}
                          className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#faedcd] bg-[#1c1c1c]/70 border-y border-[#262626]"
                        >
                          {cat.category}
                        </td>
                      </tr>

                      {/* Permission Rows */}
                      {cat.permissions.map((perm) => (
                        <tr
                          key={perm.key}
                          className="hover:bg-[#1a1a1a] transition-colors"
                        >
                          <td className="p-3.5">
                            <span className="font-semibold text-neutral-200 block">
                              {perm.label}
                            </span>
                            <span className="text-[10px] text-neutral-500 block leading-tight mt-0.5">
                              {perm.description}
                            </span>
                            <span className="text-[9px] font-mono text-neutral-600 block mt-0.5">
                              Key: {perm.key}
                            </span>
                          </td>

                          {roles.map((role) => {
                            const isSuper = role.name === "SUPER_ADMIN";
                            const hasIt = isSuper || role.permissions.includes(perm.key);

                            return (
                              <td
                                key={`${role.id}-${perm.key}`}
                                className="p-3.5 text-center align-middle"
                              >
                                {isSuper ? (
                                  <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 mx-auto">
                                    <Lock size={12} />
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => togglePermission(role, perm.key)}
                                    className={`w-6 h-6 rounded flex items-center justify-center transition-all mx-auto cursor-pointer ${
                                      hasIt
                                        ? "bg-[#faedcd] text-[#1c1c1c] font-bold shadow-xs hover:bg-[#faedcd]/80"
                                        : "bg-[#222222] text-neutral-600 hover:bg-[#2c2c2c] hover:text-neutral-300 border border-[#333333]"
                                    }`}
                                    title={hasIt ? "Click to Revoke" : "Click to Grant"}
                                  >
                                    {hasIt ? <Check size={14} /> : <X size={12} />}
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF ASSIGNMENTS */}
      {activeTab === "staff" && (
        <div className="bg-[#141414] border border-[#222222] rounded-[10px] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#222222] bg-[#181818] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Store Staff & Role Assignments
              </h3>
              <p className="text-[11px] text-neutral-400">
                Assign branch employees to their respective roles to enforce isolation.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#1b1b1b] text-neutral-400 border-b border-[#262626]">
                  <th className="p-3.5 font-semibold text-neutral-300">Staff Member</th>
                  <th className="p-3.5 font-semibold text-neutral-300">Email & Contact</th>
                  <th className="p-3.5 font-semibold text-neutral-300">Assigned Branch</th>
                  <th className="p-3.5 font-semibold text-neutral-300">Active Role</th>
                  <th className="p-3.5 font-semibold text-neutral-300">Landing Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {staff.map((u) => {
                  const currentRole = roles.find((r) => r.id === u.customRoleId || r.name === u.role);

                  return (
                    <tr key={u.id} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-white block">{u.name}</span>
                        <span className="text-[10px] font-mono text-neutral-500">ID: {u.id.slice(0, 10)}...</span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-neutral-300 block">{u.email}</span>
                        <span className="text-[11px] text-neutral-500">{u.phone || "—"}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-neutral-300">
                          <Store size={13} className="text-[#faedcd]" />
                          <span className="font-medium">{u.storeName}</span>
                          {u.storeCode && (
                            <span className="text-[9px] font-mono bg-[#222222] px-1 rounded text-neutral-400">
                              {u.storeCode}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={u.customRoleId || roles.find((r) => r.name === u.role)?.id || ""}
                          onChange={(e) => handleAssignRole(u.id, e.target.value)}
                          className="bg-[#1c1c1c] border border-[#2e2e2e] text-[#faedcd] text-xs font-semibold rounded px-2.5 py-1.5 outline-hidden cursor-pointer"
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.displayName} {r.isSystem ? "(System)" : ""}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3.5">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#2d2d2d] text-neutral-300">
                          {currentRole?.defaultLanding || "/erp"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM ROLE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#2d2d2d] rounded-[12px] max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#282828] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#faedcd]" />
                <h3 className="font-bold text-sm text-white">Create Custom Operational Role</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Cashier / Shift Supervisor"
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-hidden focus:border-[#faedcd]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Responsibilities & scope of this role..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-hidden focus:border-[#faedcd]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block mb-1">
                  Default Landing Workspace *
                </label>
                <select
                  value={newRoleLanding}
                  onChange={(e) => setNewRoleLanding(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-3 py-2 text-xs text-[#faedcd] focus:outline-hidden focus:border-[#faedcd]"
                >
                  {LANDING_OPTIONS.filter((opt) => opt.value !== "/admin").map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.hint}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-neutral-500 block mt-1">
                  Upon login, users with this role will be routed directly to this workstation.
                </span>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block mb-2">
                  Initial Functional Permissions
                </label>
                <div className="bg-[#121212] border border-[#262626] rounded-[6px] p-3 max-h-48 overflow-y-auto space-y-2">
                  {catalog
                    .flatMap((c) => c.permissions)
                    .filter((p) => p.key !== "admin:access")
                    .map((p) => {
                      const isSelected = newRolePerms.includes(p.key);
                      return (
                        <label
                          key={p.key}
                          className="flex items-start gap-2.5 text-xs text-neutral-300 hover:text-white cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setNewRolePerms(newRolePerms.filter((k) => k !== p.key));
                              } else {
                                setNewRolePerms([...newRolePerms, p.key]);
                              }
                            }}
                            className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-[#faedcd] focus:ring-0"
                          />
                          <div>
                            <span className="font-semibold block">{p.label}</span>
                            <span className="text-[10px] text-neutral-500 block">{p.description}</span>
                          </div>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-[6px] text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 bg-[#faedcd] hover:bg-[#faedcd]/90 text-[#1c1c1c] px-5 py-2 rounded-[6px] text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
