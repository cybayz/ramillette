import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, hasPermission } from "@/lib/erp/context";

export const ALL_SYSTEM_PERMISSIONS = [
  {
    category: "Storefront & Retail",
    permissions: [
      { key: "pos:access", label: "POS Sales Terminal", description: "Ring up retail sales, scan barcodes, split payments & print receipts (/erp/pos)" },
      { key: "returns:manage", label: "Returns Desk", description: "Accept, inspect, and refund in-store & online returns (/erp/returns)" },
      { key: "customers:view", label: "Customer Directory", description: "Search customer profiles, phone numbers, and past purchase histories (/erp/customers)" },
    ],
  },
  {
    category: "Online Fulfillment",
    permissions: [
      { key: "orders:view", label: "View Online Orders", description: "Access store-assigned incoming regional e-commerce orders (/erp/orders)" },
      { key: "orders:fulfill", label: "Order Picking & Shipping", description: "Accept orders (reserve stock), mark picked, pack, and ship with courier tracking" },
    ],
  },
  {
    category: "Inventory & Warehousing",
    permissions: [
      { key: "inventory:view", label: "View Stock & Ledger", description: "Inspect physical and available inventory balances and immutable transaction ledger (/erp/inventory)" },
      { key: "inventory:adjust", label: "Manual Stock Adjustments", description: "Log manual inventory balance adjustments, damage write-offs, and stock audit corrections" },
      { key: "transfers:manage", label: "Inter-Store Transfers", description: "Request, approve, dispatch transit, and confirm receipt of inter-branch transfers (/erp/transfers)" },
      { key: "purchasing:manage", label: "Supplier Purchasing & Intake", description: "Generate POs and intake supplier stock receipts (/erp/purchases)" },
    ],
  },
  {
    category: "Analytics & Administration",
    permissions: [
      { key: "reports:view", label: "Shift & Sales Analytics", description: "View daily revenue, cash/card payment reconciliations, and top-selling products (/erp/reports)" },
      { key: "setup:manage", label: "Store Provisioning", description: "Configure new store branches, tax rules, and initial settings (/erp/setup)" },
      { key: "roles:manage", label: "Roles & Permission Matrix", description: "Create custom roles and dynamically grant/revoke functional permissions (/erp/roles)" },
      { key: "admin:access", label: "Central Admin Console", description: "Access the central e-commerce platform management console (/admin)" },
    ],
  },
];

export async function GET() {
  try {
    const user = await getErpUser();
    if (!user || !hasPermission(user, "roles:manage")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const roles = await prisma.customRole.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      success: true,
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        displayName: r.displayName,
        description: r.description,
        isSystem: r.isSystem,
        defaultLanding: r.defaultLanding,
        usersCount: r._count.users,
        permissions: r.permissions.map((p) => p.permission),
      })),
      catalog: ALL_SYSTEM_PERMISSIONS,
    });
  } catch (error) {
    console.error("GET /api/erp/roles error:", error);
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getErpUser();
    if (!user || !hasPermission(user, "roles:manage")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { name, displayName, description, defaultLanding, permissions } = body;

    if (!displayName || !displayName.trim()) {
      return NextResponse.json({ error: "Role display title is required" }, { status: 400 });
    }

    // Slugify name
    const roleKey = (name || displayName)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_")
      .slice(0, 40);

    const existing = await prisma.customRole.findUnique({
      where: { name: roleKey },
    });

    if (existing) {
      return NextResponse.json({ error: `A role with identifier "${roleKey}" already exists` }, { status: 400 });
    }

    const createdRole = await prisma.customRole.create({
      data: {
        name: roleKey,
        displayName: displayName.trim(),
        description: description?.trim() || null,
        defaultLanding: defaultLanding?.trim() || "/erp",
        isSystem: false,
        permissions: {
          create: Array.isArray(permissions)
            ? permissions.map((p: string) => ({ permission: p }))
            : [],
        },
      },
      include: {
        permissions: true,
      },
    });

    return NextResponse.json({
      success: true,
      role: {
        id: createdRole.id,
        name: createdRole.name,
        displayName: createdRole.displayName,
        description: createdRole.description,
        isSystem: createdRole.isSystem,
        defaultLanding: createdRole.defaultLanding,
        permissions: createdRole.permissions.map((p) => p.permission),
        usersCount: 0,
      },
    });
  } catch (error) {
    console.error("POST /api/erp/roles error:", error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getErpUser();
    if (!user || !hasPermission(user, "roles:manage")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { id, displayName, description, defaultLanding, permissions } = body;

    if (!id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    const role = await prisma.customRole.findUnique({
      where: { id },
    });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Update role fields
    await prisma.customRole.update({
      where: { id },
      data: {
        ...(displayName ? { displayName: displayName.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(defaultLanding ? { defaultLanding: defaultLanding.trim() } : {}),
      },
    });

    // Update permissions if supplied
    if (Array.isArray(permissions)) {
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      for (const p of permissions) {
        await prisma.rolePermission.create({
          data: {
            roleId: id,
            permission: p,
          },
        });
      }
    }

    const updated = await prisma.customRole.findUnique({
      where: { id },
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
    });

    return NextResponse.json({
      success: true,
      role: {
        id: updated!.id,
        name: updated!.name,
        displayName: updated!.displayName,
        description: updated!.description,
        isSystem: updated!.isSystem,
        defaultLanding: updated!.defaultLanding,
        permissions: updated!.permissions.map((p) => p.permission),
        usersCount: updated!._count.users,
      },
    });
  } catch (error) {
    console.error("PATCH /api/erp/roles error:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getErpUser();
    if (!user || !hasPermission(user, "roles:manage")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    const role = await prisma.customRole.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json({ error: "System roles cannot be deleted" }, { status: 400 });
    }

    if (role._count.users > 0) {
      return NextResponse.json({
        error: `Cannot delete role. ${role._count.users} user(s) are currently assigned to it. Please reassign them first.`,
      }, { status: 400 });
    }

    await prisma.customRole.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/erp/roles error:", error);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}
