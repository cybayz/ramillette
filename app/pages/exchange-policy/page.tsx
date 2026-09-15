import React from "react";
import type { Metadata } from "next";
import { PolicyPageLayout } from "@/components/policy/PolicyPageLayout";

export const metadata: Metadata = {
  title: "Exchange Policy | Ramillette Perfumes Qatar",
  description:
    "Clear terms for cancellations, returns, refunds, and exchanges — crafted with the same care as our fragrances.",
};

const exchangeSections = [
  {
    title: "Exchange Policy",
    items: [
      "Exchanges are only available for transit damage, incorrect deliveries, or verified manufacturing defects.",
    ],
  },
  {
    title: "Related Conditions",
    items: [
      "Claims must be submitted within 48 hours of delivery with the order number, photos/videos of the product and packaging, and a description.",
      "Approved exchanges must be for products that are unopened and unused (unless the issue is a verified defect or incorrect item), in original packaging, and pre-authorized by Ramillette.",
      "Slight variations in packaging, labels, or batch appearance do not affect authenticity or quality and are not considered defects.",
    ],
  },
  {
    title: "Limitation of Liability",
    items: [
      "Ramillette reserves the right to reject claims that do not comply with this policy.",
      "Ramillette is not responsible for delays caused by carriers, customs, payment providers, or events beyond its reasonable control.",
      "By placing an order, customers acknowledge and agree to this policy.",
    ],
  },
];

const exchangeSectionsAr = [
  {
    title: "سياسة الاستبدال",
    items: [
      "الاستبدال متاح فقط في حالات التلف أثناء النقل، أو التسليم غير الصحيح، أو العيوب التصنيعية المؤكدة.",
    ],
  },
  {
    title: "الشروط ذات الصلة",
    items: [
      "يجب تقديم المطالبات في غضون 48 ساعة من التسليم مع رقم الطلب، وصور/فيديوهات للمنتج والتغليف، ووصف للمشكلة.",
      "يجب أن تكون الاستبدالات المعتمدة لمنتجات غير مفتوحة وغير مستخدمة (ما لم تكن المشكلة عيباً مؤكداً أو عنصراً غير صحيح)، وفي عبوتها الأصلية، ومصرح بها مسبقاً من راميلليت.",
      "الفروق الطفيفة في التغليف أو الملصقات أو مظهر الدفعة لا تؤثر على الأصالة أو الجودة ولا تعتبر عيوباً.",
    ],
  },
  {
    title: "حدود المسؤولية",
    items: [
      "تحتفظ راميلليت بالحق في رفض أي مطالبات لا تتوافق مع هذه السياسة.",
      "راميلليت غير مسؤولة عن التأخير الناجم عن شركات النقل أو الجمارك أو مزودي الدفع أو الأحداث الخارجة عن سيطرتها المعقولة.",
      "من خلال تقديم الطلب، يقر العملاء ويوافقون على هذه السياسة.",
    ],
  },
];

export default function ExchangePolicyPage() {
  return (
    <PolicyPageLayout
      currentSlug="exchange-policy"
      title="Exchange Policy"
      titleAr="سياسة الاستبدال"
      sections={exchangeSections}
      sectionsAr={exchangeSectionsAr}
    />
  );
}
