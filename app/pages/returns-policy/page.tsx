import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns Policy | Ramillette Perfumes Qatar",
  description: "Learn about product returns, conditions, and timelines at Ramillette Qatar.",
};

export default function ReturnsPolicyPage() {
  return (
    <div className="bg-[#ffffff] min-h-screen py-12">
      <div className="ramillette-container max-w-3xl">
        <nav className="text-xs text-neutral-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">Home</Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">Returns Policy</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-[#1c1c1c] mb-6">
          Returns Policy
        </h1>

        <div className="prose prose-neutral text-xs sm:text-sm text-neutral-700 space-y-4 leading-relaxed">
          <p>
            Your satisfaction with Ramillette Perfumes is our primary commitment. We accept returns of eligible items within <strong>14 days</strong> of receipt in the State of Qatar.
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            1. Return Conditions
          </h3>
          <p>
            To be eligible for return or exchange, fragrance bottles must be unopened, in their original factory cellophane wrapping, in pristine undamaged packaging, and accompanied by proof of purchase (order receipt or email confirmation).
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            2. Non-Returnable Items
          </h3>
          <p>
            Due to hygiene and fragrance integrity standards, bottles with broken tamper seals, unboxed products, or perfumes that have been sprayed or tested cannot be returned.
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            3. Damaged or Defective Deliveries
          </h3>
          <p>
            If your fragrance arrives damaged, leaking, or defective, please notify us within 24 hours of delivery. We will immediately dispatch a courier to replace the product at zero additional cost to you.
          </p>
        </div>
      </div>
    </div>
  );
}
