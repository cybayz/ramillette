import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Ramillette Perfumes Qatar",
  description: "Ramillette refund policy, processing times, and payment reversals in Qatar.",
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#ffffff] min-h-screen py-12">
      <div className="ramillette-container max-w-3xl">
        <nav className="text-xs text-neutral-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">Home</Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">Refund Policy</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-[#1c1c1c] mb-6">
          Refund Policy
        </h1>

        <div className="prose prose-neutral text-xs sm:text-sm text-neutral-700 space-y-4 leading-relaxed">
          <p>
            Once an eligible returned item is received and inspected at our Souq Al Wakra facility, we will notify you of the status of your refund.
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            1. Refund Methods
          </h3>
          <p>
            <strong>Credit / Debit Card Payments:</strong> Refunds will be credited to the original payment card used during checkout within 5 to 7 business days, subject to your issuing Qatar bank's processing cycles.
          </p>
          <p>
            <strong>Cash on Delivery (COD):</strong> For orders paid via cash, refunds are issued via instant local Qatar bank wire transfer or store credit voucher, as preferred by the customer.
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            2. Shipping Fees
          </h3>
          <p>
            Standard delivery fees (QAR 30) are non-refundable unless the return is due to a transit error or product defect on our part.
          </p>
        </div>
      </div>
    </div>
  );
}
