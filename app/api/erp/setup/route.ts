import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser } from "@/lib/erp/context";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const user = await getErpUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access to ERP" }, { status: 403 });
    }

    const [countries, regions, stores] = await Promise.all([
      prisma.country.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.region.findMany({
        where: { active: true },
        include: { country: true },
        orderBy: [{ countryCode: "asc" }, { name: "asc" }],
      }),
      prisma.store.findMany({
        include: { region: true, country: true },
        orderBy: { code: "asc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      countries: countries.map((c) => ({
        code: c.code,
        name: c.name,
        currency: c.currency,
        flag: c.flag,
        taxRate: Number(c.taxRate),
      })),
      regions: regions.map((r) => ({
        id: r.id,
        countryCode: r.countryCode,
        countryName: r.country.name,
        name: r.name,
        code: r.code,
      })),
      stores: stores.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        countryCode: s.countryCode,
        regionName: s.region.name,
        currency: s.currency,
        phone: s.phone,
        active: s.active,
      })),
    });
  } catch (error) {
    console.error("Setup data fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch setup data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getErpUser();
    if (!user || user.role !== Role.SUPER_ADMIN && user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized: Super Admin permissions required to create stores" }, { status: 403 });
    }

    const body = await request.json();
    const {
      countryCode,
      regionName,
      storeName,
      storeNameAr,
      storeCode,
      address,
      phone,
      email,
      currency,
      taxRate,
      isFulfillmentCenter = true,
      priority = 5,
    } = body;

    if (!countryCode || !regionName || !storeName || !storeCode) {
      return NextResponse.json({ error: "Country, Region, Store Name, and Store Code are required" }, { status: 400 });
    }

    // 1. Ensure Region exists under Country
    let region = await prisma.region.findFirst({
      where: {
        countryCode: countryCode.toUpperCase(),
        name: { equals: regionName.trim(), mode: "insensitive" },
      },
    });

    if (!region) {
      region = await prisma.region.create({
        data: {
          countryCode: countryCode.toUpperCase(),
          name: regionName.trim(),
          code: regionName.trim().slice(0, 3).toUpperCase(),
        },
      });
    }

    // 2. Create Store
    const createdStore = await prisma.store.create({
      data: {
        code: storeCode.trim().toUpperCase(),
        name: storeName.trim(),
        nameAr: storeNameAr?.trim() || null,
        regionId: region.id,
        countryCode: countryCode.toUpperCase(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        currency: currency?.trim().toUpperCase() || (countryCode === "AE" ? "AED" : countryCode === "BH" ? "BHD" : "QAR"),
        taxRate: taxRate !== undefined ? Number(taxRate) : null,
        isFulfillmentCenter: Boolean(isFulfillmentCenter),
        priority: Number(priority) || 5,
        active: true,
      },
      include: { region: true, country: true },
    });

    // 3. Initialize store inventory for all active products
    const products = await prisma.product.findMany({
      include: { variants: true },
    });

    for (const p of products) {
      // Base product inventory
      await prisma.storeInventory.create({
        data: {
          storeId: createdStore.id,
          productId: p.id,
          variantId: null,
          quantity: 20,
          reservedQuantity: 0,
          availableQuantity: 20,
          lowStockThreshold: 5,
        },
      });

      // Variant inventory
      for (const v of p.variants) {
        await prisma.storeInventory.create({
          data: {
            storeId: createdStore.id,
            productId: p.id,
            variantId: v.id,
            quantity: 15,
            reservedQuantity: 0,
            availableQuantity: 15,
            lowStockThreshold: 5,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Store ${createdStore.name} (${createdStore.code}) initialized successfully`,
      store: createdStore,
    });
  } catch (error: any) {
    console.error("Store initialization error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A store with this store code already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message || "Failed to initialize store" }, { status: 500 });
  }
}
