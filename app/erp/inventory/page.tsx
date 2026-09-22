import React from "react";
import { getErpUser, getActiveErpStore, canManageInventory, getDefaultLandingPage } from "@/lib/erp/context";
import { StoreInventoryManager } from "@/components/erp/StoreInventoryManager";
import { AccessDenied } from "@/components/erp/AccessDenied";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Store Inventory & Ledger | Ramillette Store ERP",
  description: "Real-time physical, reserved, and available stock levels and chronological transaction ledger.",
};

export const revalidate = 0;

export default async function ErpInventoryPage() {
  const [user, storeData] = await Promise.all([
    getErpUser(),
    getActiveErpStore(),
  ]);

  if (!user || !storeData) {
    redirect("/account/login?redirect=/erp/inventory");
  }

  if (!canManageInventory(user)) {
    return (
      <AccessDenied
        moduleName="Store Inventory & Transaction Ledger"
        requiredPermission="inventory:view"
        userRole={user.customRole?.displayName || user.role}
        landingPage={getDefaultLandingPage(user)}
      />
    );
  }

  return <StoreInventoryManager storeContext={storeData.context} />;
}
