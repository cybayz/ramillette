import React from "react";
import { getErpUser, getActiveErpStore, canFulfillOrders, getDefaultLandingPage } from "@/lib/erp/context";
import { OrderFulfillmentHub } from "@/components/erp/OrderFulfillmentHub";
import { AccessDenied } from "@/components/erp/AccessDenied";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Online Order Fulfillment | Ramillette Store ERP",
  description: "Store fulfillment center for accepting, picking, packing, and dispatching regional online orders.",
};

export const revalidate = 0;

export default async function ErpOrdersPage() {
  const [user, storeData] = await Promise.all([
    getErpUser(),
    getActiveErpStore(),
  ]);

  if (!user || !storeData) {
    redirect("/account/login?redirect=/erp/orders");
  }

  if (!canFulfillOrders(user)) {
    return (
      <AccessDenied
        moduleName="Online Order Fulfillment Hub"
        requiredPermission="orders:fulfill"
        userRole={user.customRole?.displayName || user.role}
        landingPage={getDefaultLandingPage(user)}
      />
    );
  }

  return <OrderFulfillmentHub storeContext={storeData.context} />;
}
