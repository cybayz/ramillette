import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, countryPrefix = "+974" } = body;

    if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
      return NextResponse.json(
        { error: "Mobile number is required" },
        { status: 400 }
      );
    }

    // Clean and normalize phone number
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");
    let normalizedPhone = cleaned;

    if (!normalizedPhone.startsWith("+")) {
      const cleanPrefix = countryPrefix.startsWith("+")
        ? countryPrefix
        : `+${countryPrefix}`;
      normalizedPhone = `${cleanPrefix}${normalizedPhone.replace(/^0+/, "")}`;
    }

    // Basic digit validation
    const digitsOnly = normalizedPhone.replace(/\D/g, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 16) {
      return NextResponse.json(
        { error: "Please enter a valid mobile phone number" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP code
    // For demo/dev convenience, use a reliable 6-digit code or random code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Upsert into OtpVerification
    await prisma.otpVerification.upsert({
      where: { phone: normalizedPhone },
      create: {
        phone: normalizedPhone,
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

    console.log(`[AUTH OTP] Sent code ${otpCode} to ${normalizedPhone}`);

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
      phone: normalizedPhone,
      devOtp: otpCode, // Provided for instant demo/development testing
    });
  } catch (error) {
    console.error("Error in /api/auth/otp/send:", error);
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}
