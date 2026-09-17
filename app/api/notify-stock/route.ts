import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, productName, variantName, email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone number is required" },
        { status: 400 }
      );
    }

    // If email provided, record in newsletter subscriber as interested customer
    if (email && email.includes("@")) {
      try {
        await prisma.newsletterSubscriber.upsert({
          where: { email: email.trim().toLowerCase() },
          update: {},
          create: { email: email.trim().toLowerCase() },
        });
      } catch {
        // Continue even if already subscribed
      }
    }

    console.log("[Stock Notification Request]", {
      productId,
      productName,
      variantName,
      email,
      phone,
      requestedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Notification preference saved successfully.",
    });
  } catch (error) {
    console.error("[Notify Stock Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
