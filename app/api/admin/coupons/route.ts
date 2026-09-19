import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.error("Admin coupons fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { code, type, value, minimumOrder, usageLimit, isPublic, description } = body;

    if (!code || value === undefined) {
      return NextResponse.json(
        { error: "Code and discount value are required" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    try {
      const coupon = await prisma.coupon.create({
        data: {
          code: cleanCode,
          type: type === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE",
          value: Number(value),
          minimumOrder: minimumOrder ? Number(minimumOrder) : null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
          description: description ? description.trim() : null,
          active: true,
        },
      });
      return NextResponse.json(coupon);
    } catch (err: any) {
      // Fallback if in-memory prisma client is stale
      if (err.message?.includes("isPublic") || err.message?.includes("description")) {
        const id = `cpn_${Date.now()}`;
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Coupon" ("id", "code", "type", "value", "minimumOrder", "usageLimit", "usedCount", "isPublic", "description", "active", "createdAt") 
           VALUES ($1, $2, $3::"DiscountType", $4, $5, $6, 0, $7, $8, true, NOW())`,
          id,
          cleanCode,
          type === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE",
          Number(value),
          minimumOrder ? Number(minimumOrder) : null,
          usageLimit ? Number(usageLimit) : null,
          isPublic !== undefined ? Boolean(isPublic) : true,
          description ? description.trim() : null
        );
        const created = await prisma.coupon.findUnique({ where: { id } });
        return NextResponse.json(created);
      }
      throw err;
    }
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A coupon with this code already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, code, type, active, isPublic, description, value, minimumOrder, usageLimit } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    let updated;
    try {
      updated = await prisma.coupon.update({
        where: { id },
        data: {
          ...(code !== undefined ? { code: code.trim().toUpperCase() } : {}),
          ...(type !== undefined ? { type: type === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE" } : {}),
          ...(active !== undefined ? { active: Boolean(active) } : {}),
          ...(isPublic !== undefined ? { isPublic: Boolean(isPublic) } : {}),
          ...(description !== undefined ? { description: description ? description.trim() : null } : {}),
          ...(value !== undefined ? { value: Number(value) } : {}),
          ...(minimumOrder !== undefined
            ? { minimumOrder: minimumOrder ? Number(minimumOrder) : null }
            : {}),
          ...(usageLimit !== undefined
            ? { usageLimit: usageLimit ? Number(usageLimit) : null }
            : {}),
        },
      });
    } catch (err: any) {
      console.warn("Standard prisma update failed, using raw SQL fallback:", err?.message);
      // Raw SQL fallback for updating database directly
      if (isPublic !== undefined) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Coupon" SET "isPublic" = $1 WHERE id = $2`,
          Boolean(isPublic),
          id
        );
      }
      if (active !== undefined) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Coupon" SET "active" = $1 WHERE id = $2`,
          Boolean(active),
          id
        );
      }
      if (description !== undefined) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Coupon" SET "description" = $1 WHERE id = $2`,
          description ? description.trim() : null,
          id
        );
      }
      if (code !== undefined) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Coupon" SET "code" = $1 WHERE id = $2`,
          code.trim().toUpperCase(),
          id
        );
      }
      if (value !== undefined) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Coupon" SET "value" = $1 WHERE id = $2`,
          Number(value),
          id
        );
      }
      if (minimumOrder !== undefined) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Coupon" SET "minimumOrder" = $1 WHERE id = $2`,
          minimumOrder ? Number(minimumOrder) : null,
          id
        );
      }
      if (usageLimit !== undefined) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Coupon" SET "usageLimit" = $1 WHERE id = $2`,
          usageLimit ? Number(usageLimit) : null,
          id
        );
      }

      updated = await prisma.coupon.findUnique({ where: { id } });
    }

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error: any) {
    console.error("Admin coupon update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Admin coupon delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
