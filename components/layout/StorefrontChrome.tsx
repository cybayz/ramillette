"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PageTransition } from "@/components/layout/PageTransition";

export function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // Admin routes get an unconstrained, dedicated viewport without storefront chrome
    return <div className="min-h-screen bg-[#f5f5f5] text-[#1c1c1c]">{children}</div>;
  }

  return (
    <>
      {/* Top Location & Announcement Bar */}
      <TopBar />

      {/* Sticky Luxury Header */}
      <Header />

      {/* Page Content with safe padding for mobile bottom bar and smooth page entry */}
      <main className="flex-1 pb-16 md:pb-0 min-w-0 max-w-full">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Global Slideout Cart Drawer */}
      <CartDrawer />

      {/* Floating WhatsApp Support Button */}
      <FloatingWhatsApp />

      {/* Persistent Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Comprehensive Luxury Footer */}
      <Footer />
    </>
  );
}
