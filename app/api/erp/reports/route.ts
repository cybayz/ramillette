import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore, canViewReports } from "@/lib/erp/context";

export async function GET(request: Request) {
  try {
    const user = await getErpUser();
    if (!user || !canViewReports(user.role)) {
      return NextResponse.json({ error: "Unauthorized: Insufficient reporting permissions" }, { status: 403 });
    }

    const storeContext = await getActiveErpStore();
    if (!storeContext) {
      return NextResponse.json({ error: "No active store context found" }, { status: 400 });
    }

    const storeId = storeContext.store.id;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "today"; // "today", "week", "month"

    const now = new Date();
    let startDate = new Date(now.setHours(0, 0, 0, 0));

    if (range === "week") {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "month") {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const [orders, lowStockCount, totalProductsCount] = await Promise.all([
      prisma.order.findMany({
        where: {
          assignedStoreId: storeId,
          createdAt: { gte: startDate },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
        include: {
          items: true,
          posPayments: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.storeInventory.count({
        where: {
          storeId,
          availableQuantity: { lte: 10 },
        },
      }),
      prisma.storeInventory.count({
        where: { storeId },
      }),
    ]);

    let totalRevenue = 0;
    let posRevenue = 0;
    let onlineRevenue = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const paymentMethods: Record<string, number> = {};
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    for (const ord of orders) {
      const orderTotal = Number(ord.total);
      totalRevenue += orderTotal;
      totalDiscount += Number(ord.discount);
      totalTax += Number(ord.tax);

      if (ord.channel === "POS") {
        posRevenue += orderTotal;
      } else {
        onlineRevenue += orderTotal;
      }

      // Payments
      if (ord.posPayments && ord.posPayments.length > 0) {
        for (const p of ord.posPayments) {
          paymentMethods[p.paymentMethod] = (paymentMethods[p.paymentMethod] || 0) + Number(p.amount);
        }
      } else {
        paymentMethods[ord.paymentMethod] = (paymentMethods[ord.paymentMethod] || 0) + orderTotal;
      }

      // Products
      for (const item of ord.items) {
        const key = item.productId || item.productName;
        if (!productSales[key]) {
          productSales[key] = {
            name: item.variantName ? `${item.productName} (${item.variantName})` : item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += Number(item.total);
      }
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const pendingOnlineCount = await prisma.order.count({
      where: {
        channel: "ONLINE",
        assignedStoreId: storeId,
        fulfillmentStatus: "UNFULFILLED",
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    return NextResponse.json({
      success: true,
      store: storeContext.context,
      metrics: {
        totalRevenue,
        posRevenue,
        onlineRevenue,
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        totalDiscount,
        totalTax,
        pendingOnlineCount,
        lowStockCount,
        totalProductsCount,
      },
      paymentMethods,
      topProducts,
      recentOrders: orders.slice(0, 10).map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        channel: o.channel,
        customerName: o.customerName,
        total: Number(o.total),
        paymentMethod: o.paymentMethod,
        status: o.status,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    console.error("ERP reports fetch error:", error);
    return NextResponse.json({ error: "Failed to generate ERP reports" }, { status: 500 });
  }
}
