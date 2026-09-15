import React from "react";
import Link from "next/link";
import { Gift, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PromotionalCTAs() {
  return (
    <section className="py-16 bg-[#fbf9f5] border-t border-[#f0ece1]">
      <div className="ramillette-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Corporate & Wedding Gifting */}
          <div className="relative rounded-[8px] bg-gradient-to-br from-[#1c1c1c] to-[#2b2b2b] text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden shadow-md">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#b6713e]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#faedcd]/10 border border-[#faedcd]/30 flex items-center justify-center text-[#faedcd] mb-4">
                <Gift size={24} />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-[#faedcd]">
                Corporate & Events
              </span>

              <h3 className="text-2xl font-bold tracking-tight text-white">
                Bespoke Perfume Gifting in Qatar
              </h3>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Elevate your corporate events, national day gifts, and wedding favors with customized luxury fragrance sets and custom engraved bottles.
              </p>
            </div>

            <div className="pt-6 relative z-10">
              <Link href="/pages/contact">
                <Button
                  variant="primary"
                  className="h-11 px-5 text-xs font-semibold flex items-center gap-2"
                >
                  <span>Request Corporate Catalog</span>
                  <ArrowRight size={15} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: Refer & Earn Fragrance Rewards */}
          <div className="relative rounded-[8px] bg-[#faedcd]/30 border border-[#ecdec1] p-8 sm:p-10 flex flex-col justify-between overflow-hidden shadow-xs">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#faedcd] border border-[#ecdec1] flex items-center justify-center text-[#b6713e] mb-4 shadow-xs">
                <Users size={24} />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-[#b6713e]">
                VIP Rewards Club
              </span>

              <h3 className="text-2xl font-bold tracking-tight text-[#1c1c1c]">
                Refer & Earn QAR 50 Gift
              </h3>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Introduce fellow fragrance enthusiasts in Doha to Ramillette. They receive 10% off their first bottle, and you receive QAR 50 credit towards your next luxury fragrance.
              </p>
            </div>

            <div className="pt-6">
              <Link href="/account">
                <button className="btn-secondary h-11 px-5 text-xs font-semibold border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white transition-all flex items-center gap-2">
                  <span>Join Ramillette Rewards</span>
                  <ArrowRight size={15} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
