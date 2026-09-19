import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      status,
      paymentStatus,
      fulfillmentStatus,
      trackingNumber,
      trackingUrl,
      carrierName,
      shippedAt,
    } = body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;
    if (fulfillmentStatus) dataToUpdate.fulfillmentStatus = fulfillmentStatus;
    if (trackingNumber !== undefined) dataToUpdate.trackingNumber = trackingNumber ? trackingNumber.trim() : null;
    if (trackingUrl !== undefined) dataToUpdate.trackingUrl = trackingUrl ? trackingUrl.trim() : null;
    if (carrierName !== undefined) dataToUpdate.carrierName = carrierName ? carrierName.trim() : null;
    if (shippedAt !== undefined) {
      dataToUpdate.shippedAt = shippedAt ? new Date(shippedAt) : null;
    } else if (status === "SHIPPED") {
      dataToUpdate.shippedAt = new Date();
      dataToUpdate.fulfillmentStatus = "FULFILLED";
    }

    let updated;
    try {
      updated = await prisma.order.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (prismaErr: any) {
      console.warn("Prisma update failed, applying raw SQL fallback:", prismaErr?.message);
      await prisma.$executeRawUnsafe(
        `UPDATE "Order" SET 
          "status" = COALESCE($1::"OrderStatus", "status"),
          "fulfillmentStatus" = COALESCE($2::"FulfillmentStatus", "fulfillmentStatus"),
          "carrierName" = $3,
          "trackingNumber" = $4,
          "trackingUrl" = $5,
          "shippedAt" = $6,
          "updatedAt" = NOW()
        WHERE "id" = $7`,
        dataToUpdate.status || null,
        dataToUpdate.fulfillmentStatus || null,
        dataToUpdate.carrierName || null,
        dataToUpdate.trackingNumber || null,
        dataToUpdate.trackingUrl || null,
        dataToUpdate.shippedAt || null,
        id
      );
      updated = await prisma.order.findUnique({ where: { id } });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
