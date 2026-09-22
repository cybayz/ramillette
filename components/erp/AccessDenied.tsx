"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, ShoppingCart, LayoutDashboard } from "lucide-react";

interface AccessDeniedProps {
  moduleName: string;
  requiredPermission?: string;
  userRole?: string;
  landingPage?: string;
}

export function AccessDenied({
  moduleName,
  requiredPermission,
  userRole = "Your current role",
  landingPage = "/erp/pos",
}: AccessDeniedProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1c1c1c] border border-red-900/40 rounded-[12px] p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-800/50 flex items-center justify-center mx-auto mb-5 text-red-400">
          <ShieldAlert size={32} />
        </div>

        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
          Module Access Restricted
        </h2>
        
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          You do not have permission to access <span className="text-[#faedcd] font-semibold">{moduleName}</span>. 
          {requiredPermission && (
            <span className="block mt-1 text-[11px] font-mono text-neutral-500">
              Required: {requiredPermission}
            </span>
          )}
        </p>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-[8px] p-3 mb-6 text-left">
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
            Active Role
          </span>
          <span className="text-xs font-semibold text-neutral-300">
            {userRole}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={landingPage}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#faedcd] text-[#1c1c1c] hover:bg-[#faedcd]/90 px-5 py-2.5 rounded-[6px] text-xs font-bold transition-all shadow-sm"
          >
            {landingPage.includes("pos") ? (
              <>
                <ShoppingCart size={14} />
                <span>Return to POS Terminal</span>
              </>
            ) : (
              <>
                <LayoutDashboard size={14} />
                <span>Return to My Dashboard</span>
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
