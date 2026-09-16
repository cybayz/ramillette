import React from "react";
import { notFound } from "next/navigation";
import AboutUsPage from "@/app/pages/about-us/page";
import ContactPage from "@/app/pages/contact/page";
import WishlistPage from "@/app/pages/wishlist/page";
import PrivacyPolicyPage from "@/app/pages/privacy-policy/page";
import RefundPolicyPage from "@/app/pages/refund-policy/page";
import ReturnsPolicyPage from "@/app/pages/returns-policy/page";
import TermsPage from "@/app/pages/term-and-services/page";
import ExchangePolicyPage from "@/app/pages/exchange-policy/page";
import CancellationPolicyPage from "@/app/pages/cancellation-policy/page";
import FaqsPage from "@/app/pages/faqs/page";
import HelpPage from "@/app/pages/help/page";
import type { Metadata } from "next";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const titles: Record<string, string> = {
    "about-us": "نبذة عنا | عطور راميليت قطر",
    contact: "اتصل بنا | عطور راميليت قطر",
    wishlist: "المفضلة | عطور راميليت قطر",
    "privacy-policy": "سياسة الخصوصية | عطور راميليت قطر",
    "refund-policy": "سياسة الاسترداد | عطور راميليت قطر",
    "returns-policy": "سياسة الإرجاع | عطور راميليت قطر",
    "term-and-services": "الشروط والأحكام | عطور راميليت قطر",
    "exchange-policy": "سياسة الاستبدال | عطور راميليت قطر",
    "cancellation-policy": "سياسة الإلغاء | عطور راميليت قطر",
    faqs: "الأسئلة الشائعة | عطور راميليت قطر",
    help: "المساعدة | عطور راميليت قطر",
  };

  return {
    title: titles[slug] || "عطور راميليت قطر",
  };
}

export default async function ArabicPagesRouter({ params }: PageProps) {
  const { slug } = await params;

  switch (slug) {
    case "about-us":
      return <AboutUsPage />;
    case "contact":
      return <ContactPage />;
    case "wishlist":
      return <WishlistPage />;
    case "privacy-policy":
      return <PrivacyPolicyPage />;
    case "refund-policy":
      return <RefundPolicyPage />;
    case "returns-policy":
      return <ReturnsPolicyPage />;
    case "term-and-services":
    case "terms":
    case "terms-and-conditions":
      return <TermsPage />;
    case "exchange-policy":
      return <ExchangePolicyPage />;
    case "cancellation-policy":
      return <CancellationPolicyPage />;
    case "faqs":
    case "faq":
      return <FaqsPage />;
    case "help":
      return <HelpPage />;
    default:
      notFound();
  }
}
