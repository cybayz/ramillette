import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { code, subtotal, countryCode = "QA" } = await request.json();

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json(
        { error: "Invalid coupon request. Please provide a promo code." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.active) {
      return NextResponse.json(
        {
          code: "INVALID_COUPON",
          error: `Promo code "${cleanCode}" is invalid or has expired.`,
        },
        { status: 400 }
      );
    }

    if (coupon.startsAt && new Date() < coupon.startsAt) {
      return NextResponse.json(
        {
          code: "NOT_ACTIVE_YET",
          error: `Promo code "${cleanCode}" is not active yet.`,
        },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json(
        {
          code: "EXPIRED",
          error: `Promo code "${cleanCode}" has expired.`,
        },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        {
          code: "LIMIT_REACHED",
          error: `Promo code "${cleanCode}" usage limit has been reached.`,
        },
        { status: 400 }
      );
    }

    if (coupon.minimumOrder && subtotal < Number(coupon.minimumOrder)) {
      const minVal = Number(coupon.minimumOrder);
      const diff = Math.max(0, minVal - subtotal);
      return NextResponse.json(
        {
          code: "MINIMUM_ORDER_NOT_MET",
          minimumOrder: minVal,
          currentSubtotal: subtotal,
          amountNeeded: diff,
          error: `Minimum order of ${formatPrice(minVal, countryCode)} required for ${coupon.code}. Add ${formatPrice(diff, countryCode)} more to unlock!`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = (subtotal * Number(coupon.value)) / 100;
      if (coupon.maximumDiscount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maximumDiscount));
      }
    } else {
      discountAmount = Math.min(Number(coupon.value), subtotal);
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      discountAmount,
      description: coupon.description || "",
      message: `Promo code ${coupon.code} applied successfully!`,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
