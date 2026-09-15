import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Users,
  Settings,
  Store,
  LogOut,
  ShieldAlert,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/account/login");
  }

  if (session.role !== "ADMIN") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md p-8 bg-red-50 border border-red-200 rounded-[8px]">
          <ShieldAlert size={48} className="text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-xs text-red-700 mb-6">
            You must have administrator privileges to access the Ramillette store management dashboard.
          </p>
          <Link href="/" className="btn-primary h-10 px-5 text-xs inline-flex items-center">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const adminNav = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products & Stock", href: "/admin/products", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Coupons & Promos", href: "/admin/coupons", icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1c1c1c] text-white flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-[#2d2d2d]">
            <Link href="/" className="block">
              <span className="font-extrabold text-xl tracking-widest text-white uppercase">
                Ramillette
              </span>
              <span className="block text-[9px] tracking-widest text-[#faedcd] uppercase font-bold">
                Admin Console
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {adminNav.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-[5px] text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#2c2c2c] transition-colors"
                >
                  <Icon size={16} className="text-[#faedcd]" />
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
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-[5px] text-xs text-neutral-400 hover:text-white hover:bg-[#2c2c2c] transition-colors"
          >
            <Store size={15} />
            <span>View Live Store</span>
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-[5px] text-xs text-red-400 hover:text-red-300 hover:bg-[#2c2c2c] transition-colors cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#e5e5e5] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
            <span className="font-bold text-sm text-[#1c1c1c]">
              Ramillette Admin
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500">
            <span>Store Location:</span>
            <strong className="text-[#1c1c1c]">Souq Al Wakra, Qatar</strong>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-600">
              Admin: <strong>{session.name || session.email}</strong>
            </span>
            <div className="w-8 h-8 rounded-full bg-[#faedcd] border border-[#ecdec1] text-[#b6713e] flex items-center justify-center font-bold text-xs">
              A
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
