import React from "react";
import { Clock, Truck, ShieldCheck, CreditCard } from "lucide-react";

export function ValueProps() {
  const benefits = [
    {
      icon: Clock,
      title: "2-Hour Express Delivery",
      description: "Direct courier dispatch across Doha from our Souq Al Wakra boutique.",
    },
    {
      icon: Truck,
      title: "Free Qatar Shipping",
      description: "Complimentary priority delivery on all orders exceeding QAR 900.",
    },
    {
      icon: ShieldCheck,
      title: "100% Authentic Formulations",
      description: "Pure perfume oil concentration crafted for 12+ hour sillage and longevity.",
    },
    {
      icon: CreditCard,
      title: "Cash on Delivery & Card",
      description: "Pay upon delivery or securely via NAPS debit, Visa, Mastercard, and Apple Pay.",
    },
  ];

  return (
    <section className="py-14 bg-white border-y border-[#f0ece1]">
      <div className="ramillette-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="flex items-start gap-4 p-4 rounded-[6px] hover:bg-[#fbf9f5] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#faedcd]/40 border border-[#ecdec1] flex items-center justify-center text-[#b6713e] shrink-0">
                  <Icon size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1c1c1c] mb-1">
                    {b.title}
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
