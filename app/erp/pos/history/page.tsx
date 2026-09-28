import React from "react";
import { getErpUser, getActiveErpStore, canAccessPos, getDefaultLandingPage } from "@/lib/erp/context";
import { PosSalesHistoryView } from "@/components/erp/PosSalesHistoryView";
import { AccessDenied } from "@/components/erp/AccessDenied";
import { redirect } from "next/navigation";

export const metadata = {
  title: "POS Order History & Invoices | Ramillette Store ERP",
  description: "Browse completed store register sales, transactions, and reprint customer receipts.",
};

export const revalidate = 0;

export default async function PosSalesHistoryPage() {
  const [user, storeData] = await Promise.all([
    getErpUser(),
    getActiveErpStore(),
  ]);

  if (!user || !storeData) {
    redirect("/account/login?redirect=/erp/pos/history");
  }

  if (!canAccessPos(user.role)) {
    return (
      <AccessDenied
        moduleName="POS Order History & Invoices"
        requiredPermission="pos:access"
        userRole={user.customRole?.displayName || user.role}
        landingPage={getDefaultLandingPage(user)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <PosSalesHistoryView initialPeriod="today" />
    </div>
  );
}
