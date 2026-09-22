import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore, canManageInventory } from "@/lib/erp/context";

export async function GET() {
  try {
    const user = await getErpUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access to ERP" }, { status: 403 });
    }

    const storeContext = await getActiveErpStore();
    if (!storeContext) {
      return NextResponse.json({ error: "No active store context found" }, { status: 400 });
    }

    const storeId = storeContext.store.id;

    const transfers = await prisma.stockTransfer.findMany({
      where: {
        OR: [{ sourceStoreId: storeId }, { destinationStoreId: storeId }],
      },
      include: {
        sourceStore: true,
        destinationStore: true,
        requestedBy: { select: { firstName: true, lastName: true, email: true } },
        approvedBy: { select: { firstName: true, lastName: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
            variant: { select: { name: true, sku: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      store: storeContext.context,
      transfers: transfers.map((t) => ({
        id: t.id,
        transferNumber: t.transferNumber,
        sourceStoreName: t.sourceStore.name,
        sourceStoreCode: t.sourceStore.code,
        destinationStoreName: t.destinationStore.name,
        destinationStoreCode: t.destinationStore.code,
        status: t.status,
        notes: t.notes,
        isOutbound: t.sourceStoreId === storeId,
        isInbound: t.destinationStoreId === storeId,
        itemsCount: t.items.length,
        dispatchedAt: t.dispatchedAt,
        receivedAt: t.receivedAt,
        createdAt: t.createdAt,
        items: t.items.map((it) => ({
          id: it.id,
          productName: it.product.name,
          variantName: it.variant?.name || null,
          displayName: it.variant ? `${it.product.name} (${it.variant.name})` : it.product.name,
          sku: it.variant?.sku || it.product.sku,
          quantityRequested: it.quantityRequested,
          quantityShipped: it.quantityShipped,
          quantityReceived: it.quantityReceived,
        })),
      })),
    });
  } catch (error) {
    console.error("Transfers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch stock transfers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getErpUser();
    if (!user || !canManageInventory(user.role)) {
      return NextResponse.json({ error: "Unauthorized: Insufficient inventory permissions" }, { status: 403 });
    }

    const storeContext = await getActiveErpStore();
    if (!storeContext) {
      return NextResponse.json({ error: "No active store context found" }, { status: 400 });
    }

    const body = await request.json();
    const { destinationStoreId, sourceStoreId, items, notes } = body;

    const actualSourceId = sourceStoreId || storeContext.store.id;

    if (!destinationStoreId) {
      return NextResponse.json({ error: "Destination store is required" }, { status: 400 });
    }

    if (actualSourceId === destinationStoreId) {
      return NextResponse.json({ error: "Source and destination store cannot be the same" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Transfer must contain at least one item" }, { status: 400 });
    }

    const transferNumber = `TR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const created = await prisma.stockTransfer.create({
      data: {
        transferNumber,
        sourceStoreId: actualSourceId,
        destinationStoreId,
        status: "REQUESTED",
        notes: notes?.trim() || null,
        requestedById: user.id,
        items: {
          create: items.map((it: any) => ({
            productId: it.productId,
            variantId: it.variantId || null,
            quantityRequested: Number(it.quantity) || 1,
            quantityShipped: 0,
            quantityReceived: 0,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      message: `Transfer request #${transferNumber} created`,
      transfer: created,
    });
  } catch (error: any) {
    console.error("Create transfer error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create transfer request" }, { status: 500 });
  }
}
