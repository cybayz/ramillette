import React from "react";
import Link from "next/link";
import { HelpCircle, Phone, Truck, RotateCcw, ShieldCheck, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Support | Ramillette Perfumes Qatar",
  description: "Customer service and support center for Ramillette Perfumes Qatar.",
};

export default function HelpPage() {
  const cards = [
    {
      title: "Delivery & Tracking",
      description: "Information about 2-hour express dispatch in Doha and Qatar municipalities.",
      icon: Truck,
      href: "/pages/faqs",
    },
    {
      title: "Returns & Exchanges",
      description: "Review our 14-day exchange policy and returns process in Qatar.",
      icon: RotateCcw,
      href: "/pages/returns-policy",
    },
    {
      title: "Contact Concierge",
      description: "Speak with our fragrance specialists at Souq Al Wakra.",
      icon: Phone,
      href: "/pages/contact",
    },
    {
      title: "Order Cancellation",
      description: "Policies regarding changing or cancelling an order prior to dispatch.",
      icon: ShieldCheck,
      href: "/pages/cancellation-policy",
    },
  ];

  return (
    <div className="bg-[#ffffff] min-h-screen py-12">
      <div className="ramillette-container max-w-4xl">
        <nav className="text-xs text-neutral-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">Help Center</span>
        </nav>

        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b6713e]">
            Customer Care
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1c1c1c]">
            How Can We Assist You?
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Find quick answers or get in touch directly with our Qatar team.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.title}
                href={c.href}
                className="p-6 rounded-[8px] bg-[#fbf9f5] border border-[#e5e5e5] hover:border-[#b6713e] hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#faedcd] text-[#b6713e] flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-[#1c1c1c] group-hover:text-[#b6713e] transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {c.description}
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-1 text-xs font-bold text-[#b6713e]">
                  <span>Learn more</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
