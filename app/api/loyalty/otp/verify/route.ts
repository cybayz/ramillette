import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CountryCode, getCountryConfig } from "@/lib/country/config";
import {
  signLoyaltyVerificationToken,
  calculatePointsDiscount,
} from "@/lib/loyalty/loyaltyService";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Please log in to verify loyalty points." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, pointsToRedeem, phone: customPhone, countryCode = "QA" } = body;

    const points = parseInt(String(pointsToRedeem), 10);
    if (isNaN(points) || points <= 0) {
      return NextResponse.json(
        { error: "Invalid points amount specified." },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string" || code.trim().length !== 6) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit verification code." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, phone: true, rewardPoints: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.rewardPoints < points) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Available: ${user.rewardPoints} points.`,
        },
        { status: 400 }
      );
    }

    const phoneToUse = customPhone || user.phone;
    if (!phoneToUse) {
      return NextResponse.json(
        { error: "No mobile number available for verification." },
        { status: 400 }
      );
    }

    const targetCountryCode = (countryCode?.toUpperCase() || "QA") as CountryCode;
    const countryConfig = getCountryConfig(targetCountryCode);

    // Normalize phone
    const cleaned = phoneToUse.replace(/[\s\-\(\)]/g, "");
    let normalizedPhone = cleaned;
    if (!normalizedPhone.startsWith("+")) {
      const cleanPrefix = countryConfig.phonePrefix.startsWith("+")
        ? countryConfig.phonePrefix
        : `+${countryConfig.phonePrefix}`;
      normalizedPhone = `${cleanPrefix}${normalizedPhone.replace(/^0+/, "")}`;
    }

    const otpKey = `LOYALTY:${normalizedPhone}`;
    const verification = await prisma.otpVerification.findUnique({
      where: { phone: otpKey },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "No OTP was requested for this mobile number or it has expired." },
        { status: 400 }
      );
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (verification.code !== code.trim()) {
      const newAttempts = verification.attempts + 1;
      if (newAttempts >= 5) {
        await prisma.otpVerification.delete({ where: { id: verification.id } });
        return NextResponse.json(
          { error: "Too many incorrect attempts. Please request a new code." },
          { status: 400 }
        );
      }

      await prisma.otpVerification.update({
        where: { id: verification.id },
        data: { attempts: newAttempts },
      });

      return NextResponse.json(
        { error: `Incorrect verification code. ${5 - newAttempts} attempts remaining.` },
        { status: 400 }
      );
    }

    // OTP is valid! Delete verification record
    await prisma.otpVerification.delete({
      where: { id: verification.id },
    });

    // Lookup country from DB for point value
    const dbCountry = await prisma.country.findUnique({
      where: { code: targetCountryCode },
    });

    const loyaltyPointValue = dbCountry
      ? Number(dbCountry.loyaltyPointValue)
      : (countryConfig.loyaltyPointValue ?? 0.10);

    const discountAmount = calculatePointsDiscount(points, {
      loyaltyEnabled: dbCountry?.loyaltyEnabled ?? countryConfig.loyaltyEnabled ?? true,
      loyaltyPointValue,
      currencyDecimals: dbCountry?.currencyDecimals ?? countryConfig.currencyDecimals ?? 2,
    });

    // Sign verification token
    const verifiedToken = await signLoyaltyVerificationToken({
      userId: user.id,
      phone: normalizedPhone,
      points,
      countryCode: targetCountryCode,
    });

    return NextResponse.json({
      success: true,
      message: "Points verified successfully!",
      verifiedToken,
      pointsRedeemed: points,
      discountAmount,
      currency: countryConfig.currency,
    });
  } catch (error: any) {
    console.error("Error in /api/loyalty/otp/verify:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
