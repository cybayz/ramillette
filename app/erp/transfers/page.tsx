import React from "react";
import { getErpUser, getActiveErpStore, hasPermission, getDefaultLandingPage } from "@/lib/erp/context";
import { StockTransfersView } from "@/components/erp/StockTransfersView";
import { AccessDenied } from "@/components/erp/AccessDenied";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Stock Transfers | Ramillette Store ERP",
  description: "Inter-store inventory transfer management, transit tracking, and goods receipt.",
};

export const revalidate = 0;

export default async function ErpTransfersPage() {
  const [user, storeData] = await Promise.all([
    getErpUser(),
    getActiveErpStore(),
  ]);

  if (!user || !storeData) {
    redirect("/account/login?redirect=/erp/transfers");
  }

  if (!hasPermission(user, "transfers:manage")) {
    return (
      <AccessDenied
        moduleName="Stock Transfers"
        requiredPermission="transfers:manage"
        userRole={user.customRole?.displayName || user.role}
        landingPage={getDefaultLandingPage(user)}
      />
    );
  }

  return <StockTransfersView storeContext={storeData.context} />;
}
