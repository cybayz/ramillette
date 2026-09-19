import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      area,
      country,
      postalCode,
      isDefault,
    } = body;

    if (!name || !phone || !addressLine1 || !city || !country) {
      return NextResponse.json(
        { error: "Please provide all required address fields." },
        { status: 400 }
      );
    }

    const existingCount = await prisma.address.count({
      where: { userId: session.userId },
    });
    const shouldBeDefault = Boolean(isDefault || existingCount === 0);

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: session.userId,
        name: name.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2?.trim() || null,
        city: city.trim(),
        area: area?.trim() || null,
        country: country.trim(),
        postalCode: postalCode?.trim() || null,
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json({ success: true, address: newAddress });
  } catch (error) {
    console.error("Failed to create address:", error);
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }
}
