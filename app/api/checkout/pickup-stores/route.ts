import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { country = "QA", items = [] } = body;

    const normalizedCountry = String(country).toUpperCase();

    // Fetch all active stores in the country with their region
    const stores = await prisma.store.findMany({
      where: {
        countryCode: normalizedCountry,
        active: true,
      },
      include: {
        region: true,
        country: true,
      },
      orderBy: [
        { priority: "desc" },
        { name: "asc" },
      ],
    });

    if (stores.length === 0) {
      return NextResponse.json({
        success: true,
        stores: [],
        message: "No stores found for this region",
      });
    }

    const storeIds = stores.map((s) => s.id);

    // Fetch store inventory for all requested items across these stores
    const requestedItems: Array<{
      productId: string;
      variantId?: string | null;
      quantity: number;
    }> = Array.isArray(items) ? items : [];

    // Query inventory if there are items
    let inventoryMap = new Map<string, number>(); // key: `${storeId}:${productId}:${variantId || ""}` -> availableQuantity

    if (requestedItems.length > 0) {
      const productIds = requestedItems.map((i) => i.productId);
      const inventoryRecords = await prisma.storeInventory.findMany({
        where: {
          storeId: { in: storeIds },
          productId: { in: productIds },
        },
      });

      for (const inv of inventoryRecords) {
        const key = `${inv.storeId}:${inv.productId}:${inv.variantId || ""}`;
        inventoryMap.set(key, inv.availableQuantity);
      }
    }

    // Calculate stock readiness for each store
    const evaluatedStores = stores.map((store) => {
      let isFullyAvailable = true;
      let availableItemsCount = 0;
      let totalItemsCount = requestedItems.length;

      const itemStockStatus = requestedItems.map((item) => {
        const key = `${store.id}:${item.productId}:${item.variantId || ""}`;
        const fallbackKeyWithoutVariant = `${store.id}:${item.productId}:`;
        const availableQty = inventoryMap.has(key)
          ? (inventoryMap.get(key) || 0)
          : (inventoryMap.get(fallbackKeyWithoutVariant) || 0);

        const hasEnough = availableQty >= item.quantity;
        if (!hasEnough) {
          isFullyAvailable = false;
        } else {
          availableItemsCount++;
        }

        return {
          productId: item.productId,
          variantId: item.variantId || null,
          required: item.quantity,
          available: availableQty,
          inStock: hasEnough,
        };
      });

      let stockBadge = "IN_STOCK";
      if (totalItemsCount > 0) {
        if (availableItemsCount === totalItemsCount) {
          stockBadge = "IN_STOCK"; // Ready for immediate same-day pickup
        } else if (availableItemsCount > 0) {
          stockBadge = "PARTIAL_STOCK"; // Some items in stock
        } else {
          stockBadge = "OUT_OF_STOCK"; // Will need transfer
        }
      }

      return {
        id: store.id,
        code: store.code,
        name: store.name,
        nameAr: store.nameAr || store.name,
        address: store.address || "Flagship Boutique",
        phone: store.phone || "+974 6609 7444",
        email: store.email || "boutique@ramillette.com",
        regionId: store.regionId,
        regionName: store.region.name,
        countryCode: store.countryCode,
        isFullyAvailable: totalItemsCount === 0 ? true : isFullyAvailable,
        availableItemsCount,
        totalItemsCount,
        stockBadge,
        itemStockStatus,
      };
    });

    return NextResponse.json({
      success: true,
      stores: evaluatedStores,
    });
  } catch (error) {
    console.error("Pickup stores query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pickup stores." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || "QA";

    const stores = await prisma.store.findMany({
      where: {
        countryCode: country.toUpperCase(),
        active: true,
      },
      include: {
        region: true,
      },
      orderBy: [{ priority: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      stores: stores.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        nameAr: s.nameAr,
        address: s.address,
        phone: s.phone,
        email: s.email,
        regionName: s.region.name,
        countryCode: s.countryCode,
      })),
    });
  } catch (error) {
    console.error("GET pickup stores error:", error);
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}
