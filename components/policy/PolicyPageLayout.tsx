"use client";

import React from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store/useLanguageStore";

export interface PolicySection {
  title: string;
  items?: string[];
  content?: React.ReactNode;
}

interface PolicyPageLayoutProps {
  currentSlug: "cancellation-policy" | "returns-policy" | "refund-policy" | "exchange-policy" | "privacy-policy" | "term-and-services";
  title: string;
  titleAr?: string;
  eyebrow?: string;
  eyebrowAr?: string;
  sub?: string;
  subAr?: string;
  intro?: string;
  introAr?: string;
  effectiveDate?: string;
  effectiveDateAr?: string;
  sections: PolicySection[];
  sectionsAr?: PolicySection[];
}

const POLICY_NAV = [
  {
    slug: "cancellation-policy",
    label: "Order Cancellation Policy",
    labelAr: "سياسة إلغاء الطلب",
    href: "/pages/cancellation-policy",
  },
  {
    slug: "returns-policy",
    label: "Returns Policy",
    labelAr: "سياسة الإرجاع",
    href: "/pages/returns-policy",
  },
  {
    slug: "refund-policy",
    label: "Refund Policy",
    labelAr: "سياسة الاسترداد",
    href: "/pages/refund-policy",
  },
  {
    slug: "exchange-policy",
    label: "Exchange Policy",
    labelAr: "سياسة الاستبدال",
    href: "/pages/exchange-policy",
  },
];

export function PolicyPageLayout({
  currentSlug,
  title,
  titleAr,
  eyebrow = "Ramillette Policies",
  eyebrowAr = "سياسات راميلليت",
  sub = "Clear terms for cancellations, returns, refunds, and exchanges — crafted with the same care as our fragrances.",
  subAr = "شروط واضحة للإلغاء والإرجاع والاسترداد والاستبدال — صُممت بذات العناية التي نصنع بها عطورنا.",
  intro = "At Ramillette, every fragrance undergoes strict quality inspection before dispatch to ensure it reaches our customers in perfect condition. Due to the hygienic nature of perfumes and the inability to verify whether a fragrance has been used after delivery, all purchases are subject to the following terms and conditions.",
  introAr = "في راميلليت، يخضع كل عطر لفحص جودة دقيق قبل الشحن لضمان وصوله إلى عملائنا في أفضل حالة. ونظراً للطبيعة الصحية للعطور واستحالة التحقق مما إذا كان العطر قد استخدم بعد التسليم، تخضع جميع المشتريات للشروط والأحكام التالية.",
  effectiveDate = "July 9, 2026",
  effectiveDateAr = "9 يوليو 2026",
  sections,
  sectionsAr,
}: PolicyPageLayoutProps) {
  const { language } = useLanguageStore();
  const isArabic = language === "ar";

  const displayTitle = isArabic && titleAr ? titleAr : title;
  const displayEyebrow = isArabic && eyebrowAr ? eyebrowAr : eyebrow;
  const displaySub = isArabic && subAr ? subAr : sub;
  const displayIntro = isArabic && introAr ? introAr : intro;
  const displayDate = isArabic && effectiveDateAr ? effectiveDateAr : effectiveDate;
  const activeSections = isArabic && sectionsAr ? sectionsAr : sections;

  return (
    <div className="policy-page">
      {/* Policy Hero Header Banner */}
      <div className="policy-hero">
        <div className="ramillette-container max-w-[1240px] mx-auto">
          {/* Breadcrumb */}
          <nav className="policy-breadcrumb" aria-label="Breadcrumb">
            <Link href={isArabic ? "/ar" : "/"}>
              {isArabic ? "الرئيسية" : "Home"}
            </Link>
            <span className="policy-breadcrumb__sep" aria-hidden="true">/</span>
            <span>{isArabic ? "السياسات" : "Policies"}</span>
            <span className="policy-breadcrumb__sep" aria-hidden="true">/</span>
            <span className="policy-breadcrumb__current">{displayTitle}</span>
          </nav>

          {/* Eyebrow, Title & Subtitle */}
          <p className="policy-hero__eyebrow">{displayEyebrow}</p>
          <h1 className="policy-hero__title">{displayTitle}</h1>
          <p className="policy-hero__sub">{displaySub}</p>
        </div>
      </div>

      {/* Main Layout: Sticky Sidebar + Content Card */}
      <div className="ramillette-container max-w-[1240px] mx-auto">
        <div className="policy-layout">
          {/* Left Sidebar */}
          <aside className="policy-nav" aria-label="Policies">
            <h2 className="policy-nav__title">
              {isArabic ? "السياسات" : "Policies"}
            </h2>

            <ul className="policy-nav__list">
              {POLICY_NAV.map((item) => {
                const isActive = item.slug === currentSlug;
                return (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      scroll={true}
                      className={`policy-nav__link ${isActive ? "is-active" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {isArabic ? item.labelAr : item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="policy-nav__help">
              <p>
                {isArabic
                  ? "هل تحتاج مساعدة بخصوص طلبك؟"
                  : "Need help with an order?"}
              </p>
              <Link href="/pages/contact" scroll={true} className="policy-nav__cta">
                {isArabic ? "اتصل بنا" : "Contact us"}
              </Link>
            </div>
          </aside>

          {/* Right Policy Content Card */}
          <article className="policy-content">
            <div className="policy-rte rte">
              {displayIntro && <p>{displayIntro}</p>}

              {displayDate && (
                <p>
                  <em>
                    {isArabic
                      ? `تاريخ السريان: ${displayDate}`
                      : `Effective Date: ${displayDate}`}
                  </em>
                </p>
              )}

              {activeSections.map((sec, idx) => (
                <div key={idx}>
                  <h2>{sec.title}</h2>
                  {sec.items && sec.items.length > 0 && (
                    <ul>
                      {sec.items.map((item, itemIdx) => (
                        <li key={itemIdx}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {sec.content && <div>{sec.content}</div>}
                </div>
              ))}

              {/* Standard Policy Closure */}
              <h2>{isArabic ? "اتصل بنا" : "Contact Us"}</h2>
              <p>
                {isArabic ? (
                  <>
                    لأي استفسارات بخصوص طلبك أو الإرجاع أو الاسترداد أو الاستبدال، يُرجى التواصل مع{" "}
                    <Link href="/pages/contact">فريق خدمة العملاء</Link>.
                  </>
                ) : (
                  <>
                    For any questions regarding your order, returns, refunds, or exchanges, please contact our{" "}
                    <Link href="/pages/contact">customer support team</Link>.
                  </>
                )}
              </p>
              <p>
                {isArabic
                  ? "شكراً لاختياركم راميلليت — حيث يصبح العطر هوية."
                  : "Thank you for choosing Ramillette — where fragrance becomes identity."}
              </p>
            </div>

            {/* Policy Footer Help CTA */}
            <div className="policy-footer-cta">
              <div>
                <h3>
                  {isArabic ? "هل لا يزال لديك أسئلة؟" : "Still have questions?"}
                </h3>
                <p>
                  {isArabic
                    ? "فريق الدعم لدينا يسعد بمساعدتك في الإلغاء أو الإرجاع أو الاسترداد أو الاستبدال."
                    : "Our support team is happy to help with cancellations, returns, refunds, or exchanges."}
                </p>
              </div>

              <Link href="/pages/contact" scroll={true} className="policy-footer-cta__btn">
                {isArabic ? "اتصل بنا" : "Contact us"}
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
