import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getErpUser, getActiveErpStore, ALLOWED_ERP_ROLES, getUserPermissions } from "@/lib/erp/context";
import prisma from "@/lib/db/prisma";
import { ErpHeader } from "@/components/erp/ErpHeader";
import { ErpSidebar } from "@/components/erp/ErpSidebar";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Ramillette Store ERP & POS Management",
  description: "Unified physical store operations, high-speed POS register, real-time inventory, and online order fulfillment center.",
};

export const revalidate = 0;

export default async function ErpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getErpUser();

  if (!user) {
    redirect("/account/login?redirect=/erp");
  }

  const permissions = getUserPermissions(user);
  const isSuperAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
  const userRoleLabel = user.customRole?.displayName || user.role;

  const [activeStoreData, allStores] = await Promise.all([
    getActiveErpStore(),
    prisma.store.findMany({
      where: { active: true },
      include: { region: true, country: true },
      orderBy: [{ countryCode: "asc" }, { priority: "desc" }, { code: "asc" }],
    }),
  ]);

  const availableStores = allStores.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    regionName: s.region.name,
    countryCode: s.countryCode,
    countryName: s.country.name,
    currency: s.currency,
  }));

  const activeStore = activeStoreData?.context || null;

  return (
    <div className="min-h-screen bg-[#101010] text-[#eaeaea] flex flex-col font-sans selection:bg-[#faedcd] selection:text-[#1c1c1c]">
      {/* Global ERP Header */}
      <ErpHeader
        activeStore={activeStore}
        availableStores={availableStores}
        userName={`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}
        userRole={userRoleLabel}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="hidden md:block">
          <ErpSidebar
            permissions={permissions}
            userRole={userRoleLabel}
            isSuperAdmin={isSuperAdmin}
          />
        </div>

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto bg-[#171717] min-w-0">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
