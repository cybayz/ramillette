import prisma from "@/lib/db/prisma";
import { SignJWT, jwtVerify } from "jose";

const LOYALTY_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ramillette-loyalty-secret-key-2026-secure"
);

export interface LoyaltyConfig {
  loyaltyEnabled?: boolean;
  loyaltyEarnType?: "SPEND_RATIO" | "PERCENTAGE" | "FLAT" | string;
  loyaltyEarnValue?: number;
  loyaltyPointValue?: number;
  loyaltyMinRedeemPoints?: number;
  currencyDecimals?: number;
}

/**
 * Calculates the number of loyalty points earned from a given order subtotal
 */
export function calculateEarnedPoints(subtotal: number, config: LoyaltyConfig): number {
  if (config.loyaltyEnabled === false || subtotal <= 0) {
    return 0;
  }

  const earnType = config.loyaltyEarnType || "SPEND_RATIO";
  const earnValue = Number(config.loyaltyEarnValue ?? 100);

  if (earnType === "FLAT") {
    return Math.max(0, Math.floor(earnValue));
  }

  if (earnType === "PERCENTAGE") {
    // e.g. earnValue = 1 means 1% of subtotal in points (e.g. 1000 QAR -> 10 points)
    const points = (subtotal * earnValue) / 100;
    return Math.max(0, Math.floor(points));
  }

  // SPEND_RATIO (default): e.g. 100 means 1 point for every 100 currency units spent
  const ratio = earnValue > 0 ? earnValue : 100;
  return Math.max(0, Math.floor(subtotal / ratio));
}

/**
 * Calculates the discount value in currency for a given amount of points
 */
export function calculatePointsDiscount(
  points: number,
  config: LoyaltyConfig
): number {
  if (config.loyaltyEnabled === false || points <= 0) {
    return 0;
  }

  const pointValue = Number(config.loyaltyPointValue ?? 0.10);
  const decimals = config.currencyDecimals ?? 2;
  const rawDiscount = points * pointValue;
  return Number(rawDiscount.toFixed(decimals));
}

/**
 * Sign an OTP verification token for loyalty points redemption
 */
export async function signLoyaltyVerificationToken(data: {
  userId: string;
  phone: string;
  points: number;
  countryCode: string;
}): Promise<string> {
  return await new SignJWT({
    userId: data.userId,
    phone: data.phone,
    points: data.points,
    countryCode: data.countryCode,
    purpose: "LOYALTY_REDEMPTION",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("20m") // Valid for 20 minutes during checkout session
    .sign(LOYALTY_SECRET);
}

/**
 * Verify a loyalty OTP verification token
 */
export async function verifyLoyaltyToken(
  token: string,
  userId: string
): Promise<{
  valid: boolean;
  points?: number;
  phone?: string;
  countryCode?: string;
  error?: string;
}> {
  try {
    const { payload } = await jwtVerify(token, LOYALTY_SECRET);
    if (payload.purpose !== "LOYALTY_REDEMPTION") {
      return { valid: false, error: "Invalid token purpose" };
    }
    if (payload.userId !== userId) {
      return { valid: false, error: "Token does not belong to current user" };
    }
    return {
      valid: true,
      points: Number(payload.points),
      phone: String(payload.phone),
      countryCode: String(payload.countryCode),
    };
  } catch (err: any) {
    return { valid: false, error: err.message || "Invalid or expired loyalty token" };
  }
}
