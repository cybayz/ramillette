import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { COUNTRIES as fallbackCountries, resolvePaymentMethods } from "@/lib/country/config";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const dbCountries = await prisma.country.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });

    if (dbCountries.length > 0) {
      const formatted = dbCountries.map((c) => ({
        code: c.code,
        name: c.name,
        nameAr: c.nameAr || c.name,
        flag: c.flag,
        currency: c.currency,
        currencyAr: c.currencyAr || c.currency,
        currencySymbol: c.currencySymbol || c.currency,
        currencyDecimals: c.currencyDecimals,
        exchangeRate: Number(c.exchangeRate),
        phonePrefix: c.phonePrefix,
        standardShippingFee: Number(c.standardShippingFee),
        freeShippingThreshold: Number(c.freeShippingThreshold),
        giftWrapFee: Number(c.giftWrapFee ?? 25),
        allowGiftWrap: c.allowGiftWrap ?? true,
        giftWrapOptions: c.giftWrapOptions
          ? JSON.parse(c.giftWrapOptions)
          : (fallbackCountries[c.code as keyof typeof fallbackCountries]?.giftWrapOptions || fallbackCountries.QA.giftWrapOptions),
        taxRate: Number(c.taxRate),
        taxName: c.taxName,
        taxIncludedInPrice: c.taxIncludedInPrice,
        defaultCity: c.defaultCity,
        cities: c.cities ? JSON.parse(c.cities) : [],
        boutiqueName: c.boutiqueName || "",
        boutiqueLocation: c.boutiqueLocation || "",
        boutiqueLocationAr: c.boutiqueLocationAr || "",
        deliveryNotice: c.deliveryNotice || "",
        deliveryNoticeAr: c.deliveryNoticeAr || "",
        phone: c.phone || "",
        supportEmail: c.supportEmail || "",
        orderEmail: c.orderEmail || "",
        paymentMethods: resolvePaymentMethods(
          c.code,
          c.paymentMethods ? JSON.parse(c.paymentMethods) : ["COD", "ONLINE"]
        ),
      }));
      return NextResponse.json({ success: true, countries: formatted });
    }

    // Fallback to static config if DB table is empty
    const fallbackList = Object.values(fallbackCountries).map((c) => ({
      ...c,
      currencySymbol: c.currency,
      taxRate: c.code === "AE" ? 5.0 : c.code === "BH" ? 10.0 : 0.0,
      taxName: "VAT",
      taxIncludedInPrice: false,
    }));

    return NextResponse.json({ success: true, countries: fallbackList });
  } catch (error) {
    console.error("Failed to fetch public countries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
