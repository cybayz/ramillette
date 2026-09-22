import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore } from "@/lib/erp/context";
import { InventoryTransactionType } from "@prisma/client";

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
    const typeFilter = searchParams.get("type");
    const limit = Math.min(100, Math.max(10, Number(searchParams.get("limit")) || 50));

    const whereClause: any = {
      storeId: storeContext.store.id,
    };

    if (typeFilter && Object.values(InventoryTransactionType).includes(typeFilter as any)) {
      whereClause.type = typeFilter;
    }

    const transactions = await prisma.inventoryTransaction.findMany({
      where: whereClause,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        variant: { select: { id: true, name: true, sku: true } },
        performedBy: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      store: storeContext.context,
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        productName: t.product.name,
        variantName: t.variant?.name || null,
        displayName: t.variant ? `${t.product.name} (${t.variant.name})` : t.product.name,
        sku: t.variant?.sku || t.product.sku,
        quantity: t.quantity,
        previousQuantity: t.previousQuantity,
        newQuantity: t.newQuantity,
        referenceType: t.referenceType,
        referenceId: t.referenceId,
        performer: t.performedBy
          ? `${t.performedBy.firstName || ""} ${t.performedBy.lastName || ""}`.trim() || t.performedBy.email
          : "System Automated",
        reason: t.reason,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("Inventory ledger fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory ledger" }, { status: 500 });
  }
}
