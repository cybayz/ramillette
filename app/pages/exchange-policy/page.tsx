import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exchange Policy | Ramillette Perfumes Qatar",
  description: "Fragrance bottle size exchanges and scent replacements at Ramillette Qatar.",
};

export default function ExchangePolicyPage() {
  return (
    <div className="bg-[#ffffff] min-h-screen py-12">
      <div className="ramillette-container max-w-3xl">
        <nav className="text-xs text-neutral-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">Home</Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">Exchange Policy</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-[#1c1c1c] mb-6">
          Exchange Policy
        </h1>

        <div className="prose prose-neutral text-xs sm:text-sm text-neutral-700 space-y-4 leading-relaxed">
          <p>
            Ordered the wrong bottle size or wish to exchange for another signature fragrance? We offer seamless exchanges within <strong>14 days</strong> of order receipt.
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            1. Exchange Process
          </h3>
          <p>
            You may exchange an unopened, sealed perfume either:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Directly at our <strong>Souq Al Wakra</strong> flagship boutique.</li>
            <li>By requesting an exchange courier to visit your location in Doha (standard QAR 30 exchange courier fee applies).</li>
          </ul>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            2. Price Difference
          </h3>
          <p>
            If exchanging for a perfume of higher value, the price difference can be paid in cash or card to the courier. If exchanging for a lower-priced scent, store credit will be credited to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
