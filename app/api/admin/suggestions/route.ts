import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession, isAdminRole } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const query = searchParams.get("q")?.trim();

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (query) {
      where.OR = [
        { productName: { contains: query, mode: "insensitive" } },
        { userEmail: { contains: query, mode: "insensitive" } },
        { searchQuery: { contains: query, mode: "insensitive" } },
        { notes: { contains: query, mode: "insensitive" } },
      ];
    }

    const [suggestions, total, pendingCount, inReviewCount, availableCount, rejectedCount] =
      await Promise.all([
        prisma.productSuggestion.findMany({
          where,
          orderBy: { createdAt: "desc" },
        }),
        prisma.productSuggestion.count(),
        prisma.productSuggestion.count({ where: { status: "PENDING" } }),
        prisma.productSuggestion.count({ where: { status: "IN_REVIEW" } }),
        prisma.productSuggestion.count({ where: { status: "AVAILABLE" } }),
        prisma.productSuggestion.count({ where: { status: "REJECTED" } }),
      ]);

    return NextResponse.json({
      success: true,
      suggestions,
      counts: {
        total,
        pending: pendingCount,
        inReview: inReviewCount,
        available: availableCount,
        rejected: rejectedCount,
      },
    });
  } catch (error: any) {
    console.error("Admin suggestions fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ error: "Suggestion ID is required" }, { status: 400 });
    }

    const updated = await prisma.productSuggestion.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes: adminNotes ? adminNotes.trim() : null } : {}),
      },
    });

    return NextResponse.json({ success: true, suggestion: updated });
  } catch (error: any) {
    console.error("Admin suggestion update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update suggestion" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Suggestion ID is required" }, { status: 400 });
    }

    await prisma.productSuggestion.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Suggestion deleted successfully",
    });
  } catch (error: any) {
    console.error("Admin suggestion delete error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete suggestion" },
      { status: 500 }
    );
  }
}
