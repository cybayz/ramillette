import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore, canManageInventory } from "@/lib/erp/context";
import { adjustStock } from "@/lib/inventory/inventoryService";
import { InventoryTransactionType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const user = await getErpUser();
    if (!user || !canManageInventory(user.role)) {
      return NextResponse.json({ error: "Unauthorized: Insufficient inventory management permissions" }, { status: 403 });
    }

    const storeContext = await getActiveErpStore();
    if (!storeContext) {
      return NextResponse.json({ error: "No active store context found" }, { status: 400 });
    }

    const body = await request.json();
    const { productId, variantId, quantityDelta, type, reason } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (quantityDelta === undefined || quantityDelta === 0) {
      return NextResponse.json({ error: "Valid non-zero quantity adjustment is required" }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Adjustment reason is mandatory for audit trail" }, { status: 400 });
    }

    const validTypes: InventoryTransactionType[] = [
      InventoryTransactionType.STOCK_ADJUSTMENT,
      InventoryTransactionType.DAMAGE,
      InventoryTransactionType.LOST,
      InventoryTransactionType.MANUAL_CORRECTION,
      InventoryTransactionType.PURCHASE,
      InventoryTransactionType.RETURN,
    ];

    const adjustmentType = validTypes.includes(type) ? type : InventoryTransactionType.STOCK_ADJUSTMENT;

    const updated = await adjustStock({
      storeId: storeContext.store.id,
      productId,
      variantId: variantId || null,
      quantityDelta: Number(quantityDelta),
      type: adjustmentType,
      reason: reason.trim(),
      performedById: user.id,
    });

    return NextResponse.json({
      success: true,
      message: `Stock successfully adjusted (${quantityDelta > 0 ? `+${quantityDelta}` : quantityDelta})`,
      inventory: updated,
    });
  } catch (error: any) {
    console.error("Stock adjustment error:", error);
    return NextResponse.json({ error: error?.message || "Failed to adjust stock" }, { status: 500 });
  }
}
