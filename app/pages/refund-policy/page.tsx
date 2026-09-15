import React from "react";
import type { Metadata } from "next";
import { PolicyPageLayout } from "@/components/policy/PolicyPageLayout";

export const metadata: Metadata = {
  title: "Refund Policy | Ramillette Perfumes Qatar",
  description:
    "Clear terms for cancellations, returns, refunds, and exchanges — crafted with the same care as our fragrances.",
};

const refundSections = [
  {
    title: "Refund Policy",
    items: [
      "Refunds are issued only after inspection and approval.",
      "Refunds are processed to the original payment method whenever possible.",
      "Shipping, delivery, customs, and processing charges are non-refundable unless the error was caused solely by Ramillette.",
      "No refunds for opened products, unauthorized returns, misuse, late claims, or cosmetic packaging variations.",
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

const refundSectionsAr = [
  {
    title: "سياسة الاسترداد",
    items: [
      "يتم إصدار المبالغ المستردة فقط بعد فحص المنتج والموافقة عليه.",
      "تتم معالجة المبالغ المستردة إلى طريقة الدفع الأصلية كلما كان ذلك ممكناً.",
      "رسوم الشحن والتسليم والجمارك والمعالجة غير قابلة للاسترداد ما لم يكن الخطأ ناتجاً فقط عن راميلليت.",
      "لا يتم استرداد الأموال للمنتجات المفتوحة، أو المرتجعات غير المصرح بها، أو سوء الاستخدام، أو المطالبات المتأخرة، أو الفروق التجميلية في التغليف.",
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

export default function RefundPolicyPage() {
  return (
    <PolicyPageLayout
      currentSlug="refund-policy"
      title="Refund Policy"
      titleAr="سياسة الاسترداد"
      sections={refundSections}
      sectionsAr={refundSectionsAr}
    />
  );
}
