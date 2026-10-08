import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

function parseDateSafely(val: any): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ authenticated: false, birthday: null, anniversary: null, hasBoth: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { birthday: true, anniversary: true },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, birthday: null, anniversary: null, hasBoth: false });
    }

    const hasBirthday = Boolean(user.birthday);
    const hasAnniversary = Boolean(user.anniversary);

    return NextResponse.json({
      authenticated: true,
      birthday: user.birthday ? user.birthday.toISOString().split("T")[0] : null,
      anniversary: user.anniversary ? user.anniversary.toISOString().split("T")[0] : null,
      hasBirthday,
      hasAnniversary,
      hasBoth: hasBirthday && hasAnniversary,
    });
  } catch (error) {
    console.error("Error fetching celebration dates:", error);
    return NextResponse.json({ error: "Failed to fetch celebration dates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json().catch(() => ({}));
    const { birthday, anniversary, orderNumber } = body;

    let targetUserId: string | null = session?.userId || null;

    // Fallback: If guest or redirected right after order checkout, resolve user via orderNumber
    if (!targetUserId && orderNumber) {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        select: { userId: true, customerEmail: true },
      });

      if (order?.userId) {
        targetUserId = order.userId;
      } else if (order?.customerEmail) {
        const matchingUser = await prisma.user.findUnique({
          where: { email: order.customerEmail },
          select: { id: true },
        });
        if (matchingUser) targetUserId = matchingUser.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "No authenticated user or matching order found" },
        { status: 401 }
      );
    }

    const dataToUpdate: Record<string, any> = {};

    if (birthday !== undefined) {
      dataToUpdate.birthday = parseDateSafely(birthday);
    }

    if (anniversary !== undefined) {
      dataToUpdate.anniversary = parseDateSafely(anniversary);
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: dataToUpdate,
      select: { id: true, birthday: true, anniversary: true },
    });

    const hasBirthday = Boolean(updatedUser.birthday);
    const hasAnniversary = Boolean(updatedUser.anniversary);

    return NextResponse.json({
      success: true,
      birthday: updatedUser.birthday ? updatedUser.birthday.toISOString().split("T")[0] : null,
      anniversary: updatedUser.anniversary ? updatedUser.anniversary.toISOString().split("T")[0] : null,
      hasBoth: hasBirthday && hasAnniversary,
      message: "Celebration dates updated successfully",
    });
  } catch (error) {
    console.error("Error updating celebration dates:", error);
    return NextResponse.json({ error: "Failed to update celebration dates" }, { status: 500 });
  }
}
