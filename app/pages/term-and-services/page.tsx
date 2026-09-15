import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Ramillette Perfumes Qatar",
  description: "Terms of service and customer conditions for Ramillette Perfumes Qatar.",
};

export default function TermsPage() {
  return (
    <div className="bg-[#ffffff] min-h-screen py-12">
      <div className="ramillette-container max-w-3xl">
        <nav className="text-xs text-neutral-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">Home</Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">Terms & Conditions</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-[#1c1c1c] mb-6">
          Terms & Conditions
        </h1>

        <div className="prose prose-neutral text-xs sm:text-sm text-neutral-700 space-y-4 leading-relaxed">
          <p>
            Welcome to <strong>Ramillette Perfumes Qatar</strong>. By accessing or purchasing from our platform, you agree to adhere to the following terms and commercial regulations of the State of Qatar.
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            1. Pricing & Currency
          </h3>
          <p>
            All prices listed on Ramillette are quoted in <strong>Qatari Riyals (QAR)</strong>. Prices are inclusive of applicable Qatar regulatory taxes and fees. We reserve the right to modify prices or discontinue products without prior notice.
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            2. Delivery in Qatar
          </h3>
          <p>
            Our express 2-hour delivery service applies to orders placed during normal operating hours within designated municipal areas in Doha and Al Wakrah. External events or severe weather conditions may occasionally adjust dispatch windows.
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            3. Intellectual Property
          </h3>
          <p>
            All branding, trademarks, bottle visual assets, descriptions, and custom formulations are proprietary property of Ramillette.
          </p>
        </div>
      </div>
    </div>
  );
}
