import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, canManageInventory } from "@/lib/erp/context";
import { getOrCreateStoreInventory } from "@/lib/inventory/inventoryService";
import { InventoryTransactionType } from "@prisma/client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  try {
    const user = await getErpUser();
    if (!user || !canManageInventory(user.role)) {
      return NextResponse.json({ error: "Unauthorized: Insufficient inventory permissions" }, { status: 403 });
    }

    const { id } = await params;

    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true, supplier: true, store: true },
    });

    if (!po) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }

    if (po.status === "RECEIVED") {
      return NextResponse.json({ error: "Purchase order has already been fully received" }, { status: 400 });
    }

    // Atomic transaction: receive items into store inventory & record PURCHASE transactions
    const updated = await prisma.$transaction(async (tx) => {
      for (const it of po.items) {
        const qtyToReceive = it.quantityOrdered - it.quantityReceived;
        if (qtyToReceive <= 0) continue;

        const inv = await getOrCreateStoreInventory(po.storeId, it.productId, it.variantId, tx);

        await tx.storeInventory.update({
          where: { id: inv.id },
          data: {
            quantity: { increment: qtyToReceive },
            availableQuantity: { increment: qtyToReceive },
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            storeId: po.storeId,
            productId: it.productId,
            variantId: it.variantId,
            type: InventoryTransactionType.PURCHASE,
            quantity: qtyToReceive,
            previousQuantity: inv.quantity,
            newQuantity: inv.quantity + qtyToReceive,
            referenceType: "PURCHASE_ORDER",
            referenceId: po.poNumber,
            performedById: user.id,
            reason: `Goods receipt from supplier ${po.supplier.name} (#${po.poNumber})`,
          },
        });

        await tx.purchaseOrderItem.update({
          where: { id: it.id },
          data: { quantityReceived: it.quantityOrdered },
        });
      }

      return await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: "RECEIVED",
          receivedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Purchase Order #${po.poNumber} received and inventory updated`,
      purchaseOrder: updated,
    });
  } catch (error: any) {
    console.error("Receive purchase order error:", error);
    return NextResponse.json({ error: error?.message || "Failed to receive purchase order" }, { status: 500 });
  }
}
