import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export const revalidate = 10; // Revalidate every 10 seconds

export async function GET() {
  try {
    const now = new Date();

    const coupons = await prisma.coupon.findMany({
      where: {
        active: true,
        isPublic: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: [{ minimumOrder: "asc" }, { value: "desc" }],
    });

    const publicOffers = coupons
      .filter((c) => !c.usageLimit || c.usedCount < c.usageLimit)
      .map((c) => ({
        code: c.code,
        type: c.type,
        value: Number(c.value),
        minimumOrder: c.minimumOrder ? Number(c.minimumOrder) : null,
        maximumDiscount: c.maximumDiscount ? Number(c.maximumDiscount) : null,
        description: c.description || "",
        expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      }));

    return NextResponse.json({ success: true, coupons: publicOffers });
  } catch (error) {
    console.error("Failed to fetch public coupons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
