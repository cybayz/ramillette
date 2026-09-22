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
      include: { items: true, sourceStore: true, destinationStore: true },
    });

    if (!transfer) {
      return NextResponse.json({ error: "Transfer request not found" }, { status: 404 });
    }

    if (transfer.status !== "REQUESTED" && transfer.status !== "APPROVED") {
      return NextResponse.json({ error: `Cannot dispatch transfer in ${transfer.status} status` }, { status: 400 });
    }

    // Atomic transaction: deduct source store stock and record STOCK_TRANSFER_OUT
    const updated = await prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        const inv = await getOrCreateStoreInventory(transfer.sourceStoreId, item.productId, item.variantId, tx);

        if (inv.availableQuantity < item.quantityRequested) {
          throw new Error(
            `Insufficient available stock at ${transfer.sourceStore.name} for transfer item. Available: ${inv.availableQuantity}, Requested: ${item.quantityRequested}`
          );
        }

        await tx.storeInventory.update({
          where: { id: inv.id },
          data: {
            quantity: { decrement: item.quantityRequested },
            availableQuantity: { decrement: item.quantityRequested },
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            storeId: transfer.sourceStoreId,
            productId: item.productId,
            variantId: item.variantId,
            type: InventoryTransactionType.STOCK_TRANSFER_OUT,
            quantity: -item.quantityRequested,
            previousQuantity: inv.quantity,
            newQuantity: inv.quantity - item.quantityRequested,
            referenceType: "STOCK_TRANSFER",
            referenceId: transfer.transferNumber,
            performedById: user.id,
            reason: `Transfer to ${transfer.destinationStore.name} (#${transfer.transferNumber})`,
          },
        });

        await tx.stockTransferItem.update({
          where: { id: item.id },
          data: { quantityShipped: item.quantityRequested },
        });
      }

      return await tx.stockTransfer.update({
        where: { id },
        data: {
          status: "IN_TRANSIT",
          dispatchedAt: new Date(),
          approvedById: user.id,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Transfer #${transfer.transferNumber} dispatched and now IN TRANSIT`,
      transfer: updated,
    });
  } catch (error: any) {
    console.error("Transfer dispatch error:", error);
    return NextResponse.json({ error: error?.message || "Failed to dispatch transfer" }, { status: 500 });
  }
}
