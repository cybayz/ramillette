import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore, canManageReturns } from "@/lib/erp/context";
import { getOrCreateStoreInventory } from "@/lib/inventory/inventoryService";
import { InventoryTransactionType } from "@prisma/client";

export async function GET() {
  try {
    const user = await getErpUser();
    if (!user || !canManageReturns(user)) {
      return NextResponse.json({ error: "Unauthorized access to returns" }, { status: 403 });
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
    if (!user || !canManageReturns(user)) {
      return NextResponse.json({ error: "Unauthorized: Insufficient permissions to process returns" }, { status: 403 });
    }

    const storeContext = await getActiveErpStore();
    if (!storeContext) {
      return NextResponse.json({ error: "No active store context found" }, { status: 400 });
    }

    const body = await request.json();
    const {
      orderNumber,
      resolutionType = "REFUND", // "REFUND" or "REPLACEMENT"
      items,
      reason,
      refundMethod = "CASH",
      replacementItemId = null,
      replacementProductId = null,
      replacementVariantId = null,
      replacementQuantity = 1,
    } = body;

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

    // If replacement was selected, check available stock of replacement product
    let replacementInv: any = null;
    if (resolutionType === "REPLACEMENT") {
      const repProdId = replacementProductId || items[0]?.productId;
      const repVarId = replacementVariantId !== undefined ? replacementVariantId : (items[0]?.variantId || null);
      const repQty = Number(replacementQuantity) || 1;

      replacementInv = await prisma.storeInventory.findFirst({
        where: {
          storeId,
          productId: repProdId,
          variantId: repVarId || null,
        },
      });

      if (!replacementInv || replacementInv.availableQuantity < repQty) {
        return NextResponse.json(
          {
            error: `Replacement product is out of stock in this branch (Available: ${replacementInv?.availableQuantity || 0}, Requested: ${repQty})`,
          },
          { status: 400 }
        );
      }
    }

    const effectiveMethod = resolutionType === "REPLACEMENT" ? "EXCHANGE_REPLACEMENT" : refundMethod;
    const returnStatus = resolutionType === "REPLACEMENT" ? "APPROVED" : "REFUNDED";
    const finalRefundAmount = resolutionType === "REPLACEMENT" ? 0 : calculatedRefund;

    // Atomic Return Transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdReturn = await tx.orderReturn.create({
        data: {
          returnNumber,
          orderId: order.id,
          storeId,
          status: returnStatus as any,
          reason: reason?.trim() ? `[${resolutionType}] ${reason.trim()}` : `[${resolutionType}] Customer return request`,
          refundAmount: finalRefundAmount,
          refundMethod: effectiveMethod,
          inspectedAt: new Date(),
          inspectedById: user.id,
          items: {
            create: items.map((it: any) => ({
              productId: it.productId,
              variantId: it.variantId || null,
              quantity: Number(it.quantity) || 1,
              condition: it.condition || (it.restockToInventory ? "UNOPENED" : "DAMAGED"),
              restockToInventory: Boolean(it.restockToInventory),
              unitPrice: Number(it.unitPrice) || 0,
            })),
          },
        },
        include: { items: true },
      });

      // 1. Process returned items stock: sellable vs damaged
      for (const it of items) {
        const qty = Number(it.quantity) || 1;
        const inv = await getOrCreateStoreInventory(storeId, it.productId, it.variantId, tx);

        if (Boolean(it.restockToInventory)) {
          // Unopened & clean: increase physical stock and available sellable stock
          await tx.storeInventory.update({
            where: { id: inv.id },
            data: {
              quantity: { increment: qty },
              availableQuantity: { increment: qty },
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              storeId,
              productId: it.productId,
              variantId: it.variantId || null,
              type: InventoryTransactionType.RETURN,
              quantity: qty,
              previousQuantity: inv.quantity,
              newQuantity: inv.quantity + qty,
              referenceType: "RETURN",
              referenceId: returnNumber,
              performedById: user.id,
              reason: `Unopened return accepted & restocked to sellable inventory (Ref #${order.orderNumber})`,
            },
          });
        } else {
          // Damaged/opened: Move into damagedStock quarantine (damagedQuantity)
          await tx.storeInventory.update({
            where: { id: inv.id },
            data: {
              damagedQuantity: { increment: qty },
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              storeId,
              productId: it.productId,
              variantId: it.variantId || null,
              type: InventoryTransactionType.DAMAGE,
              quantity: qty,
              previousQuantity: inv.quantity,
              newQuantity: inv.quantity, // sellable physical quantity stays unchanged, damaged counter increased
              referenceType: "RETURN_DAMAGED",
              referenceId: returnNumber,
              performedById: user.id,
              reason: `Damaged/opened return from #${order.orderNumber} (${it.condition || "Damaged/Defective"}) - quarantined to damaged stock`,
            },
          });
        }
      }

      // 2. If REPLACEMENT resolution: dispatch replacement bottle from sellable stock
      if (resolutionType === "REPLACEMENT") {
        const repProdId = replacementProductId || items[0]?.productId;
        const repVarId = replacementVariantId !== undefined ? replacementVariantId : (items[0]?.variantId || null);
        const repQty = Number(replacementQuantity) || 1;

        const currentRepInv = await getOrCreateStoreInventory(storeId, repProdId, repVarId, tx);

        await tx.storeInventory.update({
          where: { id: currentRepInv.id },
          data: {
            quantity: { decrement: repQty },
            availableQuantity: { decrement: repQty },
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            storeId,
            productId: repProdId,
            variantId: repVarId || null,
            type: InventoryTransactionType.SALE,
            quantity: -repQty,
            previousQuantity: currentRepInv.quantity,
            newQuantity: currentRepInv.quantity - repQty,
            referenceType: "RETURN_REPLACEMENT",
            referenceId: returnNumber,
            performedById: user.id,
            reason: `Replacement product dispensed to customer for return #${returnNumber}`,
          },
        });
      }

      return createdReturn;
    });

    return NextResponse.json({
      success: true,
      message: resolutionType === "REPLACEMENT"
        ? `Exchange #${returnNumber} processed with replacement stock dispensed`
        : `Return #${returnNumber} processed with refund (${effectiveMethod})`,
      orderReturn: result,
    });
  } catch (error: any) {
    console.error("Return processing error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process return" }, { status: 500 });
  }
}

