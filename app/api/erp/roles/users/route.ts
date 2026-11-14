import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
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
        firstName: u.firstName || "",
        lastName: u.lastName || "",
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

    // Reset Staff Member Password (Super Admin / Authorized Admin)
    if (body.action === "reset_password" || body.action === "reset-password") {
      const { userId, newPassword } = body;
      if (!userId || !newPassword) {
        return NextResponse.json({ error: "User ID and new password are required" }, { status: 400 });
      }

      if (typeof newPassword !== "string" || newPassword.trim().length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
      }

      // Safeguard: Only Super Admin can reset another Super Admin's password
      if (targetUser.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Only a Super Administrator can reset credentials for this account." },
          { status: 403 }
        );
      }

      const passwordHash = await bcrypt.hash(newPassword.trim(), 10);

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      // Audit log entry
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "STAFF_PASSWORD_RESET",
          entity: "User",
          entityId: targetUser.id,
          newValue: {
            targetEmail: targetUser.email,
            resetBy: user.email,
          },
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: `Password reset successfully for ${targetUser.email}`,
      });
    }

    // Create New Staff Member (e.g. Cashier)
    if (body.action === "create") {
      const { email, password, firstName, lastName, phone, role, customRoleId, assignedStoreId } = body;
      if (!email || !password || !firstName) {
        return NextResponse.json({ error: "First name, email and password are required" }, { status: 400 });
      }

      if (password.trim().length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password.trim(), 10);
      const roleEnum = role || "CASHIER";

      const newUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName: firstName.trim(),
          lastName: lastName?.trim() || null,
          phone: phone?.trim() || null,
          role: roleEnum as Role,
          customRoleId: customRoleId || null,
          assignedStoreId: assignedStoreId || null,
        },
        include: {
          customRole: true,
          assignedStore: true,
        },
      });

      if (assignedStoreId) {
        await prisma.userStore.upsert({
          where: {
            userId_storeId: {
              userId: newUser.id,
              storeId: assignedStoreId,
            },
          },
          create: {
            userId: newUser.id,
            storeId: assignedStoreId,
            isDefault: true,
          },
          update: {
            isDefault: true,
          },
        }).catch(() => {});
      }

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "STAFF_USER_CREATED",
          entity: "User",
          entityId: newUser.id,
          newValue: {
            email: newUser.email,
            role: newUser.role,
            assignedStoreId,
            createdBy: user.email,
          },
        },
      }).catch(() => {});

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

    // Delete Staff Member via POST action
    if (body.action === "delete") {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
      }

      if (user.id === userId) {
        return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
      }

      if (targetUser.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Only a Super Administrator can remove another Super Administrator." },
          { status: 403 }
        );
      }

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "STAFF_USER_DELETED",
          entity: "User",
          entityId: targetUser.id,
          oldValue: {
            email: targetUser.email,
            name: `${targetUser.firstName || ""} ${targetUser.lastName || ""}`.trim(),
            role: targetUser.role,
            storeId: targetUser.assignedStoreId,
          },
          newValue: {
            deletedBy: user.email,
          },
        },
      }).catch(() => {});

      await prisma.user.delete({
        where: { id: userId },
      });

      return NextResponse.json({
        success: true,
        message: `Staff member ${targetUser.email} has been permanently deleted.`,
      });
    }

    // Update / Edit Staff Member (Role, Branch, Contact, Name, Email)
    const { userId, customRoleId, assignedStoreId, firstName, lastName, email, phone, role } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If email is changing, ensure it's not taken by another user
    if (email && email.trim().toLowerCase() !== targetUser.email.toLowerCase()) {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          id: { not: userId },
        },
      });
      if (existing) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
      }
    }

    let roleName = targetUser.role;
    if (role) {
      roleName = role as Role;
    } else if (customRoleId) {
      const customRole = await prisma.customRole.findUnique({
        where: { id: customRoleId },
      });
      if (customRole) {
        const possibleRoles = ["SUPER_ADMIN", "STORE_MANAGER", "CASHIER", "INVENTORY_MANAGER", "FULFILLMENT_STAFF", "ACCOUNTANT", "ADMIN"];
        if (possibleRoles.includes(customRole.name)) {
          roleName = customRole.name as Role;
        }
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        role: roleName,
        customRoleId: customRoleId !== undefined ? (customRoleId || null) : undefined,
        ...(assignedStoreId !== undefined ? { assignedStoreId: assignedStoreId || null } : {}),
        ...(firstName !== undefined ? { firstName: firstName?.trim() || null } : {}),
        ...(lastName !== undefined ? { lastName: lastName?.trim() || null } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
        ...(email && email.trim() ? { email: email.trim().toLowerCase() } : {}),
      },
      include: {
        customRole: true,
        assignedStore: true,
      },
    });

    if (assignedStoreId !== undefined) {
      if (assignedStoreId) {
        await prisma.userStore.upsert({
          where: {
            userId_storeId: {
              userId: updated.id,
              storeId: assignedStoreId,
            },
          },
          create: {
            userId: updated.id,
            storeId: assignedStoreId,
            isDefault: true,
          },
          update: {
            isDefault: true,
          },
        }).catch(() => {});
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "STAFF_USER_UPDATED",
        entity: "User",
        entityId: updated.id,
        oldValue: {
          email: targetUser.email,
          role: targetUser.role,
          storeId: targetUser.assignedStoreId,
        },
        newValue: {
          email: updated.email,
          role: updated.role,
          storeId: updated.assignedStoreId,
          updatedBy: user.email,
        },
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: `${updated.firstName || ""} ${updated.lastName || ""}`.trim() || updated.email,
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        phone: updated.phone || "",
        role: updated.role,
        customRoleId: updated.customRoleId,
        customRoleName: updated.customRole?.displayName || updated.role,
        assignedStoreId: updated.assignedStoreId,
        storeName: updated.assignedStore?.name || "Global / Unassigned",
      },
    });
  } catch (error) {
    console.error("POST /api/erp/roles/users error:", error);
    return NextResponse.json({ error: "Failed to update staff member" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getErpUser();
    if (!user || !hasPermission(user, "roles:manage")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id") || searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (user.id === userId) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    if (targetUser.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only a Super Administrator can remove another Super Administrator." },
        { status: 403 }
      );
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "STAFF_USER_DELETED",
        entity: "User",
        entityId: targetUser.id,
        oldValue: {
          email: targetUser.email,
          name: `${targetUser.firstName || ""} ${targetUser.lastName || ""}`.trim(),
          role: targetUser.role,
          storeId: targetUser.assignedStoreId,
        },
        newValue: {
          deletedBy: user.email,
        },
      },
    }).catch(() => {});

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: `Staff member ${targetUser.email} has been permanently deleted.`,
    });
  } catch (error) {
    console.error("DELETE /api/erp/roles/users error:", error);
    return NextResponse.json({ error: "Failed to delete staff member" }, { status: 500 });
  }
}
