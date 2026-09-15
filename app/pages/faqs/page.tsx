import React from "react";
import Link from "next/link";
import { HelpCircle, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | Ramillette Perfumes Qatar",
  description:
    "Find answers about Qatar delivery, 2-hour Doha dispatch, cash on delivery, and our authentic perfume formulations.",
};

export default function FaqsPage() {
  const faqs = [
    {
      q: "How fast is delivery across Doha and Qatar?",
      a: "Orders placed within Doha, Al Wakrah, and Lusail are dispatched with our dedicated express couriers and delivered within 2 hours. Deliveries to other municipalities in Qatar are delivered within 24 hours.",
    },
    {
      q: "What is the Free Shipping threshold?",
      a: "All orders totaling QAR 900 or more qualify for 100% complimentary express shipping across Qatar. For orders under QAR 900, standard delivery is QAR 30.",
    },
    {
      q: "Can I pay using Cash on Delivery (COD)?",
      a: "Yes! Cash on Delivery is gladly accepted across Qatar. You can pay with cash or card directly to the courier upon receiving your perfume at your doorstep.",
    },
    {
      q: "Are Ramillette fragrances authentic and long-lasting?",
      a: "Absolutely. All our perfumes are formulated in Extrait de Parfum and Eau de Parfum concentrations using premium Arabian and European oils, delivering 12+ hours of verifiable longevity and radiating sillage.",
    },
    {
      q: "Can I visit your physical boutique in Qatar?",
      a: "Yes! Our flagship boutique is located in Souq Al Wakra Heritage Village (Building 45), Doha, Qatar. You are warmly welcome to sample our entire fragrance library in person.",
    },
    {
      q: "Can I cancel or modify an order after placing it?",
      a: "Yes, you can cancel or modify your order free of charge within 1 hour of placement before our courier departs from Souq Al Wakra. Please contact our support team at +974 5555 1234.",
    },
  ];

  return (
    <div className="bg-[#ffffff] min-h-screen py-12">
      <div className="ramillette-container max-w-3xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">FAQ</span>
        </nav>

        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b6713e]">
            Help Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1c1c1c]">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Everything you need to know about deliveries, payment options, and our fragrance craftsmanship.
          </p>
        </div>

        {/* FAQ Accordion Items */}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="p-6 rounded-[8px] bg-[#fbf9f5] border border-[#e5e5e5] space-y-2 hover:border-[#b6713e] transition-colors"
            >
              <h3 className="text-sm sm:text-base font-bold text-[#1c1c1c] flex items-start gap-2.5">
                <HelpCircle size={18} className="text-[#b6713e] shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 pl-7 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-6 rounded-[8px] bg-[#faedcd]/40 border border-[#ecdec1] text-center space-y-3">
          <h3 className="text-sm font-bold text-[#1c1c1c]">
            Still have questions about a fragrance or delivery?
          </h3>
          <p className="text-xs text-neutral-600">
            Our concierge team in Souq Al Wakra is available daily via WhatsApp or phone.
          </p>
          <Link
            href="/pages/contact"
            className="btn-primary h-9 px-5 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <span>Contact Support</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
