import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { createSession } from "@/lib/auth/session";
import { mergeUserCartAndWishlist } from "@/lib/cart/mergeCart";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, code, countryPrefix = "+974", guestCart, guestWishlist } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Mobile number is required" },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string" || code.trim().length !== 6) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit verification code" },
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

    const trimmedCode = code.trim();

    // 1. Verify OTP against database
    const verification = await prisma.otpVerification.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "No verification code was requested for this mobile number." },
        { status: 400 }
      );
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (verification.code !== trimmedCode) {
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
        { error: "Invalid verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // OTP is valid! Remove OTP record
    await prisma.otpVerification.delete({ where: { id: verification.id } });

    // 2. Find or create user
    const rawDigits = normalizedPhone.replace(/\D/g, "");
    const localDigits = normalizedPhone.replace(/^\+\d{1,4}/, "").replace(/^0+/, "");

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { phone: localDigits },
          { phone: { endsWith: localDigits } },
        ],
      },
    });

    if (!user) {
      // Auto-register new customer account
      const syntheticEmail = `phone_${rawDigits}@ramillette.user`;

      // Check if synthetic email exists (unlikely edge case)
      const existingEmail = await prisma.user.findUnique({
        where: { email: syntheticEmail },
      });

      if (existingEmail) {
        user = existingEmail;
      } else {
        user = await prisma.user.create({
          data: {
            phone: normalizedPhone,
            email: syntheticEmail,
            passwordHash: "",
            role: "CUSTOMER",
          },
        });
      }
    } else if (!user.phone) {
      // Update phone if missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phone: normalizedPhone },
      });
    }

    // 3. Issue Session Cookie
    const displayName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.phone ||
      "Customer";

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: displayName,
    });

    // 4. Merge Guest Cart & Wishlist
    const { cart: mergedCart, wishlist: mergedWishlist } =
      await mergeUserCartAndWishlist(user.id, guestCart, guestWishlist);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
      mergedCart,
      mergedWishlist,
    });
  } catch (error) {
    console.error("Error in /api/auth/otp/verify:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
