import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore } from "@/lib/erp/context";

export async function GET() {
  try {
    const user = await getErpUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access to ERP" }, { status: 403 });
    }

    const [activeStoreData, stores] = await Promise.all([
      getActiveErpStore(),
      prisma.store.findMany({
        where: { active: true },
        include: {
          region: true,
          country: true,
        },
        orderBy: [{ countryCode: "asc" }, { priority: "desc" }, { code: "asc" }],
      }),
    ]);

    return NextResponse.json({
      success: true,
      activeStore: activeStoreData?.context || null,
      stores: stores.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        nameAr: s.nameAr,
        regionName: s.region.name,
        countryCode: s.countryCode,
        countryName: s.country.name,
        currency: s.currency,
        phone: s.phone,
        address: s.address,
        taxRate: s.taxRate ? Number(s.taxRate) : Number(s.country.taxRate),
      })),
    });
  } catch (error) {
    console.error("ERP stores fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}
