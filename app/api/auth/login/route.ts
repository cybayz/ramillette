import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { mergeUserCartAndWishlist } from "@/lib/cart/mergeCart";
import { getDefaultLandingPage, getUserPermissions } from "@/lib/erp/context";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, guestCart, guestWishlist } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        customRole: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
    });

    // Merge guest cart & wishlist with user account in database
    const { cart: mergedCart, wishlist: mergedWishlist } = await mergeUserCartAndWishlist(
      user.id,
      guestCart,
      guestWishlist
    );

    const landingPage = getDefaultLandingPage(user);
    const permissions = getUserPermissions(user);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        customRoleName: user.customRole?.displayName || user.role,
      },
      landingPage,
      permissions,
      mergedCart,
      mergedWishlist,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
