import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { stock, basePrice, active } = body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(stock !== undefined ? { stock: Number(stock) } : {}),
        ...(basePrice !== undefined ? { basePrice: Number(basePrice) } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin product update error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
