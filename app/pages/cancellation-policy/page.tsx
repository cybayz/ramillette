import React from "react";
import type { Metadata } from "next";
import { PolicyPageLayout } from "@/components/policy/PolicyPageLayout";

export const metadata: Metadata = {
  title: "Order Cancellation Policy | Ramillette Perfumes Qatar",
  description:
    "Clear terms for cancellations, returns, refunds, and exchanges — crafted with the same care as our fragrances.",
};

const cancellationSections = [
  {
    title: "Order Cancellation",
    items: [
      "Orders may only be cancelled before they have been processed or dispatched.",
      "Once an order has been processed, packed, or shipped, it cannot be cancelled, modified, or recalled.",
      "Cancellation requests are processed on a best-effort basis and are not guaranteed.",
      "Customers must contact our support team immediately if they wish to request a cancellation.",
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

const cancellationSectionsAr = [
  {
    title: "إلغاء الطلب",
    items: [
      "يمكن إلغاء الطلبات فقط قبل معالجتها أو شحنها مع شركة التوصيل.",
      "بمجرد معالجة الطلب أو تغليفه أو شحنه، لا يمكن إلغاؤه أو تعديله أو استرجاعه أثناء النقل.",
      "تتم معالجة طلبات الإلغاء على أساس بذل أقصى جهد ولا يمكن ضمانها دائماً نظراً لسرعة الشحن.",
      "يجب على العملاء الاتصال بفريق الدعم لدينا على الفور إذا كانوا يرغبون في طلب الإلغاء.",
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

export default function CancellationPolicyPage() {
  return (
    <PolicyPageLayout
      currentSlug="cancellation-policy"
      title="Order Cancellation Policy"
      titleAr="سياسة إلغاء الطلب"
      sections={cancellationSections}
      sectionsAr={cancellationSectionsAr}
    />
  );
}
