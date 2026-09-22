import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser } from "@/lib/erp/context";

export async function GET(request: Request) {
  try {
    const user = await getErpUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access to ERP" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    const whereClause: any = {
      role: "CUSTOMER",
    };

    if (query) {
      whereClause.OR = [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
      ];
    }

    const customers = await prisma.user.findMany({
      where: whereClause,
      include: {
        addresses: { where: { isDefault: true } },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            currency: true,
            channel: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      take: 50,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      customers: customers.map((c) => {
        const totalSpent = c.orders
          .filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED")
          .reduce((sum, o) => sum + Number(o.total), 0);

        const posOrdersCount = c.orders.filter((o) => o.channel === "POS").length;
        const onlineOrdersCount = c.orders.filter((o) => o.channel === "ONLINE").length;

        return {
          id: c.id,
          name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.email.split("@")[0],
          email: c.email,
          phone: c.phone,
          city: c.addresses[0]?.city || "Doha",
          country: c.addresses[0]?.country || "Qatar",
          totalSpent,
          ordersCount: c.orders.length,
          posOrdersCount,
          onlineOrdersCount,
          recentOrders: c.orders.slice(0, 3).map((o) => ({
            orderNumber: o.orderNumber,
            total: Number(o.total),
            channel: o.channel,
            createdAt: o.createdAt,
          })),
        };
      }),
    });
  } catch (error) {
    console.error("Customers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
