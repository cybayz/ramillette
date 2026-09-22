import React from "react";
import { getSession, isAdminRole } from "@/lib/auth/session";
import { RoleManagementView } from "@/components/erp/RoleManagementView";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Roles & Permissions Management | Ramillette Admin",
  description: "Global staff roles and granular access permissions management.",
};

export const revalidate = 0;

export default async function AdminRolesPage() {
  const session = await getSession();

  if (!session || !isAdminRole(session.role)) {
    redirect("/account/login?redirect=/admin/roles");
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-[8px] p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-[6px] bg-[#1c1c1c] text-[#faedcd] flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Platform Roles & Access Control
            </h1>
            <p className="text-xs text-neutral-500">
              Centrally manage branch roles, functional permission matrices, and staff workstation landing pages.
            </p>
          </div>
        </div>
      </div>

      <RoleManagementView />
    </div>
  );
}
