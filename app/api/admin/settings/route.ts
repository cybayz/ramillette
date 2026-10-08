import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession, isAdminRole } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    const allowedKeys = [
      "announcementText",
      "storeAddress",
      "storePhone",
      "storeEmail",
      "boutiqueName",
      "birthdayOfferEnabled",
      "birthdayOfferType",
      "birthdayOfferValue",
      "birthdayOfferDaysBefore",
      "birthdayOfferMinSpend",
      "anniversaryOfferEnabled",
      "anniversaryOfferType",
      "anniversaryOfferValue",
      "anniversaryOfferDaysBefore",
      "anniversaryOfferMinSpend",
      "paylaterEnabled",
      "paylaterEnvironment",
      "paylaterClientId",
      "paylaterClientSecret",
      "paylaterOutletId",
      "paylaterApiKey",
      "paylaterWebhookSecret",
      "paylaterMinAmount",
      "paylaterMaxAmount",
    ];

    const updates = [];
    for (const [key, rawValue] of Object.entries(body)) {
      if (allowedKeys.includes(key) && rawValue !== undefined && rawValue !== null) {
        const value = String(rawValue);
        updates.push(
          prisma.siteSetting.upsert({
            where: { key },
            create: { key, value },
            update: { value },
          })
        );
      }
    }

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Admin settings save error:", error);
    return NextResponse.json(
      { error: "Failed to update store settings" },
      { status: 500 }
    );
  }
}
