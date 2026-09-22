"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Globe,
  Tag,
  Settings,
  Store,
  Users,
} from "lucide-react";
import { LogoutButton } from "@/components/account/LogoutButton";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Store ERP & POS", href: "/erp", icon: Store },
  { label: "Products & Stock", href: "/admin/products", icon: Package },
  { label: "Orders & Delivery", href: "/admin/orders", icon: ShoppingBag },
  { label: "Countries & Markets", href: "/admin/countries", icon: Globe },
  { label: "Coupons & Promos", href: "/admin/coupons", icon: Tag },
  { label: "Roles & Permissions", href: "/admin/roles", icon: Users },
  { label: "Store & Tax Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebarMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
      >
        <Menu size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-64 bg-[#1c1c1c] text-white flex flex-col justify-between z-10 shadow-2xl">
            <div>
              {/* Header */}
              <div className="p-5 border-b border-[#2d2d2d] flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-lg tracking-widest text-white uppercase block">
                    Ramillette
                  </span>
                  <span className="block text-[9px] tracking-widest text-[#faedcd] uppercase font-bold">
                    Admin Console
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-white p-1 rounded"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-3 space-y-1">
                {adminNav.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-[5px] text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-[#b6713e] text-white"
                          : "text-neutral-300 hover:text-white hover:bg-[#2c2c2c]"
                      }`}
                    >
                      <Icon size={16} className={isActive ? "text-white" : "text-[#faedcd]"} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[#2d2d2d] space-y-2">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-[5px] text-xs text-neutral-400 hover:text-white hover:bg-[#2c2c2c] transition-colors"
              >
                <Store size={15} />
                <span>View Live Store</span>
              </Link>
              <LogoutButton
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[5px] text-xs text-red-400 hover:text-red-300 hover:bg-[#2c2c2c] transition-colors cursor-pointer"
                label="Sign Out"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
