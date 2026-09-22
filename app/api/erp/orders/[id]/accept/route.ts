import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore, canFulfillOrders } from "@/lib/erp/context";
import { reserveStockForOrder } from "@/lib/inventory/inventoryService";

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
    const storeId = storeContext.store.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Process acceptance in a transaction: ensure store assignment and reservation
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // If order was not yet reserved, reserve stock
      if (!order.acceptedAt) {
        for (const item of order.items) {
          if (!item.productId) continue;
          await reserveStockForOrder(
            {
              storeId,
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.quantity,
              referenceId: order.orderNumber,
              performedById: user.id,
            },
            tx
          );
        }
      }

      return await tx.order.update({
        where: { id },
        data: {
          assignedStoreId: storeId,
          status: "PROCESSING",
          acceptedAt: new Date(),
        },
        include: { items: true },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Order #${order.orderNumber} accepted and stock reserved`,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Order acceptance error:", error);
    return NextResponse.json({ error: error?.message || "Failed to accept order" }, { status: 500 });
  }
}
