import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { getErpUser } from "@/lib/erp/context";
import { ErpInvoiceTemplate, ErpInvoiceData } from "@/components/erp/ErpInvoiceTemplate";
import { ArrowLeft } from "lucide-react";

interface ErpInvoicePageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function ErpOrderInvoicePage({ params }: ErpInvoicePageProps) {
  const user = await getErpUser();
  if (!user) {
    redirect("/account/login?redirect=/erp/orders");
  }

  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  // Search by ID or orderNumber using findUnique
  let order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      pickupStore: true,
    },
  });

  if (!order) {
    order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      include: {
        items: true,
        pickupStore: true,
      },
    });
  }

  if (!order) {
    notFound();
  }

  // Resolve Store details
  let storeName = order.pickupStore?.name;
  let storePhone = order.pickupStore?.phone;

  if (!storeName && order.assignedStoreId) {
    try {
      const assigned = await prisma.store.findUnique({
        where: { id: order.assignedStoreId },
      });
      if (assigned) {
        storeName = assigned.name;
        storePhone = assigned.phone;
      }
    } catch {
      // Fallback
    }
  }

  if (!storeName) {
    storeName = "AL WAKRA SOUQ";
    storePhone = "+974 6609 7444";
  }

  // Safely check posPayments if available
  let posPayments: any[] = [];
  try {
    posPayments = await (prisma as any).posPayment?.findMany({
      where: { orderId: order.id },
    }) || [];
  } catch {
    posPayments = [];
  }

  // Calculate discount percent if applicable
  const subtotal = Number(order.subtotal);
  const discount = Number(order.discount);
  let discountPercent: string | null = null;
  if (discount > 0 && subtotal > 0) {
    discountPercent = `${Math.round((discount / subtotal) * 100)}%`;
  }

  const primaryPayment = posPayments[0]?.paymentMethod || order.paymentMethod || "CARD";
  const total = Number(order.total);
  const paidTotal = posPayments.length > 0
    ? posPayments.reduce((acc, p) => acc + Number(p.amount), 0)
    : total;

  const invoiceData: ErpInvoiceData = {
    orderNumber: order.orderNumber,
    invoiceNumber: order.orderNumber,
    storeName,
    storePhone,
    cashierName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
    customerName: order.customerName,
    createdAt: order.createdAt,
    items: order.items.map((it) => ({
      id: it.id,
      name: it.productName,
      subtitle: "Extrait De Parfum",
      variantName: it.variantName || (it.productName.match(/\((.*?)\)/)?.[1] ?? null),
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice),
      total: Number(it.total),
    })),
    subtotal,
    discount,
    discountPercent,
    tax: Number(order.tax),
    total,
    currency: order.currency || "QAR",
    paymentMethod: primaryPayment,
    paidAmount: paidTotal,
    balance: Math.max(0, paidTotal - total),
    qrPayload: `https://www.ramillette.com/?invoice=${encodeURIComponent(order.orderNumber)}`,
    websiteUrl: "WWW.RAMILLETTE.COM",
  };

  return (
    <div className="min-h-screen bg-[#141414] py-8 px-4 print:bg-white print:p-0">
      <div className="max-w-md mx-auto space-y-4">
        {/* Navigation & Actions: Hidden when printing */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/erp/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Orders Hub</span>
          </Link>
          <span className="text-[11px] font-mono text-[#faedcd] uppercase tracking-wider font-bold">
            Store Invoice #{order.orderNumber}
          </span>
        </div>

        {/* Invoice Receipt Canvas */}
        <ErpInvoiceTemplate receipt={invoiceData} showPrintButton={true} />
      </div>
    </div>
  );
}
