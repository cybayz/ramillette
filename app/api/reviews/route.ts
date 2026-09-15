import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, authorName, rating, title, comment } = body;

    if (!productId || !authorName || !comment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId,
        authorName,
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        title,
        comment,
        approved: true, // Auto-approve for verified customer experience
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
