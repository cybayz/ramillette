import React from "react";
import prisma from "@/lib/db/prisma";
import { LoyaltyManager } from "@/components/admin/LoyaltyManager";
import { AdminCountry } from "@/components/admin/CountryManager";
import { COUNTRIES, CountryCode } from "@/lib/country/config";

export const revalidate = 0; // Always fresh in admin

export default async function AdminLoyaltyPage() {
  const [dbCountries, dbCustomers, dbTransactions] = await Promise.all([
    prisma.country.findMany({
      orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        rewardPoints: true,
        orders: {
          select: { id: true },
        },
      },
      orderBy: { rewardPoints: "desc" },
      take: 100,
    }),
    prisma.rewardPointTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
    }),
  ]);

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
    giftWrapFee: Number(c.giftWrapFee ?? 25),
    allowGiftWrap: c.allowGiftWrap ?? true,
    giftWrapOptions: c.giftWrapOptions
      ? JSON.parse(c.giftWrapOptions)
      : (COUNTRIES[c.code as CountryCode]?.giftWrapOptions || []),
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
    loyaltyEnabled: c.loyaltyEnabled,
    loyaltyEarnType: c.loyaltyEarnType,
    loyaltyEarnValue: Number(c.loyaltyEarnValue),
    loyaltyPointValue: Number(c.loyaltyPointValue),
    loyaltyMinRedeemPoints: c.loyaltyMinRedeemPoints,
    active: c.active,
    sortOrder: c.sortOrder,
  }));

  const customers = dbCustomers.map((u) => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    rewardPoints: u.rewardPoints,
    orderCount: u.orders.length,
  }));

  const transactions = dbTransactions.map((t) => ({
    id: t.id,
    points: t.points,
    balanceAfter: t.balanceAfter,
    type: t.type,
    description: t.description,
    country: t.country,
    createdAt: t.createdAt.toISOString(),
    user: t.user,
    order: t.order,
  }));

  return (
    <LoyaltyManager
      initialCountries={countries}
      customers={customers}
      recentTransactions={transactions}
    />
  );
}
