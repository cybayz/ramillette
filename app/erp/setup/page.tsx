import { getErpUser, hasPermission, getDefaultLandingPage } from "@/lib/erp/context";
import { StoreSetupWizard } from "@/components/erp/StoreSetupWizard";
import { AccessDenied } from "@/components/erp/AccessDenied";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Branch Setup Wizard | Ramillette Store ERP",
  description: "Initial physical store configuration wizard.",
};

export const revalidate = 0;

export default async function ErpSetupPage() {
  const user = await getErpUser();

  if (!user) {
    redirect("/account/login?redirect=/erp/setup");
  }

  if (!hasPermission(user, "setup:manage")) {
    return (
      <AccessDenied
        moduleName="Store Provisioning & Setup Wizard"
        requiredPermission="setup:manage"
        userRole={user.customRole?.displayName || user.role}
        landingPage={getDefaultLandingPage(user)}
      />
    );
  }

  return <StoreSetupWizard />;
}
