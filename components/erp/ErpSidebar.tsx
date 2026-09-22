"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  PackageCheck,
  Boxes,
  ArrowLeftRight,
  Truck,
  RotateCcw,
  Users,
  BarChart3,
  Sliders,
  Store,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { LogoutButton } from "@/components/account/LogoutButton";

interface ErpSidebarProps {
  permissions?: string[];
  userRole?: string;
  isSuperAdmin?: boolean;
}

export function ErpSidebar({
  permissions = [],
  userRole = "",
  isSuperAdmin = false,
}: ErpSidebarProps) {
  const pathname = usePathname();

  const hasPerm = (p?: string) => {
    if (!p) return true;
    if (isSuperAdmin || permissions.includes("*")) return true;
    return permissions.includes(p);
  };

  const rawNavigationGroups = [
    {
      title: "Store Operations",
      items: [
        {
          label: "Store Dashboard",
          href: "/erp",
          icon: LayoutDashboard,
          permission: "reports:view", // General overview requires at least reports:view or is store manager
        },
        {
          label: "POS Register",
          href: "/erp/pos",
          icon: ShoppingCart,
          badge: "F2",
          permission: "pos:access",
        },
        {
          label: "Online Fulfillment",
          href: "/erp/orders",
          icon: PackageCheck,
          permission: "orders:view",
        },
      ],
    },
    {
      title: "Stock & Procurement",
      items: [
        {
          label: "Store Inventory",
          href: "/erp/inventory",
          icon: Boxes,
          permission: "inventory:view",
        },
        {
          label: "Stock Transfers",
          href: "/erp/transfers",
          icon: ArrowLeftRight,
          permission: "transfers:manage",
        },
        {
          label: "Purchases & Goods",
          href: "/erp/purchases",
          icon: Truck,
          permission: "purchasing:manage",
        },
      ],
    },
    {
      title: "Service & Analytics",
      items: [
        {
          label: "Returns & Exchanges",
          href: "/erp/returns",
          icon: RotateCcw,
          permission: "returns:manage",
        },
        {
          label: "Customers & History",
          href: "/erp/customers",
          icon: Users,
          permission: "customers:view",
        },
        {
          label: "Reports & Shifts",
          href: "/erp/reports",
          icon: BarChart3,
          permission: "reports:view",
        },
      ],
    },
    {
      title: "System Administration",
      items: [
        {
          label: "Roles & Permissions",
          href: "/erp/roles",
          icon: ShieldCheck,
          permission: "roles:manage",
        },
        {
          label: "Branch Provisioning",
          href: "/erp/setup",
          icon: Sliders,
          permission: "setup:manage",
        },
      ],
    },
  ];

  // Filter groups and items
  const navigationGroups = rawNavigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPerm(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="w-60 bg-[#141414] text-white flex flex-col justify-between shrink-0 border-r border-[#222222] min-h-[calc(100vh-4rem)]">
      <div className="p-3 space-y-6">
        {/* Brand Header */}
        <div className="px-3 pt-2 pb-1 border-b border-[#262626]">
          <Link href="/erp" className="block">
            <span className="font-black text-sm tracking-widest uppercase text-white">
              Ramillette
            </span>
            <span className="block text-[9px] font-mono tracking-widest text-[#faedcd] uppercase font-bold">
              Store ERP System
            </span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-5">
          {navigationGroups.map((group, idx) => (
            <div key={idx}>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/erp"
                      ? pathname === "/erp"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-[5px] text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#faedcd] text-[#1c1c1c] font-bold shadow-xs"
                          : "text-neutral-400 hover:text-white hover:bg-[#222222]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          size={15}
                          className={isActive ? "text-[#1c1c1c]" : "text-[#faedcd]"}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                            isActive
                              ? "bg-[#1c1c1c]/15 text-[#1c1c1c]"
                              : "bg-[#282828] text-neutral-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-[#222222] space-y-1.5 bg-[#121212]">
        {hasPerm("admin:access") && (
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-[5px] text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#222222] transition-colors"
          >
            <ShieldCheck size={14} className="text-[#faedcd]" />
            <span>Central Admin</span>
          </Link>
        )}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-[5px] text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#222222] transition-colors"
        >
          <Store size={14} className="text-[#faedcd]" />
          <span>Live Storefront</span>
        </Link>
        <div className="pt-1">
          <LogoutButton
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-[5px] text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer"
            label="Sign Out"
          />
        </div>
      </div>
    </aside>
  );
}
