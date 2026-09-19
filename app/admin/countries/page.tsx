import React from "react";
import prisma from "@/lib/db/prisma";
import { CountryManager, AdminCountry } from "@/components/admin/CountryManager";

export const revalidate = 0; // Always fresh in admin

export default async function AdminCountriesPage() {
  const dbCountries = await prisma.country.findMany({
    orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
  });

  const countries: AdminCountry[] = dbCountries.map((c) => ({
    code: c.code,
    name: c.name,
    nameAr: c.nameAr || "",
    flag: c.flag,
    currency: c.currency,
    currencyAr: c.currencyAr || "",
    currencySymbol: c.currencySymbol || c.currency,
    currencyDecimals: c.currencyDecimals,
    exchangeRate: Number(c.exchangeRate),
    phonePrefix: c.phonePrefix,
    standardShippingFee: Number(c.standardShippingFee),
    freeShippingThreshold: Number(c.freeShippingThreshold),
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
    paymentMethods: c.paymentMethods ? JSON.parse(c.paymentMethods) : ["COD", "ONLINE"],
    active: c.active,
    sortOrder: c.sortOrder,
  }));

  return <CountryManager initialCountries={countries} />;
}
