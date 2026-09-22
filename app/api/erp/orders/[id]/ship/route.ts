import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore, canFulfillOrders } from "@/lib/erp/context";
import { fulfillReservedStock } from "@/lib/inventory/inventoryService";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  try {
    const user = await getErpUser();
    if (!user || !canFulfillOrders(user.role)) {
      return NextResponse.json({ error: "Unauthorized: Insufficient fulfillment permissions" }, { status: 403 });
    }

    const storeContext = await getActiveErpStore();
    if (!storeContext) {
      return NextResponse.json({ error: "No active store context found" }, { status: 400 });
    }

    const { id } = await params;
    const body = await request.json();
    const { carrierName, trackingNumber, trackingUrl } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const storeId = order.assignedStoreId || storeContext.store.id;

    // Execute atomic dispatch: convert reserved quantity into physical stock deduction
    const updated = await prisma.$transaction(async (tx) => {
      for (const it of order.items) {
        if (!it.productId) continue;
        await fulfillReservedStock(
          {
            storeId,
            productId: it.productId,
            variantId: it.variantId || null,
            quantity: it.quantity,
            referenceId: order.orderNumber,
            performedById: user.id,
          },
          tx
        );
      }

      return await tx.order.update({
        where: { id },
        data: {
          status: "SHIPPED",
          fulfillmentStatus: "FULFILLED",
          shippedAt: new Date(),
          carrierName: carrierName?.trim() || "Ramillette Express Courier",
          trackingNumber: trackingNumber?.trim() || null,
          trackingUrl: trackingUrl?.trim() || null,
        },
        include: { items: true },
      });
    });

    // Asynchronously dispatch notifications / logs
    try {
      if (trackingNumber) {
        console.log(
          `[SMS/Notification: ${order.country}] Order #${order.orderNumber} shipped to ${order.customerPhone} via ${carrierName || "our courier"}. Tracking: ${trackingNumber}`
        );
      }
    } catch (notifErr) {
      console.warn("Non-blocking dispatch notice error:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: `Order #${order.orderNumber} successfully shipped and inventory finalized`,
      order: updated,
    });
  } catch (error: any) {
    console.error("Order shipping error:", error);
    return NextResponse.json({ error: error?.message || "Failed to mark order as shipped" }, { status: 500 });
  }
}
