import React from "react";
import { getErpUser, getActiveErpStore, canViewReports, getDefaultLandingPage } from "@/lib/erp/context";
import { StoreReportsView } from "@/components/erp/StoreReportsView";
import { AccessDenied } from "@/components/erp/AccessDenied";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Reports & Shifts | Ramillette Store ERP",
  description: "Daily sales reconciliation, shift totals, and revenue metrics.",
};

export const revalidate = 0;

export default async function ErpReportsPage() {
  const [user, storeData] = await Promise.all([
    getErpUser(),
    getActiveErpStore(),
  ]);

  if (!user || !storeData) {
    redirect("/account/login?redirect=/erp/reports");
  }

  if (!canViewReports(user)) {
    return (
      <AccessDenied
        moduleName="Store Reports & Shift Analytics"
        requiredPermission="reports:view"
        userRole={user.customRole?.displayName || user.role}
        landingPage={getDefaultLandingPage(user)}
      />
    );
  }

  return <StoreReportsView storeContext={storeData.context} />;
}
