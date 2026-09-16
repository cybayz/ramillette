"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { LogOut, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

interface LogoutButtonProps {
  className?: string;
  label?: string;
  showIcon?: boolean;
}

export function LogoutButton({
  className,
  label,
  showIcon = true,
}: LogoutButtonProps) {
  const pathname = usePathname();
  const isAr = Boolean(pathname?.startsWith("/ar"));
  const { logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    await logout(isAr ? "ar" : "en");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={
        className ||
        "btn-secondary h-9 px-4 text-xs font-semibold flex items-center gap-2 text-neutral-700 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
      }
      aria-label="Logout"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin text-neutral-500" />
      ) : (
        showIcon && <LogOut size={14} />
      )}
      <span>{label || (isAr ? "تسجيل الخروج" : "Sign Out")}</span>
    </button>
  );
}
