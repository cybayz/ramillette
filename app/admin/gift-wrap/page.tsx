import React from "react";
import prisma from "@/lib/db/prisma";
import { GiftWrapManager, GiftWrapCountry } from "@/components/admin/GiftWrapManager";
import { COUNTRIES, CountryCode } from "@/lib/country/config";

export const revalidate = 0; // Always fresh in admin

export default async function AdminGiftWrapPage() {
  const dbCountries = await prisma.country.findMany({
    orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
  });

  const countries: GiftWrapCountry[] = dbCountries.map((c) => ({
    code: c.code,
    name: c.name,
    nameAr: c.nameAr || "",
    flag: c.flag,
    currency: c.currency,
    currencySymbol: c.currencySymbol || c.currency,
    allowGiftWrap: c.allowGiftWrap ?? true,
    giftWrapFee: Number(c.giftWrapFee ?? 25),
    giftWrapOptions: c.giftWrapOptions
      ? JSON.parse(c.giftWrapOptions)
      : (COUNTRIES[c.code as CountryCode]?.giftWrapOptions || []),
  }));

  return <GiftWrapManager initialCountries={countries} />;
}
