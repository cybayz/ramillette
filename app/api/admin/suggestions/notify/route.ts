import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession, isAdminRole } from "@/lib/auth/session";
import { sendProductAvailableEmail } from "@/lib/services/email";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, productUrl, customMessage } = body;

    if (!id) {
      return NextResponse.json({ error: "Suggestion ID is required" }, { status: 400 });
    }

    const suggestion = await prisma.productSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    // Send email to the customer
    await sendProductAvailableEmail({
      customerEmail: suggestion.userEmail,
      productName: suggestion.productName,
      productUrl: productUrl || undefined,
      customMessage: customMessage || undefined,
    });

    // Update suggestion status and notifiedAt timestamp
    const updated = await prisma.productSuggestion.update({
      where: { id },
      data: {
        status: "AVAILABLE",
        notifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Customer ${suggestion.userEmail} has been notified successfully!`,
      suggestion: updated,
    });
  } catch (error: any) {
    console.error("Admin notify suggestion error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to notify customer" },
      { status: 500 }
    );
  }
}
