import React from "react";
import prisma from "@/lib/db/prisma";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const ordersRaw = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const orders = ordersRaw.map((o) => {
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
      area: shipping.area,
      itemsCount: o.items.length,
      createdAt: o.createdAt.toISOString(),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1c1c1c]">
          Order Fulfillment & Management
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Review placed orders, update delivery status for Qatar couriers, and track cash on delivery payments.
        </p>
      </div>

      <OrdersTable initialOrders={orders} />
    </div>
  );
}
