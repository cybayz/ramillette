import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const countries = await prisma.country.findMany({
      orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
    });

    const formatted = countries.map((c) => ({
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
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({ success: true, countries: formatted });
  } catch (error) {
    console.error("Admin fetch countries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      name,
      nameAr,
      flag,
      currency,
      currencyAr,
      currencySymbol,
      currencyDecimals = 2,
      exchangeRate = 1.0,
      phonePrefix,
      standardShippingFee = 30,
      freeShippingThreshold = 900,
      taxRate = 0,
      taxName = "VAT",
      taxIncludedInPrice = false,
      defaultCity,
      cities = [],
      boutiqueName,
      boutiqueLocation,
      boutiqueLocationAr,
      deliveryNotice,
      deliveryNoticeAr,
      phone,
      supportEmail,
      orderEmail,
      paymentMethods = ["COD", "ONLINE"],
      active = true,
      sortOrder = 10,
    } = body;

    const upperCode = code?.trim().toUpperCase();
    if (!upperCode || upperCode.length !== 2) {
      return NextResponse.json(
        { error: "A valid 2-letter country code is required (e.g. SA, KW, OM)." },
        { status: 400 }
      );
    }

    if (!name?.trim() || !currency?.trim() || !flag?.trim() || !phonePrefix?.trim()) {
      return NextResponse.json(
        { error: "Name, currency, flag, and phone prefix are required." },
        { status: 400 }
      );
    }

    // Check duplicate
    const existing = await prisma.country.findUnique({
      where: { code: upperCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Country with code ${upperCode} already exists.` },
        { status: 409 }
      );
    }

    const created = await prisma.country.create({
      data: {
        code: upperCode,
        name: name.trim(),
        nameAr: nameAr?.trim() || null,
        flag: flag.trim(),
        currency: currency.trim().toUpperCase(),
        currencyAr: currencyAr?.trim() || null,
        currencySymbol: currencySymbol?.trim() || currency.trim().toUpperCase(),
        currencyDecimals: Number(currencyDecimals) || 2,
        exchangeRate: Number(exchangeRate) || 1.0,
        phonePrefix: phonePrefix.trim(),
        standardShippingFee: Number(standardShippingFee) || 0,
        freeShippingThreshold: Number(freeShippingThreshold) || 900,
        taxRate: Number(taxRate) || 0,
        taxName: taxName?.trim() || "VAT",
        taxIncludedInPrice: Boolean(taxIncludedInPrice),
        defaultCity: defaultCity?.trim() || (cities[0] ? cities[0] : "Capital City"),
        cities: JSON.stringify(Array.isArray(cities) ? cities : [defaultCity || "Capital City"]),
        boutiqueName: boutiqueName?.trim() || null,
        boutiqueLocation: boutiqueLocation?.trim() || null,
        boutiqueLocationAr: boutiqueLocationAr?.trim() || null,
        deliveryNotice: deliveryNotice?.trim() || `Express Delivery on orders over ${currency} ${freeShippingThreshold}`,
        deliveryNoticeAr: deliveryNoticeAr?.trim() || null,
        phone: phone?.trim() || null,
        supportEmail: supportEmail?.trim() || null,
        orderEmail: orderEmail?.trim() || null,
        paymentMethods: JSON.stringify(paymentMethods),
        active: Boolean(active),
        sortOrder: Number(sortOrder) || 10,
      },
    });

    // Auto-create ProductCountry records for all existing products so the new region has default prices
    const products = await prisma.product.findMany({ select: { id: true, basePrice: true, stock: true } });
    const rate = Number(exchangeRate) || 1.0;
    const decimals = Number(currencyDecimals) || 2;

    for (const p of products) {
      const baseNum = Number(p.basePrice);
      const convertedPrice = decimals === 3
        ? Number((baseNum * rate).toFixed(3))
        : Math.round(baseNum * rate);

      await prisma.productCountry.create({
        data: {
          productId: p.id,
          country: upperCode,
          price: convertedPrice,
          compareAtPrice: null,
          stock: Math.round(p.stock * 0.4),
          active: true,
        },
      }).catch(() => {}); // ignore duplicates
    }

    return NextResponse.json({ success: true, country: created });
  } catch (error) {
    console.error("Admin create country error:", error);
    return NextResponse.json(
      { error: "Failed to create country" },
      { status: 500 }
    );
  }
}
