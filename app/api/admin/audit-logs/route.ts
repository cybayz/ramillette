import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession, isAdminRole } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (!isAdminRole(session.role) && session.role !== "STORE_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized access to audit trail" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    const entity = searchParams.get("entity") || "all";
    const action = searchParams.get("action") || "all";
    const userId = searchParams.get("userId") || "all";
    const timeRange = searchParams.get("timeRange") || "all";
    const q = (searchParams.get("q") || "").trim();

    // Construct where filter
    const where: any = {};

    if (entity !== "all") {
      where.entity = entity;
    }

    if (action !== "all") {
      where.action = action;
    }

    if (userId !== "all") {
      where.userId = userId;
    }

    // Time filter
    if (timeRange === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.createdAt = { gte: today };
    } else if (timeRange === "7d") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      where.createdAt = { gte: sevenDaysAgo };
    } else if (timeRange === "30d") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.createdAt = { gte: thirtyDaysAgo };
    }

    // Keyword search
    if (q) {
      where.OR = [
        { action: { contains: q, mode: "insensitive" } },
        { entity: { contains: q, mode: "insensitive" } },
        { entityId: { contains: q, mode: "insensitive" } },
        {
          user: {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Fetch logs and total count in parallel
    const [rawLogs, totalCount, todayCount, productCount, salesCount, inventoryCount, distinctUsers] =
      await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.auditLog.count({ where }),
        // Global stats
        prisma.auditLog.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.auditLog.count({ where: { entity: "PRODUCT" } }),
        prisma.auditLog.count({
          where: {
            action: { in: ["POS_SALE", "ORDER_STATUS_UPDATE", "ONLINE_SALE"] },
          },
        }),
        prisma.auditLog.count({
          where: {
            action: { in: ["STOCK_ADJUSTMENT", "STOCK_TRANSFER", "RETURN_PROCESSED"] },
          },
        }),
        // Distinct users who produced logs
        prisma.auditLog.findMany({
          where: { userId: { not: null } },
          distinct: ["userId"],
          select: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          take: 30,
        }),
      ]);

    const logs = rawLogs.map((log) => {
      const newValObj =
        typeof log.newValue === "object" && log.newValue !== null
          ? (log.newValue as Record<string, any>)
          : {};

      let fallbackSummary = `${log.action} on ${log.entity} (#${log.entityId})`;
      if (newValObj.summary) {
        fallbackSummary = String(newValObj.summary);
      }

      const userName = log.user
        ? `${log.user.firstName || ""} ${log.user.lastName || ""}`.trim() || log.user.email
        : newValObj.userName || "System / Automated";

      const userEmail = log.user?.email || newValObj.userEmail || null;

      return {
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        summary: fallbackSummary,
        oldValue: log.oldValue,
        newValue: log.newValue,
        ipAddress: log.ipAddress,
        storeId: log.storeId,
        createdAt: log.createdAt,
        user: {
          id: log.user?.id || log.userId || null,
          name: userName,
          email: userEmail,
          role: log.user?.role || "SYSTEM",
        },
      };
    });

    const activeUsers = distinctUsers
      .map((u) => u.user)
      .filter(Boolean)
      .map((u) => ({
        id: u!.id,
        name: `${u!.firstName || ""} ${u!.lastName || ""}`.trim() || u!.email,
        email: u!.email,
        role: u!.role,
      }));

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats: {
        totalCount,
        todayCount,
        productCount,
        salesCount,
        inventoryCount,
      },
      filterOptions: {
        users: activeUsers,
        entities: [
          { value: "all", label: "All Entities" },
          { value: "PRODUCT", label: "Products & Fragrances" },
          { value: "ORDER", label: "Sales & Orders" },
          { value: "STORE_INVENTORY", label: "Store Inventory" },
          { value: "RETURN", label: "Returns & Exchanges" },
          { value: "ROLE", label: "Roles & Permissions" },
        ],
        actions: [
          { value: "all", label: "All Actions" },
          { value: "PRODUCT_CREATE", label: "Product Created" },
          { value: "PRODUCT_UPDATE", label: "Product Updated" },
          { value: "PRODUCT_DELETE", label: "Product Deleted / Archived" },
          { value: "POS_SALE", label: "POS Retail Sale" },
          { value: "ORDER_STATUS_UPDATE", label: "Order Status Update" },
          { value: "STOCK_ADJUSTMENT", label: "Stock Adjustment" },
          { value: "RETURN_PROCESSED", label: "Return Processed" },
        ],
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch audit logs:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}
