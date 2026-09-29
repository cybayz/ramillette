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
    const { userId, pointsDelta, reason, countryCode = "QA" } = body;

    const delta = parseInt(String(pointsDelta), 10);
    if (isNaN(delta) || delta === 0) {
      return NextResponse.json(
        { error: "Valid non-zero points amount is required." },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, rewardPoints: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    const newBalance = targetUser.rewardPoints + delta;
    if (newBalance < 0) {
      return NextResponse.json(
        { error: `Cannot deduct ${Math.abs(delta)} points. User only has ${targetUser.rewardPoints} points.` },
        { status: 400 }
      );
    }

    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { rewardPoints: newBalance },
      }),
      prisma.rewardPointTransaction.create({
        data: {
          userId,
          points: delta,
          balanceAfter: newBalance,
          type: "ADJUSTMENT",
          description: reason || `Admin adjustment by ${session.email || "Admin"}`,
          country: countryCode.toUpperCase(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Successfully adjusted ${delta > 0 ? `+${delta}` : delta} points.`,
      rewardPoints: updatedUser.rewardPoints,
      transaction,
    });
  } catch (error: any) {
    console.error("Admin loyalty adjust error:", error);
    return NextResponse.json(
      { error: "Failed to adjust points" },
      { status: 500 }
    );
  }
}
