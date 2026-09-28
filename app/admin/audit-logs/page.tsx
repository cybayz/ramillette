import React from "react";
import { AuditTrailView } from "@/components/admin/AuditTrailView";

export const metadata = {
  title: "Audit Trail & Activity Logs | Ramillette Admin",
  description: "Track all admin, retail, and store operations with timestamps and user attribution.",
};

export default function AdminAuditLogsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AuditTrailView title="System Audit Trail & Operator Activity" />
    </div>
  );
}
