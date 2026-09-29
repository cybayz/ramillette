import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { getSmsProvider } from "@/lib/services/sms";
import { CountryCode, getCountryConfig } from "@/lib/country/config";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Please log in to redeem loyalty points." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pointsToRedeem, phone: customPhone, countryCode = "QA" } = body;

    const points = parseInt(String(pointsToRedeem), 10);
    if (isNaN(points) || points <= 0) {
      return NextResponse.json(
        { error: "Please specify a valid number of points to redeem." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, phone: true, rewardPoints: true, firstName: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.rewardPoints < points) {
      return NextResponse.json(
        {
          error: `Insufficient points balance. You have ${user.rewardPoints} points available.`,
        },
        { status: 400 }
      );
    }

    // Determine target phone number (either user.phone or customPhone from checkout)
    const phoneToUse = customPhone || user.phone;
    if (!phoneToUse || typeof phoneToUse !== "string" || phoneToUse.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide a valid mobile number to receive the verification OTP." },
        { status: 400 }
      );
    }

    const targetCountryCode = (countryCode?.toUpperCase() || "QA") as CountryCode;
    const countryConfig = getCountryConfig(targetCountryCode);

    // Clean and normalize phone number
    const cleaned = phoneToUse.replace(/[\s\-\(\)]/g, "");
    let normalizedPhone = cleaned;
    if (!normalizedPhone.startsWith("+")) {
      const cleanPrefix = countryConfig.phonePrefix.startsWith("+")
        ? countryConfig.phonePrefix
        : `+${countryConfig.phonePrefix}`;
      normalizedPhone = `${cleanPrefix}${normalizedPhone.replace(/^0+/, "")}`;
    }

    // Basic digit validation
    const digitsOnly = normalizedPhone.replace(/\D/g, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 16) {
      return NextResponse.json(
        { error: "Please enter a valid mobile phone number." },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // Store in OtpVerification
    const otpKey = `LOYALTY:${normalizedPhone}`;
    await prisma.otpVerification.upsert({
      where: { phone: otpKey },
      create: {
        phone: otpKey,
        code: otpCode,
        expiresAt,
        attempts: 0,
      },
      update: {
        code: otpCode,
        expiresAt,
        attempts: 0,
      },
    });

    // Send SMS via configured SMS provider
    try {
      const smsProvider = getSmsProvider(targetCountryCode);
      await smsProvider.sendOtp(normalizedPhone, otpCode);
    } catch (smsErr) {
      console.warn("[LOYALTY OTP] SMS dispatch error, falling back to log:", smsErr);
    }

    console.log(
      `[LOYALTY OTP] Sent redemption OTP ${otpCode} for ${points} points to ${normalizedPhone}`
    );

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${normalizedPhone}`,
      phone: normalizedPhone,
      devOtp: otpCode, // For seamless dev/testing convenience
    });
  } catch (error: any) {
    console.error("Error in /api/loyalty/otp/send:", error);
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}
