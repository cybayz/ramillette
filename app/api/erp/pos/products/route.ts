import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore } from "@/lib/erp/context";
import { resolveProductForCountry, resolveVariantForCountry } from "@/lib/country/productResolver";

export async function GET(request: Request) {
  try {
    const user = await getErpUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access to ERP" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const categoryId = searchParams.get("categoryId") || "";
    const storeContext = await getActiveErpStore();

    if (!storeContext) {
      return NextResponse.json({ error: "No active store found" }, { status: 400 });
    }

    const storeId = storeContext.store.id;
    const countryCode = storeContext.store.countryCode;

    // Search products by name, slug, sku, or barcode
    const whereClause: any = {
      active: true,
      deletedAt: null,
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
        { barcode: { contains: query, mode: "insensitive" } },
        { variants: { some: { barcode: { contains: query, mode: "insensitive" } } } },
        { variants: { some: { sku: { contains: query, mode: "insensitive" } } } },
        { variants: { some: { name: { contains: query, mode: "insensitive" } } } },
      ];
    }

    const rawProducts = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        countries: true,
        variants: {
          where: { active: true, deletedAt: null },
          include: {
            countries: true,
            storeInventories: {
              where: { storeId },
            },
          },
        },
        storeInventories: {
          where: { storeId },
        },
      },
      take: 50,
      orderBy: { name: "asc" },
    });

    // Flatten into POS saleable items (Base products + Variants)
    const items: Array<{
      id: string; // unique item key
      productId: string;
      variantId?: string | null;
      name: string;
      displayName: string;
      variantName?: string | null;
      sku: string;
      barcode?: string | null;
      price: number;
      currency: string;
      stock: number;
      availableStock: number;
      reservedStock: number;
      imageUrl?: string | null;
      categoryName?: string | null;
    }> = [];

    for (const prod of rawProducts) {
      const prodCountry = resolveProductForCountry(prod, countryCode);

      if (prod.variants.length === 0) {
        const inv = prod.storeInventories[0];
        const physical = inv ? inv.quantity : 0;
        const reserved = inv ? inv.reservedQuantity : 0;
        const available = inv ? inv.availableQuantity : 0;

        items.push({
          id: `p-${prod.id}`,
          productId: prod.id,
          variantId: null,
          name: prod.name,
          displayName: prod.name,
          sku: prod.sku || `PROD-${prod.id.slice(-6)}`,
          barcode: prod.barcode,
          price: prodCountry.price,
          currency: storeContext.context.currency,
          stock: physical,
          availableStock: available,
          reservedStock: reserved,
          imageUrl: prod.images[0]?.url,
          categoryName: prod.category?.name,
        });
      } else {
        // Has variants (e.g. 50ml, 100ml)
        for (const v of prod.variants) {
          const varCountry = resolveVariantForCountry(v, countryCode);
          const vInv = v.storeInventories[0];
          const physical = vInv ? vInv.quantity : 0;
          const reserved = vInv ? vInv.reservedQuantity : 0;
          const available = vInv ? vInv.availableQuantity : 0;

          items.push({
            id: `v-${v.id}`,
            productId: prod.id,
            variantId: v.id,
            name: prod.name,
            displayName: `${prod.name} (${v.name})`,
            variantName: v.name,
            sku: v.sku || prod.sku || `VAR-${v.id.slice(-6)}`,
            barcode: v.barcode || prod.barcode,
            price: varCountry.price,
            currency: storeContext.context.currency,
            stock: physical,
            availableStock: available,
            reservedStock: reserved,
            imageUrl: v.image || prod.images[0]?.url,
            categoryName: prod.category?.name,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
      store: storeContext.context,
    });
  } catch (error) {
    console.error("POS products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch POS catalog" }, { status: 500 });
  }
}
