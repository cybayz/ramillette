import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db/prisma";
import { getErpUser, ERP_STORE_COOKIE } from "@/lib/erp/context";

export async function POST(request: Request) {
  try {
    const user = await getErpUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access to ERP" }, { status: 403 });
    }

    const { storeId } = await request.json();
    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId, active: true },
      include: { region: true, country: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found or inactive" }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set(ERP_STORE_COOKIE, store.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return NextResponse.json({
      success: true,
      message: `Switched active store context to ${store.name}`,
      store: {
        id: store.id,
        code: store.code,
        name: store.name,
        countryCode: store.countryCode,
        regionName: store.region.name,
      },
    });
  } catch (error) {
    console.error("Store context switch error:", error);
    return NextResponse.json({ error: "Failed to switch store context" }, { status: 500 });
  }
}
