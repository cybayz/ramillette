"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useLanguageStore } from "@/lib/store/useLanguageStore";

export function ValueProps() {
  const pathname = usePathname();
  const { language } = useLanguageStore();
  const isAr = pathname?.startsWith("/ar") || language === "ar";

  const services = isAr
    ? [
        {
          icon: (
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h11v9H3z" />
              <path d="M14 11h3.2L20 14v3h-6" />
              <circle cx="7" cy="18.5" r="1.5" />
              <circle cx="17" cy="18.5" r="1.5" />
              <path d="M7 8V6.5A1.5 1.5 0 018.5 5H12" />
            </svg>
          ),
          title: "التوصيل في جميع أنحاء قطر",
          description: "تغليف آمن ودقيق",
        },
        {
          icon: (
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
              <path d="M2.5 10h19" />
              <path d="M7 15h3" />
            </svg>
          ),
          title: "الدفع عند الاستلام",
          description: "ادفع عند الاستلام",
        },
        {
          icon: (
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3.2l7.5 2.8v5.2c0 4.7-3.2 8.1-7.5 9.6-4.3-1.5-7.5-4.9-7.5-9.6V6L12 3.2z" />
              <path d="M9.2 12.1l1.9 1.9 3.7-3.8" />
            </svg>
          ),
          title: "ضمان استعادة الأموال",
          description: "استرداد الأموال خلال 7 أيام",
        },
        {
          icon: (
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 4.5c0 0 1.2 2 3 2s3-2 3-2" />
              <path d="M8 9.5c1.2-.9 2.6-1.3 4-1.3s2.8.4 4 1.3" />
              <path d="M7 14.2c1.6-1.1 3.3-1.6 5-1.6s3.4.5 5 1.6" />
              <path d="M6.5 19c1.9-1.2 3.7-1.8 5.5-1.8s3.6.6 5.5 1.8" />
            </svg>
          ),
          title: "ثبات يدوم طويلاً",
          description: "تركيز عالي، يدوم طوال اليوم",
        },
      ]
    : [
        {
          icon: (
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h11v9H3z" />
              <path d="M14 11h3.2L20 14v3h-6" />
              <circle cx="7" cy="18.5" r="1.5" />
              <circle cx="17" cy="18.5" r="1.5" />
              <path d="M7 8V6.5A1.5 1.5 0 018.5 5H12" />
            </svg>
          ),
          title: "Delivery Across Qatar",
          description: "Safe & careful packaging",
        },
        {
          icon: (
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
              <path d="M2.5 10h19" />
              <path d="M7 15h3" />
            </svg>
          ),
          title: "Cash On Delivery",
          description: "Pay when you receive",
        },
        {
          icon: (
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3.2l7.5 2.8v5.2c0 4.7-3.2 8.1-7.5 9.6-4.3-1.5-7.5-4.9-7.5-9.6V6L12 3.2z" />
              <path d="M9.2 12.1l1.9 1.9 3.7-3.8" />
            </svg>
          ),
          title: "Money Back Guarantee",
          description: "Refund within 7 days",
        },
        {
          icon: (
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 4.5c0 0 1.2 2 3 2s3-2 3-2" />
              <path d="M8 9.5c1.2-.9 2.6-1.3 4-1.3s2.8.4 4 1.3" />
              <path d="M7 14.2c1.6-1.1 3.3-1.6 5-1.6s3.4.5 5 1.6" />
              <path d="M6.5 19c1.9-1.2 3.7-1.8 5.5-1.8s3.6.6 5.5 1.8" />
            </svg>
          ),
          title: "Premium Longevity",
          description: "Parfum concentration, all-day wear",
        },
      ];

  return (
    <section className="py-8 md:py-12 bg-white border-t border-neutral-200/80">
      <div className="ramillette-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {services.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 md:gap-3.5 p-2 rounded-xl"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-[14px] flex items-center justify-center bg-[#4e6648]/10 text-[#4e6648] border border-[#4e6648]/15">
                {item.icon}
              </div>
              <div className="text-start">
                <b className="block text-[13.5px] md:text-[15px] font-bold text-[#1a1a1a] leading-tight">
                  {item.title}
                </b>
                <small className="block text-[11.5px] md:text-[12.5px] text-neutral-500 mt-1 leading-snug">
                  {item.description}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
