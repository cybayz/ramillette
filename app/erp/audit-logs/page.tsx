import React from "react";
import { getErpUser, getActiveErpStore, canViewReports } from "@/lib/erp/context";
import { AuditTrailView } from "@/components/admin/AuditTrailView";
import { AccessDenied } from "@/components/erp/AccessDenied";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Audit Trail & Activity Logs | Ramillette Store ERP",
  description: "Track all operations, stock adjustments, and sales with user attribution.",
};

export const revalidate = 0;

export default async function ErpAuditLogsPage() {
  const [user, storeData] = await Promise.all([
    getErpUser(),
    getActiveErpStore(),
  ]);

  if (!user || !storeData) {
    redirect("/account/login?redirect=/erp/audit-logs");
  }

  if (!canViewReports(user)) {
    return (
      <AccessDenied
        moduleName="Audit Trail & Logs"
        requiredPermission="reports:view"
        userRole={user.role}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AuditTrailView title="Store &amp; System Audit Trail" />
    </div>
  );
}
