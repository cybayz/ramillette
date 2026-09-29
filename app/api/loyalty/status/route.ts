import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CountryCode, getCountryConfig } from "@/lib/country/config";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ authenticated: false, points: 0 });
    }

    const { searchParams } = new URL(request.url);
    const countryCodeParam = searchParams.get("country") || "QA";
    const targetCountryCode = countryCodeParam.toUpperCase() as CountryCode;
    const countryConfig = getCountryConfig(targetCountryCode);

    const [user, dbCountry] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          rewardPoints: true,
          rewardPointTransactions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      }),
      prisma.country.findUnique({
        where: { code: targetCountryCode },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ authenticated: false, points: 0 });
    }

    const loyaltyPointValue = dbCountry
      ? Number(dbCountry.loyaltyPointValue)
      : (countryConfig.loyaltyPointValue ?? 0.10);
    const loyaltyEnabled = dbCountry?.loyaltyEnabled ?? countryConfig.loyaltyEnabled ?? true;
    const loyaltyEarnType = dbCountry?.loyaltyEarnType || countryConfig.loyaltyEarnType || "SPEND_RATIO";
    const loyaltyEarnValue = dbCountry ? Number(dbCountry.loyaltyEarnValue) : (countryConfig.loyaltyEarnValue ?? 100);
    const loyaltyMinRedeemPoints = dbCountry?.loyaltyMinRedeemPoints ?? countryConfig.loyaltyMinRedeemPoints ?? 10;

    const estimatedDiscountValue = Number(
      (user.rewardPoints * loyaltyPointValue).toFixed(
        dbCountry?.currencyDecimals ?? countryConfig.currencyDecimals ?? 2
      )
    );

    return NextResponse.json({
      authenticated: true,
      points: user.rewardPoints,
      estimatedDiscountValue,
      currency: countryConfig.currency,
      currencyAr: countryConfig.currencyAr,
      currencySymbol: dbCountry?.currencySymbol || countryConfig.currency,
      phone: user.phone,
      config: {
        loyaltyEnabled,
        loyaltyEarnType,
        loyaltyEarnValue,
        loyaltyPointValue,
        loyaltyMinRedeemPoints,
      },
      recentTransactions: user.rewardPointTransactions,
    });
  } catch (error) {
    console.error("Error in /api/loyalty/status:", error);
    return NextResponse.json({ error: "Failed to fetch loyalty status" }, { status: 500 });
  }
}
