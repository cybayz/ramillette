import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Ramillette Perfumes Qatar",
  description: "Customer data protection and privacy policy at Ramillette Qatar.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#ffffff] min-h-screen py-12">
      <div className="ramillette-container max-w-3xl">
        <nav className="text-xs text-neutral-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">Home</Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">Privacy Policy</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-[#1c1c1c] mb-6">
          Privacy Policy
        </h1>

        <div className="prose prose-neutral text-xs sm:text-sm text-neutral-700 space-y-4 leading-relaxed">
          <p>
            Ramillette respects your privacy and is dedicated to safeguarding customer personal data in accordance with Law No. 13 of 2016 concerning Personal Data Privacy Protection in the State of Qatar.
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            1. Information We Collect
          </h3>
          <p>
            We collect your name, delivery address, Qatar phone number, and email strictly for the purposes of processing orders, dispatching couriers, and providing customer support.
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            2. Payment Security
          </h3>
          <p>
            We do not store your credit card or debit card numbers on our servers. All electronic transactions are processed through encrypted payment gateways licensed by the Qatar Central Bank.
          </p>

          <h3 className="text-sm font-bold text-[#1c1c1c] pt-2">
            3. Third-Party Sharing
          </h3>
          <p>
            Your information is never sold or rented. It is shared only with our trusted local delivery couriers for the sole purpose of delivering your fragrance to your doorstep.
          </p>
        </div>
      </div>
    </div>
  );
}
