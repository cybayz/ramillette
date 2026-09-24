import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore, canFulfillOrders } from "@/lib/erp/context";

export async function GET(request: Request) {
  try {
    const user = await getErpUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access to ERP" }, { status: 403 });
    }

    const storeContext = await getActiveErpStore();
    if (!storeContext) {
      return NextResponse.json({ error: "No active store context found" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage") || "all";
    const storeId = storeContext.store.id;

    // Filter by store assignment or country fulfillment pool
    const whereClause: any = {
      channel: "ONLINE",
      OR: [
        { assignedStoreId: storeId },
        {
          assignedStoreId: null,
          country: storeContext.store.countryCode,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      ],
    };

    if (stage === "new") {
      whereClause.fulfillmentStatus = "UNFULFILLED";
      whereClause.status = { in: ["PENDING", "CONFIRMED"] };
    } else if (stage === "picking") {
      whereClause.status = "PROCESSING";
      whereClause.pickedAt = null;
    } else if (stage === "packing") {
      whereClause.status = "PROCESSING";
      whereClause.pickedAt = { not: null };
      whereClause.packedAt = null;
    } else if (stage === "ready_to_ship") {
      whereClause.status = "PROCESSING";
      whereClause.packedAt = { not: null };
      whereClause.shippedAt = null;
    } else if (stage === "shipped") {
      whereClause.status = { in: ["SHIPPED", "DELIVERED"] };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
        assignedStore: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const counts = {
      newCount: await prisma.order.count({
        where: {
          channel: "ONLINE",
          assignedStoreId: storeId,
          fulfillmentStatus: "UNFULFILLED",
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      }),
      pickingCount: await prisma.order.count({
        where: {
          channel: "ONLINE",
          assignedStoreId: storeId,
          status: "PROCESSING",
          pickedAt: null,
        },
      }),
      packingCount: await prisma.order.count({
        where: {
          channel: "ONLINE",
          assignedStoreId: storeId,
          status: "PROCESSING",
          pickedAt: { not: null },
          packedAt: null,
        },
      }),
      readyToShipCount: await prisma.order.count({
        where: {
          channel: "ONLINE",
          assignedStoreId: storeId,
          status: "PROCESSING",
          packedAt: { not: null },
          shippedAt: null,
        },
      }),
      shippedTodayCount: await prisma.order.count({
        where: {
          channel: "ONLINE",
          assignedStoreId: storeId,
          status: { in: ["SHIPPED", "DELIVERED"] },
          shippedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    };

    return NextResponse.json({
      success: true,
      store: storeContext.context,
      counts,
      orders: orders.map((o) => {
        const addr: any = o.shippingAddress || {};
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          customerEmail: o.customerEmail,
          status: o.status,
          paymentStatus: o.paymentStatus,
          fulfillmentStatus: o.fulfillmentStatus,
          paymentMethod: o.paymentMethod,
          total: Number(o.total),
          subtotal: Number(o.subtotal),
          currency: o.currency,
          country: o.country,
          city: addr.city || addr.area || "",
          addressLine1: addr.addressLine1 || "",
          area: addr.area || null,
          itemsCount: o.items.length,
          acceptedAt: o.acceptedAt,
          pickedAt: o.pickedAt,
          packedAt: o.packedAt,
          shippedAt: o.shippedAt,
          carrierName: o.carrierName,
          trackingNumber: o.trackingNumber,
          deliveryNotes: o.deliveryNotes,
          isGift: o.isGift,
          giftMessage: o.giftMessage,
          hasGiftWrap: o.hasGiftWrap,
          giftWrapFee: Number(o.giftWrapFee || 0),
          createdAt: o.createdAt,
          items: o.items.map((it) => ({
            id: it.id,
            productId: it.productId,
            variantId: it.variantId,
            productName: it.productName,
            variantName: it.variantName,
            sku: it.sku,
            quantity: it.quantity,
            unitPrice: Number(it.unitPrice),
            total: Number(it.total),
          })),
        };
      }),
    });
  } catch (error) {
    console.error("ERP orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch store orders" }, { status: 500 });
  }
}
