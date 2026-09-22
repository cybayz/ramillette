import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore, canManageInventory } from "@/lib/erp/context";

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
    const lowStockOnly = searchParams.get("lowStock") === "true";

    const storeId = storeContext.store.id;

    const inventoryRecords = await prisma.storeInventory.findMany({
      where: {
        storeId,
        ...(query
          ? {
              OR: [
                { product: { name: { contains: query, mode: "insensitive" } } },
                { product: { sku: { contains: query, mode: "insensitive" } } },
                { product: { barcode: { contains: query, mode: "insensitive" } } },
                { variant: { name: { contains: query, mode: "insensitive" } } },
                { variant: { sku: { contains: query, mode: "insensitive" } } },
                { variant: { barcode: { contains: query, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        product: {
          include: { category: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
        },
        variant: true,
      },
      orderBy: [
        { availableQuantity: "asc" },
        { product: { name: "asc" } },
      ],
    });

    const filtered = lowStockOnly
      ? inventoryRecords.filter((inv) => inv.availableQuantity <= inv.lowStockThreshold)
      : inventoryRecords;

    const items = filtered.map((inv) => ({
      id: inv.id,
      storeId: inv.storeId,
      productId: inv.productId,
      variantId: inv.variantId,
      productName: inv.product.name,
      variantName: inv.variant?.name || null,
      displayName: inv.variant ? `${inv.product.name} (${inv.variant.name})` : inv.product.name,
      sku: inv.variant?.sku || inv.product.sku || "N/A",
      barcode: inv.variant?.barcode || inv.product.barcode || "N/A",
      quantity: inv.quantity,
      reservedQuantity: inv.reservedQuantity,
      availableQuantity: inv.availableQuantity,
      lowStockThreshold: inv.lowStockThreshold,
      isLowStock: inv.availableQuantity <= inv.lowStockThreshold,
      isOutOfStock: inv.availableQuantity <= 0,
      imageUrl: inv.variant?.image || inv.product.images[0]?.url || null,
      categoryName: inv.product.category?.name || "General",
      updatedAt: inv.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      store: storeContext.context,
      items,
      totalCount: items.length,
      lowStockCount: items.filter((i) => i.isLowStock).length,
    });
  } catch (error) {
    console.error("ERP inventory fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch store inventory" }, { status: 500 });
  }
}
