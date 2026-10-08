import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { sendSuggestionConfirmationEmail } from "@/lib/services/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productName, userEmail, notes, searchQuery } = body;

    if (!productName || typeof productName !== "string" || !productName.trim()) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!userEmail || typeof userEmail !== "string" || !userEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const cleanProductName = productName.trim();
    const cleanEmail = userEmail.trim().toLowerCase();
    const cleanNotes = typeof notes === "string" ? notes.trim() : null;
    const cleanSearchQuery = typeof searchQuery === "string" ? searchQuery.trim() : null;

    const suggestion = await prisma.productSuggestion.create({
      data: {
        productName: cleanProductName,
        userEmail: cleanEmail,
        notes: cleanNotes || null,
        searchQuery: cleanSearchQuery || null,
        status: "PENDING",
      },
    });

    // Fire email confirmation in background safely
    try {
      await sendSuggestionConfirmationEmail({
        customerEmail: cleanEmail,
        productName: cleanProductName,
      });
    } catch (emailErr) {
      console.warn("Failed to dispatch suggestion confirmation email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Your suggestion has been submitted successfully!",
      suggestion,
    });
  } catch (error: any) {
    console.error("Error creating product suggestion:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit product suggestion" },
      { status: 500 }
    );
  }
}
