import React from "react";
import { ErpInvoiceTemplate, ErpInvoiceData } from "@/components/erp/ErpInvoiceTemplate";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Invoice Template Preview | Ramillette ERP",
  description: "Preview of the Ramillette luxury thermal invoice template.",
};

const sampleReceipt: ErpInvoiceData = {
  orderNumber: "RP-2026-0021",
  invoiceNumber: "RP-2026-0021",
  storeName: "AL WAKRA SOUQ",
  storePhone: "+974 6609 7444",
  cashierName: "SAJJAD",
  createdAt: new Date("2026-09-12T00:00:00"),
  items: [
    {
      id: "1",
      name: "AMBER CODE",
      subtitle: "Extrait De Parfum",
      variantName: "80 ml",
      quantity: 1,
      unitPrice: 110.0,
      total: 110.0,
    },
    {
      id: "2",
      name: "SUMMER OUD",
      subtitle: "Extrait De Parfum",
      variantName: "100 ml",
      quantity: 1,
      unitPrice: 92.0,
      total: 92.0,
    },
    {
      id: "3",
      name: "HAWAS ICE",
      subtitle: "Extrait De Parfum",
      variantName: "100 ml",
      quantity: 2,
      unitPrice: 60.0,
      total: 120.0,
    },
  ],
  subtotal: 230.0,
  discount: 20.0,
  discountPercent: "20%",
  tax: 0,
  total: 210.0,
  currency: "QAR",
  paymentMethod: "CARD",
  paidAmount: 210.0,
  balance: 0.0,
  qrPayload: "https://www.ramillette.com",
  websiteUrl: "WWW.RAMILLETTE.COM",
};

export default function InvoicePreviewPage() {
  return (
    <div className="min-h-screen bg-[#141414] py-10 px-4 print:bg-white print:p-0">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/erp"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to ERP</span>
          </Link>
          <span className="text-[11px] font-mono text-[#faedcd] uppercase tracking-wider font-bold">
            Live Invoice Template
          </span>
        </div>

        <ErpInvoiceTemplate receipt={sampleReceipt} showPrintButton={true} />
      </div>
    </div>
  );
}
