"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#1c1c1c] text-[#eaeaea] pt-16 pb-8 border-t border-[#2a2a2a]">
      <div className="ramillette-container">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2d2d2d]">
          {/* Col 1: Brand & Boutique Location */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-extrabold text-2xl tracking-[0.18em] text-white uppercase font-heading">
                Ramillette
              </span>
              <span className="block text-[10px] tracking-[0.25em] text-[#faedcd] uppercase font-semibold">
                Luxury Perfumes • Qatar
              </span>
            </Link>

            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              An upscale regional fragrance house blending traditional Middle Eastern oud, amber, and musk with contemporary European perfumery. Handcrafted for discerning connoisseurs.
            </p>

            <div className="space-y-2 text-xs text-neutral-300 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-[#faedcd] shrink-0 mt-0.5" />
                <span>Souq Al Wakra, Heritage Village, Doha, Qatar</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-[#faedcd] shrink-0" />
                <span>+974 5555 1234 / +974 6600 7788</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-[#faedcd] shrink-0" />
                <span>contact@ramillette.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Fragrance Collections */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 text-[#faedcd]">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link
                  href="/shop/own-brand"
                  className="hover:text-white transition-colors"
                >
                  Own Brand (Amber Code)
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/inspired"
                  className="hover:text-white transition-colors"
                >
                  Inspired Fragrances
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/luxury-perfumes"
                  className="hover:text-white transition-colors"
                >
                  Luxury Arabian Perfumes
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/best-sellers"
                  className="hover:text-white transition-colors"
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/new-arrivals"
                  className="hover:text-white transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 text-[#faedcd]">
              Customer Service
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link
                  href="/pages/about-us"
                  className="hover:text-white transition-colors"
                >
                  About Our Brand
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact & Visit Us
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/faqs"
                  className="hover:text-white transition-colors"
                >
                  FAQs & Delivery
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/cancellation-policy"
                  className="hover:text-white transition-colors"
                >
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/returns-policy"
                  className="hover:text-white transition-colors"
                >
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/refund-policy"
                  className="hover:text-white transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/exchange-policy"
                  className="hover:text-white transition-colors"
                >
                  Exchange Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter Club */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 text-[#faedcd]">
              Fragrance Club
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Subscribe to receive exclusive access to private perfume launches, VIP discounts, and seasonal Qatar scents.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-700/50 rounded-[5px] text-xs text-emerald-300">
                <CheckCircle2 size={16} />
                <span>Thank you for joining Ramillette VIP!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-[#272727] text-white placeholder:text-neutral-500 text-xs px-3 py-2.5 rounded-[5px] border border-[#3b3b3b] focus:outline-none focus:border-[#b6713e]"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full h-10 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <span>Subscribe</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Ramillette Perfumes Qatar. All rights reserved.</p>

          {/* Payment Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] text-neutral-400 font-medium">
              Accepted in Qatar:
            </span>
            <span className="px-2 py-1 bg-[#282828] text-neutral-300 rounded text-[11px] font-semibold border border-[#3a3a3a]">
              Cash on Delivery (COD)
            </span>
            <span className="px-2 py-1 bg-[#282828] text-neutral-300 rounded text-[11px] font-semibold border border-[#3a3a3a]">
              Debit / NAPS
            </span>
            <span className="px-2 py-1 bg-[#282828] text-neutral-300 rounded text-[11px] font-semibold border border-[#3a3a3a]">
              Visa / Mastercard
            </span>
            <span className="px-2 py-1 bg-[#282828] text-neutral-300 rounded text-[11px] font-semibold border border-[#3a3a3a]">
              Apple Pay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
