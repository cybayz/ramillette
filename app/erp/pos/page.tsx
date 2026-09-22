import React from "react";
import { getErpUser, getActiveErpStore, canAccessPos, getDefaultLandingPage } from "@/lib/erp/context";
import { PosTerminal } from "@/components/erp/PosTerminal";
import { AccessDenied } from "@/components/erp/AccessDenied";
import { redirect } from "next/navigation";

export const metadata = {
  title: "POS Register | Ramillette Store ERP",
  description: "High-speed physical cashier register, USB barcode scanning, and receipt printing.",
};

export const revalidate = 0;

export default async function PosPage() {
  const [user, storeData] = await Promise.all([
    getErpUser(),
    getActiveErpStore(),
  ]);

  if (!user || !storeData) {
    redirect("/account/login?redirect=/erp/pos");
  }

  if (!canAccessPos(user)) {
    return (
      <AccessDenied
        moduleName="POS Cashier Register"
        requiredPermission="pos:access"
        userRole={user.customRole?.displayName || user.role}
        landingPage={getDefaultLandingPage(user)}
      />
    );
  }

  return (
    <PosTerminal
      storeContext={storeData.context}
      cashierName={`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}
    />
  );
}
