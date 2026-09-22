import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore, canManageInventory } from "@/lib/erp/context";
import { getOrCreateStoreInventory } from "@/lib/inventory/inventoryService";
import { InventoryTransactionType } from "@prisma/client";

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

    const returns = await prisma.orderReturn.findMany({
      where: { storeId: storeContext.store.id },
      include: {
        order: { select: { orderNumber: true, customerName: true, customerPhone: true, channel: true } },
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
      returns: returns.map((r) => ({
        id: r.id,
        returnNumber: r.returnNumber,
        orderNumber: r.order.orderNumber,
        customerName: r.order.customerName,
        customerPhone: r.order.customerPhone,
        channel: r.order.channel,
        status: r.status,
        reason: r.reason,
        refundAmount: Number(r.refundAmount),
        refundMethod: r.refundMethod,
        createdAt: r.createdAt,
        items: r.items.map((it) => ({
          id: it.id,
          productName: it.product.name,
          variantName: it.variant?.name || null,
          displayName: it.variant ? `${it.product.name} (${it.variant.name})` : it.product.name,
          sku: it.variant?.sku || it.product.sku,
          quantity: it.quantity,
          condition: it.condition,
          restockToInventory: it.restockToInventory,
          unitPrice: Number(it.unitPrice),
        })),
      })),
    });
  } catch (error) {
    console.error("Returns fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch returns" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getErpUser();
    if (!user || !canManageInventory(user.role)) {
      return NextResponse.json({ error: "Unauthorized: Insufficient permissions to process returns" }, { status: 403 });
    }

    const storeContext = await getActiveErpStore();
    if (!storeContext) {
      return NextResponse.json({ error: "No active store context found" }, { status: 400 });
    }

    const body = await request.json();
    const { orderNumber, items, reason, refundMethod = "CASH" } = body;

    if (!orderNumber || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order number and returned items are required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim() },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: `Order #${orderNumber} not found` }, { status: 404 });
    }

    const storeId = storeContext.store.id;
    const returnNumber = `RET-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    let calculatedRefund = 0;
    for (const it of items) {
      calculatedRefund += (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1);
    }

    // Atomic Return Transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdReturn = await tx.orderReturn.create({
        data: {
          returnNumber,
          orderId: order.id,
          storeId,
          status: "REFUNDED",
          reason: reason?.trim() || null,
          refundAmount: calculatedRefund,
          refundMethod,
          inspectedAt: new Date(),
          inspectedById: user.id,
          items: {
            create: items.map((it: any) => ({
              productId: it.productId,
              variantId: it.variantId || null,
              quantity: Number(it.quantity) || 1,
              condition: it.condition || "UNOPENED",
              restockToInventory: Boolean(it.restockToInventory),
              unitPrice: Number(it.unitPrice) || 0,
            })),
          },
        },
        include: { items: true },
      });

      // Handle inventory update: only restock sellable unopened items
      for (const it of items) {
        if (Boolean(it.restockToInventory)) {
          const inv = await getOrCreateStoreInventory(storeId, it.productId, it.variantId, tx);

          await tx.storeInventory.update({
            where: { id: inv.id },
            data: {
              quantity: { increment: Number(it.quantity) || 1 },
              availableQuantity: { increment: Number(it.quantity) || 1 },
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              storeId,
              productId: it.productId,
              variantId: it.variantId || null,
              type: InventoryTransactionType.RETURN,
              quantity: Number(it.quantity) || 1,
              previousQuantity: inv.quantity,
              newQuantity: inv.quantity + (Number(it.quantity) || 1),
              referenceType: "RETURN",
              referenceId: returnNumber,
              performedById: user.id,
              reason: `Restocked return from order #${order.orderNumber} (${it.condition || "Good condition"})`,
            },
          });
        } else {
          // Log damaged return without incrementing sellable stock
          await tx.inventoryTransaction.create({
            data: {
              storeId,
              productId: it.productId,
              variantId: it.variantId || null,
              type: InventoryTransactionType.DAMAGE,
              quantity: 0,
              previousQuantity: 0,
              newQuantity: 0,
              referenceType: "RETURN_DAMAGED",
              referenceId: returnNumber,
              performedById: user.id,
              reason: `Damaged item returned from order #${order.orderNumber} (${it.condition || "Damaged"}) - quarantined`,
            },
          });
        }
      }

      return createdReturn;
    });

    return NextResponse.json({
      success: true,
      message: `Return #${returnNumber} processed successfully`,
      orderReturn: result,
    });
  } catch (error: any) {
    console.error("Return processing error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process return" }, { status: 500 });
  }
}
