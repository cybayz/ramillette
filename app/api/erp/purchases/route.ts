import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore, canManageInventory } from "@/lib/erp/context";

export async function GET() {
  try {
    const user = await getErpUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access to ERP" }, { status: 403 });
    }

    const storeContext = await getActiveErpStore();
    if (!storeContext) {
      return NextResponse.json({ error: "No active store context found" }, { status: 400 });
    }

    const storeId = storeContext.store.id;

    const [suppliers, purchaseOrders] = await Promise.all([
      prisma.supplier.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
      }),
      prisma.purchaseOrder.findMany({
        where: { storeId },
        include: {
          supplier: true,
          createdBy: { select: { firstName: true, lastName: true, email: true } },
          items: {
            include: {
              product: { select: { name: true, sku: true } },
              variant: { select: { name: true, sku: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      success: true,
      store: storeContext.context,
      suppliers,
      purchaseOrders: purchaseOrders.map((po) => ({
        id: po.id,
        poNumber: po.poNumber,
        supplierName: po.supplier.name,
        supplierCompany: po.supplier.company,
        status: po.status,
        totalAmount: Number(po.totalAmount),
        notes: po.notes,
        orderedAt: po.orderedAt,
        receivedAt: po.receivedAt,
        createdAt: po.createdAt,
        itemsCount: po.items.length,
        items: po.items.map((it) => ({
          id: it.id,
          productName: it.product.name,
          variantName: it.variant?.name || null,
          displayName: it.variant ? `${it.product.name} (${it.variant.name})` : it.product.name,
          sku: it.variant?.sku || it.product.sku,
          unitCost: Number(it.unitCost),
          quantityOrdered: it.quantityOrdered,
          quantityReceived: it.quantityReceived,
        })),
      })),
    });
  } catch (error) {
    console.error("Purchase orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getErpUser();
    if (!user || !canManageInventory(user.role)) {
      return NextResponse.json({ error: "Unauthorized: Insufficient inventory permissions" }, { status: 403 });
    }

    const storeContext = await getActiveErpStore();
    if (!storeContext) {
      return NextResponse.json({ error: "No active store context found" }, { status: 400 });
    }

    const body = await request.json();
    const { supplierId, items, notes } = body;

    if (!supplierId) {
      return NextResponse.json({ error: "Supplier is required" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Purchase order must contain at least one item" }, { status: 400 });
    }

    const storeId = storeContext.store.id;
    const poNumber = `PO-${storeContext.store.code}-${Date.now().toString().slice(-6)}`;

    let calculatedTotal = 0;
    for (const it of items) {
      calculatedTotal += (Number(it.unitCost) || 0) * (Number(it.quantityOrdered) || 1);
    }

    const created = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        storeId,
        status: "ORDERED",
        totalAmount: calculatedTotal,
        notes: notes?.trim() || null,
        orderedAt: new Date(),
        createdById: user.id,
        items: {
          create: items.map((it: any) => ({
            productId: it.productId,
            variantId: it.variantId || null,
            unitCost: Number(it.unitCost) || 0,
            quantityOrdered: Number(it.quantityOrdered) || 1,
            quantityReceived: 0,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      message: `Purchase Order #${poNumber} created successfully`,
      purchaseOrder: created,
    });
  } catch (error: any) {
    console.error("Create purchase order error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create purchase order" }, { status: 500 });
  }
}
