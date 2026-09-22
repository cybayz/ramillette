import React from "react";
import { getErpUser, hasPermission, getDefaultLandingPage } from "@/lib/erp/context";
import { RoleManagementView } from "@/components/erp/RoleManagementView";
import { AccessDenied } from "@/components/erp/AccessDenied";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Roles & Permissions Matrix | Ramillette Store ERP",
  description: "Dynamic role creation, granular capability toggles, and branch employee role assignments.",
};

export const revalidate = 0;

export default async function ErpRolesPage() {
  const user = await getErpUser();

  if (!user) {
    redirect("/account/login?redirect=/erp/roles");
  }

  if (!hasPermission(user, "roles:manage")) {
    return (
      <AccessDenied
        moduleName="Role & Permission Matrix"
        requiredPermission="roles:manage"
        userRole={user.customRole?.displayName || user.role}
        landingPage={getDefaultLandingPage(user)}
      />
    );
  }

  return <RoleManagementView />;
}
