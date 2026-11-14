import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { getErpUser, hasPermission } from "@/lib/erp/context";

export async function GET() {
  try {
    const user = await getErpUser();
    if (!user || !hasPermission(user, "roles:manage")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const [staffUsers, stores] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: { not: "CUSTOMER" },
        },
        include: {
          customRole: true,
          assignedStore: {
            include: { region: true, country: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.store.findMany({
        where: { active: true },
        select: { id: true, name: true, code: true, countryCode: true },
        orderBy: [{ countryCode: "asc" }, { name: "asc" }],
      }),
    ]);

    return NextResponse.json({
      success: true,
      stores,
      users: staffUsers.map((u) => ({
        id: u.id,
        email: u.email,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
        phone: u.phone,
        role: u.role,
        customRoleId: u.customRoleId,
        customRoleName: u.customRole?.displayName || u.role,
        assignedStoreId: u.assignedStoreId,
        storeName: u.assignedStore?.name || "Global / Unassigned",
        storeCode: u.assignedStore?.code || null,
        regionName: u.assignedStore?.region?.name || null,
        countryCode: u.assignedStore?.countryCode || null,
      })),
    });
  } catch (error) {
    console.error("GET /api/erp/roles/users error:", error);
    return NextResponse.json({ error: "Failed to fetch staff members" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getErpUser();
    if (!user || !hasPermission(user, "roles:manage")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();

    // Create New Staff Member (e.g. Cashier)
    if (body.action === "create") {
      const { email, password, firstName, lastName, phone, role, customRoleId, assignedStoreId } = body;
      if (!email || !password || !firstName) {
        return NextResponse.json({ error: "First name, email and password are required" }, { status: 400 });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const roleEnum = role || "CASHIER";

      const newUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName: firstName.trim(),
          lastName: lastName?.trim() || null,
          phone: phone?.trim() || null,
          role: roleEnum as any,
          customRoleId: customRoleId || null,
          assignedStoreId: assignedStoreId || null,
        },
        include: {
          customRole: true,
          assignedStore: true,
        },
      });

      if (assignedStoreId) {
        await prisma.userStore.create({
          data: {
            userId: newUser.id,
            storeId: assignedStoreId,
            isDefault: true,
          },
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: `${newUser.firstName || ""} ${newUser.lastName || ""}`.trim() || newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          customRoleId: newUser.customRoleId,
          customRoleName: newUser.customRole?.displayName || newUser.role,
          assignedStoreId: newUser.assignedStoreId,
          storeName: newUser.assignedStore?.name || "Global / Unassigned",
          storeCode: newUser.assignedStore?.code || null,
        },
      });
    }

    const { userId, customRoleId, assignedStoreId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let roleName = targetUser.role;
    if (customRoleId) {
      const customRole = await prisma.customRole.findUnique({
        where: { id: customRoleId },
      });
      if (customRole) {
        // Map to corresponding prisma Role if matches, or retain existing
        const possibleRoles = ["SUPER_ADMIN", "STORE_MANAGER", "CASHIER", "INVENTORY_MANAGER", "FULFILLMENT_STAFF", "ACCOUNTANT", "ADMIN"];
        if (possibleRoles.includes(customRole.name)) {
          roleName = customRole.name as any;
        }
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        role: roleName,
        customRoleId: customRoleId || null,
        ...(assignedStoreId !== undefined ? { assignedStoreId: assignedStoreId || null } : {}),
      },
      include: {
        customRole: true,
        assignedStore: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: `${updated.firstName || ""} ${updated.lastName || ""}`.trim() || updated.email,
        role: updated.role,
        customRoleId: updated.customRoleId,
        customRoleName: updated.customRole?.displayName || updated.role,
        assignedStoreId: updated.assignedStoreId,
        storeName: updated.assignedStore?.name || "Global / Unassigned",
      },
    });
  } catch (error) {
    console.error("POST /api/erp/roles/users error:", error);
    return NextResponse.json({ error: "Failed to update staff member role" }, { status: 500 });
  }
}
