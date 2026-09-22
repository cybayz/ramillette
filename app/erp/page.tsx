import React from "react";
import { redirect } from "next/navigation";
import { getErpUser, getActiveErpStore, hasPermission, getDefaultLandingPage } from "@/lib/erp/context";
import { ErpDashboardView } from "@/components/erp/ErpDashboardView";

export const revalidate = 0;

export default async function ErpDashboardPage() {
  const [user, storeData] = await Promise.all([
    getErpUser(),
    getActiveErpStore(),
  ]);

  if (!user || !storeData) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Loading store management dashboard...
      </div>
    );
  }

  // If cashier or user without overview permissions, redirect to their role workspace
  if (!hasPermission(user, "reports:view") && !hasPermission(user, "orders:view")) {
    const target = getDefaultLandingPage(user);
    if (target !== "/erp") {
      redirect(target);
    }
  }

  return (
    <ErpDashboardView
      initialStore={storeData.context}
      userName={`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}
      userRole={user.role}
    />
  );
}
