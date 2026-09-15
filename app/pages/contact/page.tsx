"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#ffffff] min-h-screen py-12">
      <div className="ramillette-container max-w-5xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">Contact Us</span>
        </nav>

        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b6713e]">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1c1c1c] mt-1">
            Visit Our Boutique or Contact Us
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Questions about an order, fragrance consultations, or corporate gifting? We'd love to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Boutique Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-[8px] bg-[#fbf9f5] border border-[#ecdec1] space-y-5">
              <h2 className="text-base font-bold text-[#1c1c1c] pb-3 border-b border-[#e5e5e5]">
                Flagship Boutique
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#b6713e] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1c1c1c] block">
                      Location
                    </span>
                    <p className="text-neutral-600 mt-0.5">
                      Souq Al Wakra Heritage Village, Building 45, Doha, Qatar
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-[#b6713e] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1c1c1c] block">
                      Phone & WhatsApp
                    </span>
                    <p className="text-neutral-600 mt-0.5">+974 5555 1234</p>
                    <p className="text-neutral-600">+974 6600 7788</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-[#b6713e] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1c1c1c] block">Email</span>
                    <p className="text-neutral-600 mt-0.5">contact@ramillette.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-[#b6713e] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1c1c1c] block">
                      Boutique Hours
                    </span>
                    <p className="text-neutral-600 mt-0.5">
                      Saturday – Thursday: 10:00 AM – 10:00 PM
                    </p>
                    <p className="text-neutral-600">
                      Friday: 2:00 PM – 10:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-[8px] bg-white border border-[#e5e5e5] shadow-xs">
              {submitted ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#0d9d00] flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1c1c1c]">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Thank you for reaching out to Ramillette. Our fragrance concierge will respond to you within 2 business hours.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-xs h-9 px-4"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-base font-bold text-[#1c1c1c] mb-2">
                    Send Us a Direct Message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+974 5555 1234"
                        className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we assist you with our perfumes or deliveries in Qatar?"
                      className="w-full text-xs p-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full h-12 text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    <span>Submit Message</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
