import React from "react";
import { Metadata } from "next";
import { getSession, isAdminRole } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SuggestionsManager } from "@/components/admin/SuggestionsManager";

export const metadata: Metadata = {
  title: "Customer Product Suggestions | Ramillette Admin",
  description: "View and manage requested fragrances submitted by customers from search queries",
};

export default async function AdminSuggestionsPage() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    redirect("/account/login");
  }

  return (
    <div className="max-w-7xl mx-auto">
      <SuggestionsManager />
    </div>
  );
}
