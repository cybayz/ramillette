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

    const transfer = await prisma.stockTransfer.findUnique({
      where: { id },
      include: { items: true, destinationStore: true, sourceStore: true },
    });

    if (!transfer) {
      return NextResponse.json({ error: "Transfer request not found" }, { status: 404 });
    }

    if (transfer.status !== "IN_TRANSIT") {
      return NextResponse.json({ error: `Cannot receive transfer in ${transfer.status} status` }, { status: 400 });
    }

    // Atomic transaction: increment destination store stock and record STOCK_TRANSFER_IN
    const updated = await prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        const qtyReceived = item.quantityShipped || item.quantityRequested;
        const inv = await getOrCreateStoreInventory(transfer.destinationStoreId, item.productId, item.variantId, tx);

        await tx.storeInventory.update({
          where: { id: inv.id },
          data: {
            quantity: { increment: qtyReceived },
            availableQuantity: { increment: qtyReceived },
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            storeId: transfer.destinationStoreId,
            productId: item.productId,
            variantId: item.variantId,
            type: InventoryTransactionType.STOCK_TRANSFER_IN,
            quantity: qtyReceived,
            previousQuantity: inv.quantity,
            newQuantity: inv.quantity + qtyReceived,
            referenceType: "STOCK_TRANSFER",
            referenceId: transfer.transferNumber,
            performedById: user.id,
            reason: `Received from ${transfer.sourceStore.name} (#${transfer.transferNumber})`,
          },
        });

        await tx.stockTransferItem.update({
          where: { id: item.id },
          data: { quantityReceived: qtyReceived },
        });
      }

      return await tx.stockTransfer.update({
        where: { id },
        data: {
          status: "RECEIVED",
          receivedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Transfer #${transfer.transferNumber} received and inventory updated`,
      transfer: updated,
    });
  } catch (error: any) {
    console.error("Transfer receive error:", error);
    return NextResponse.json({ error: error?.message || "Failed to receive transfer" }, { status: 500 });
  }
}
