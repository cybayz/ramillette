import React from "react";
import prisma from "@/lib/db/prisma";
import { OrdersTable, AdminOrder } from "@/components/admin/OrdersTable";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const [ordersRaw, dbCountries] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.country.findMany({
      select: { code: true, name: true, flag: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const orders: AdminOrder[] = ordersRaw.map((o) => {
    const shipping: any = o.shippingAddress || {};
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerEmail: o.customerEmail,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      total: Number(o.total),
      subtotal: Number(o.subtotal),
      shippingFee: Number(o.shipping),
      discount: Number(o.discount),
      tax: Number(o.tax),
      currency: o.currency || "QAR",
      country: o.country || "QA",
      city: shipping.city || "",
      addressLine1: shipping.addressLine1 || "",
      area: shipping.area,
      deliveryNotes: o.deliveryNotes,
      adminNotes: o.adminNotes,
      isGift: o.isGift,
      giftMessage: o.giftMessage,
      hasGiftWrap: o.hasGiftWrap,
      giftWrapFee: Number(o.giftWrapFee || 0),
      paymentGatewayRef: o.paymentGatewayRef,
      carrierName: o.carrierName,
      trackingNumber: o.trackingNumber,
      trackingUrl: o.trackingUrl,
      shippedAt: o.shippedAt ? o.shippedAt.toISOString() : null,
      itemsCount: o.items.length,
      items: o.items.map((it) => ({
        id: it.id,
        productName: it.productName,
        variantName: it.variantName,
        sku: it.sku,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice),
        total: Number(it.total),
      })),
      createdAt: o.createdAt.toISOString(),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1c1c1c]">
          Order Fulfillment & Regional Logistics
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Review placed orders across Qatar, UAE, and Bahrain. Track cash on delivery, card gateway refs, and update fulfillment status.
        </p>
      </div>

      <OrdersTable initialOrders={orders} availableCountries={dbCountries} />
    </div>
  );
}
