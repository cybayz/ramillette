import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { OrderDetailView } from "@/components/admin/OrderDetailView";
import { InvoiceOrderData } from "@/lib/admin/invoiceUtils";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function AdminOrderDetailPage({ params }: OrderPageProps) {
  const { id } = await params;

  const orderRaw = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!orderRaw) {
    notFound();
  }

  const shipping: any = orderRaw.shippingAddress || {};

  const order: InvoiceOrderData = {
    id: orderRaw.id,
    orderNumber: orderRaw.orderNumber,
    customerName: orderRaw.customerName,
    customerPhone: orderRaw.customerPhone,
    customerEmail: orderRaw.customerEmail,
    status: orderRaw.status,
    paymentStatus: orderRaw.paymentStatus,
    fulfillmentStatus: orderRaw.fulfillmentStatus,
    paymentMethod: orderRaw.paymentMethod,
    total: Number(orderRaw.total),
    subtotal: Number(orderRaw.subtotal),
    shippingFee: Number(orderRaw.shipping),
    discount: Number(orderRaw.discount),
    tax: Number(orderRaw.tax),
    currency: orderRaw.currency || "QAR",
    country: orderRaw.country || "QA",
    city: shipping.city || "",
    addressLine1: shipping.addressLine1 || "",
    area: shipping.area || null,
    deliveryNotes: orderRaw.deliveryNotes,
    adminNotes: orderRaw.adminNotes,
    isGift: orderRaw.isGift,
    giftMessage: orderRaw.giftMessage,
    hasGiftWrap: orderRaw.hasGiftWrap,
    giftWrapFee: Number(orderRaw.giftWrapFee || 0),
    paymentGatewayRef: orderRaw.paymentGatewayRef,
    carrierName: orderRaw.carrierName,
    trackingNumber: orderRaw.trackingNumber,
    trackingUrl: orderRaw.trackingUrl,
    shippedAt: orderRaw.shippedAt ? orderRaw.shippedAt.toISOString() : null,
    createdAt: orderRaw.createdAt.toISOString(),
    items: orderRaw.items.map((it) => ({
      id: it.id,
      productName: it.productName,
      variantName: it.variantName,
      sku: it.sku,
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice),
      total: Number(it.total),
    })),
  };

  return <OrderDetailView initialOrder={order} />;
}
