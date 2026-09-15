import React from "react";
import type { Metadata } from "next";
import { PolicyPageLayout } from "@/components/policy/PolicyPageLayout";

export const metadata: Metadata = {
  title: "Returns Policy | Ramillette Perfumes Qatar",
  description:
    "Clear terms for cancellations, returns, refunds, and exchanges — crafted with the same care as our fragrances.",
};

const returnsSections = [
  {
    title: "Returns",
    items: [
      "All perfume sales are considered final except where the wrong item was delivered, the product was damaged during shipping, or a verified manufacturing defect exists.",
      "Returns are not accepted for opened or used products, broken seals, misuse, improper storage, change of mind, fragrance preference, or promotional/clearance purchases unless defective.",
      "Claims must be submitted within 48 hours of delivery with the order number, photos/videos of the product and packaging, and a description.",
      "Approved returns must be unopened, unused, in original packaging, and pre-authorized by Ramillette.",
    ],
  },
  {
    title: "Damaged or Incorrect Orders",
    items: [
      "Customers must inspect orders upon delivery and report issues within 48 hours with supporting photographs.",
      "After verification, Ramillette may provide a replacement or refund at its sole discretion.",
    ],
  },
  {
    title: "Product Information",
    items: [
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

const returnsSectionsAr = [
  {
    title: "الإرجاع",
    items: [
      "تعتبر جميع مبيعات العطور نهائية باستثناء الحالات التي تم فيها تسليم منتج خاطئ، أو تلف المنتج أثناء الشحن، أو وجود عيب تصنيعي مؤكد.",
      "لا يُقبل إرجاع المنتجات المفتوحة أو المستخدمة، أو الأختام المكسورة، أو سوء الاستخدام، أو التخزين غير المناسب، أو تغيير الرأي، أو تفضيل الرائحة، أو مشتريات العروض الترويجية والتصفية إلا إذا كانت معيبة.",
      "يجب تقديم المطالبات في غضون 48 ساعة من التسليم مع رقم الطلب، وصور/فيديوهات للمنتج والتغليف، ووصف للمشكلة.",
      "يجب أن تكون المرتجعات المعتمدة غير مفتوحة وغير مستخدمة وفي عبوتها الأصلية ومصرح بها مسبقاً من راميلليت.",
    ],
  },
  {
    title: "الطلبات التالفة أو غير الصحيحة",
    items: [
      "يجب على العملاء فحص الطلبات فور الاستلام والإبلاغ عن أي مشاكل خلال 48 ساعة مع إرفاق الصور التوضيحية.",
      "بعد التحقق، يجوز لراميلليت توفير بديل أو استرداد وفقاً لتقديرها الخاص.",
    ],
  },
  {
    title: "معلومات المنتج",
    items: [
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

export default function ReturnsPolicyPage() {
  return (
    <PolicyPageLayout
      currentSlug="returns-policy"
      title="Returns Policy"
      titleAr="سياسة الإرجاع"
      sections={returnsSections}
      sectionsAr={returnsSectionsAr}
    />
  );
}
