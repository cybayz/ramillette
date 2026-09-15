import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
    },
  });

  return NextResponse.json({ user });
}
