import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, canFulfillOrders } from "@/lib/erp/context";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  try {
    const user = await getErpUser();
    if (!user || !canFulfillOrders(user.role)) {
      return NextResponse.json({ error: "Unauthorized: Insufficient fulfillment permissions" }, { status: 403 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        packedAt: new Date(),
        status: "PROCESSING",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Order #${order.orderNumber} marked as packed`,
      order: updated,
    });
  } catch (error: any) {
    console.error("Order packing error:", error);
    return NextResponse.json({ error: error?.message || "Failed to mark order as packed" }, { status: 500 });
  }
}
