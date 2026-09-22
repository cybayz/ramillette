import { getErpUser, getActiveErpStore, hasPermission, getDefaultLandingPage } from "@/lib/erp/context";
import { CustomersView } from "@/components/erp/CustomersView";
import { AccessDenied } from "@/components/erp/AccessDenied";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Customers & History | Ramillette Store ERP",
  description: "Cross-channel customer lookup and lifetime purchase history.",
};

export const revalidate = 0;

export default async function ErpCustomersPage() {
  const [user, storeData] = await Promise.all([
    getErpUser(),
    getActiveErpStore(),
  ]);

  if (!user || !storeData) {
    redirect("/account/login?redirect=/erp/customers");
  }

  if (!hasPermission(user, "customers:view")) {
    return (
      <AccessDenied
        moduleName="Customer Directory & Profiles"
        requiredPermission="customers:view"
        userRole={user.customRole?.displayName || user.role}
        landingPage={getDefaultLandingPage(user)}
      />
    );
  }

  return <CustomersView storeContext={storeData.context} />;
}
