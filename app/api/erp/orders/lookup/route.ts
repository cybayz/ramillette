import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore } from "@/lib/erp/context";

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
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    // Lookup order by exact orderNumber or id or phone
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: query, mode: "insensitive" } },
          { id: query },
          { customerPhone: { contains: query } },
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: { take: 1, orderBy: { sortOrder: "asc" } },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                image: true,
              },
            },
          },
        },
        returns: {
          include: {
            items: true,
          },
        },
        assignedStore: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: `Order or Receipt #${query} not found` }, { status: 404 });
    }

    // Calculate already returned quantities per order item
    const returnedQtyMap: Record<string, number> = {};
    for (const ret of order.returns) {
      for (const retItem of ret.items) {
        const key = `${retItem.productId}-${retItem.variantId || "base"}`;
        returnedQtyMap[key] = (returnedQtyMap[key] || 0) + retItem.quantity;
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        channel: order.channel,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        currency: order.currency,
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        tax: Number(order.tax),
        total: Number(order.total),
        createdAt: order.createdAt,
        assignedStore: order.assignedStore,
        items: order.items.map((it) => {
          const itemKey = `${it.productId}-${it.variantId || "base"}`;
          const previouslyReturned = returnedQtyMap[itemKey] || 0;
          const remainingReturnable = Math.max(0, it.quantity - previouslyReturned);

          return {
            id: it.id,
            productId: it.productId,
            variantId: it.variantId,
            productName: it.productName,
            variantName: it.variantName,
            sku: it.sku || it.variant?.sku || it.product?.sku || "N/A",
            originalQuantity: it.quantity,
            previouslyReturned,
            remainingReturnable,
            unitPrice: Number(it.unitPrice),
            total: Number(it.total),
            imageUrl: it.variant?.image || it.product?.images[0]?.url || null,
          };
        }),
      },
    });
  } catch (error: any) {
    console.error("Order lookup error:", error);
    return NextResponse.json({ error: error?.message || "Failed to lookup order" }, { status: 500 });
  }
}
