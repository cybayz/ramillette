import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { code, type, value, minimumOrder, usageLimit } = body;

    if (!code || value === undefined) {
      return NextResponse.json(
        { error: "Code and discount value are required" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type: type === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE",
        value: Number(value),
        minimumOrder: minimumOrder ? Number(minimumOrder) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        active: true,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
