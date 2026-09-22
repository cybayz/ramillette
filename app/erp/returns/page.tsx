import React from "react";
import { getErpUser, getActiveErpStore, hasPermission, getDefaultLandingPage } from "@/lib/erp/context";
import { ReturnsDesk } from "@/components/erp/ReturnsDesk";
import { AccessDenied } from "@/components/erp/AccessDenied";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Returns & Exchanges | Ramillette Store ERP",
  description: "Customer service returns desk for online and physical store purchases.",
};

export const revalidate = 0;

export default async function ErpReturnsPage() {
  const [user, storeData] = await Promise.all([
    getErpUser(),
    getActiveErpStore(),
  ]);

  if (!user || !storeData) {
    redirect("/account/login?redirect=/erp/returns");
  }

  if (!hasPermission(user, "returns:manage")) {
    return (
      <AccessDenied
        moduleName="Returns & Exchanges Desk"
        requiredPermission="returns:manage"
        userRole={user.customRole?.displayName || user.role}
        landingPage={getDefaultLandingPage(user)}
      />
    );
  }

  return <ReturnsDesk storeContext={storeData.context} />;
}
