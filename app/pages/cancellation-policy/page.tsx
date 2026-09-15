import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Cancellation Policy | Ramillette Perfumes Qatar",
  description: "Ramillette's order cancellation guidelines and policies in Qatar.",
};

export default function CancellationPolicyPage() {
  return (
    <div className="bg-[#ffffff] min-h-screen py-12">
      <div className="ramillette-container max-w-3xl">
        <nav className="text-xs text-neutral-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">Home</Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">Cancellation Policy</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-[#1c1c1c] mb-6">
          Order Cancellation Policy
        </h1>

        <div className="prose prose-neutral text-xs sm:text-sm text-neutral-700 space-y-4 leading-relaxed">
          <p>
            At Ramillette Perfumes Qatar, we take pride in rapid processing to ensure express delivery within 2 hours across Doha. If you need to cancel an order, please review the guidelines below:
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            1. Cancellation Before Dispatch
          </h3>
          <p>
            Orders can be cancelled free of charge if you contact us within <strong>1 hour</strong> of order placement, or prior to our dispatch team handing the package to our local Qatar courier. To cancel, please immediately call or WhatsApp our concierge at <strong>+974 5555 1234</strong> with your order number.
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            2. Orders Already Dispatched
          </h3>
          <p>
            Once an order has departed our Souq Al Wakra boutique with our courier, it cannot be cancelled mid-transit. In such cases, please receive the item and refer to our Returns & Exchanges policy.
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            3. Customized & Engraved Bottles
          </h3>
          <p>
            Customized fragrance bottles, bespoke gift hampers, or engraved perfumes cannot be cancelled once laser engraving or compounding has commenced.
          </p>
        </div>
      </div>
    </div>
  );
}
