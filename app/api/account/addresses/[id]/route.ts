import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

interface Props {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: Request, { params }: Props) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.userId !== session.userId) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id },
    });

    // If the deleted address was default, promote another address to default
    if (address.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete address:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Props) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.userId !== session.userId) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    if (body.makeDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });

      const updated = await prisma.address.update({
        where: { id },
        data: { isDefault: true },
      });

      return NextResponse.json({ success: true, address: updated });
    }

    // Full or partial edit
    const { name, phone, addressLine1, addressLine2, city, area, country, postalCode, isDefault } =
      body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(addressLine1 !== undefined && { addressLine1: addressLine1.trim() }),
        ...(addressLine2 !== undefined && { addressLine2: addressLine2 ? addressLine2.trim() : null }),
        ...(city !== undefined && { city: city.trim() }),
        ...(area !== undefined && { area: area ? area.trim() : null }),
        ...(country !== undefined && { country: country.trim() }),
        ...(postalCode !== undefined && { postalCode: postalCode ? postalCode.trim() : null }),
        ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
      },
    });

    return NextResponse.json({ success: true, address: updated });
  } catch (error) {
    console.error("Failed to update address:", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}
