import React from "react";
import { getErpUser, getActiveErpStore, hasPermission, getDefaultLandingPage } from "@/lib/erp/context";
import { PurchasesManager } from "@/components/erp/PurchasesManager";
import { AccessDenied } from "@/components/erp/AccessDenied";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Purchases & Suppliers | Ramillette Store ERP",
  description: "Fragrance supplier management, purchase order generation, and store intake.",
};

export const revalidate = 0;

export default async function ErpPurchasesPage() {
  const [user, storeData] = await Promise.all([
    getErpUser(),
    getActiveErpStore(),
  ]);

  if (!user || !storeData) {
    redirect("/account/login?redirect=/erp/purchases");
  }

  if (!hasPermission(user, "purchasing:manage")) {
    return (
      <AccessDenied
        moduleName="Purchases & Supplier Management"
        requiredPermission="purchasing:manage"
        userRole={user.customRole?.displayName || user.role}
        landingPage={getDefaultLandingPage(user)}
      />
    );
  }

  return <PurchasesManager storeContext={storeData.context} />;
}
