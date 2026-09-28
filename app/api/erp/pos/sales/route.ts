import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getErpUser, getActiveErpStore, canAccessPos } from "@/lib/erp/context";
import { recordPosSale } from "@/lib/inventory/inventoryService";

export async function POST(request: Request) {
  try {
    const user = await getErpUser();
    if (!user || !canAccessPos(user.role)) {
      return NextResponse.json({ error: "Unauthorized: Insufficient POS permissions" }, { status: 403 });
    }

    const storeContext = await getActiveErpStore();
    if (!storeContext) {
      return NextResponse.json({ error: "No active store context found" }, { status: 400 });
    }

    const body = await request.json();
    const {
      idempotencyKey,
      items,
      customerName = "Walk-in Customer",
      customerPhone,
      customerEmail,
      payments,
      discount = 0,
      notes,
    } = body;

    // 1. Idempotency Check: Prevent duplicate charge on network retries
    if (idempotencyKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: { items: true, posPayments: true },
      });
      if (existingOrder) {
        return NextResponse.json({
          success: true,
          duplicate: true,
          message: "Transaction already processed",
          order: existingOrder,
        });
      }
    }

    // 2. Validate Items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Sale must contain at least one item" }, { status: 400 });
    }

    // 3. Validate Payments
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      return NextResponse.json({ error: "At least one payment method is required" }, { status: 400 });
    }

    const store = storeContext.store;
    let calculatedSubtotal = 0;

    for (const item of items) {
      const price = Number(item.unitPrice) || 0;
      const qty = Number(item.quantity) || 1;
      calculatedSubtotal += price * qty;
    }

    const discountNum = Number(discount) || 0;
    const taxableSubtotal = Math.max(0, calculatedSubtotal - discountNum);
    const taxRate = store.taxRate ? Number(store.taxRate) : Number(store.country.taxRate);
    const calculatedTax = Number(((taxableSubtotal * taxRate) / 100).toFixed(store.country.currencyDecimals || 2));
    const finalTotal = Math.max(0, calculatedSubtotal - discountNum + calculatedTax);

    // Verify payments cover total amount (with small floating tolerance)
    const paidTotal = payments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
    if (paidTotal < finalTotal - 0.05) {
      return NextResponse.json(
        { error: `Insufficient payment: Received ${paidTotal.toFixed(2)}, required ${finalTotal.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Generate POS Invoice / Receipt Number (e.g. RP-2026-0021)
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `RP-${currentYear}-${String(randomSuffix).padStart(4, "0")}`;

    // 4. Atomic Transaction: Create Order, Deduct Store Stock, Write Ledger, Save Split Payments
    const result = await prisma.$transaction(
      async (tx) => {
        // A. Create Order
        const primaryPaymentMethod = payments.length > 1 ? "SPLIT" : payments[0].method;

        const createdOrder = await tx.order.create({
          data: {
            orderNumber,
            channel: "POS",
            status: "DELIVERED",
            paymentStatus: "PAID",
            fulfillmentStatus: "FULFILLED",
            assignedStoreId: store.id,
            idempotencyKey: idempotencyKey || null,
            customerName: customerName.trim(),
            customerEmail: customerEmail?.trim() || `${orderNumber.toLowerCase()}@pos.ramillette.internal`,
            customerPhone: customerPhone?.trim() || store.phone || "+974 5555 1234",
            shippingAddress: {
              type: "IN_STORE_PICKUP",
              storeName: store.name,
              storeCode: store.code,
              address: store.address,
              country: store.country.name,
            },
            billingAddress: {
              storeName: store.name,
              address: store.address,
            },
            adminNotes: notes ? `Cashier: ${user.firstName || user.email} | ${notes}` : `Cashier: ${user.firstName || user.email}`,
            subtotal: calculatedSubtotal,
            discount: discountNum,
            shipping: 0.0,
            tax: calculatedTax,
            total: finalTotal,
            currency: store.currency,
            country: store.countryCode,
            paymentMethod: primaryPaymentMethod,
            shippedAt: new Date(),
            items: {
              create: items.map((it: any) => ({
                productId: it.productId,
                variantId: it.variantId || null,
                productName: it.productName || it.name || "Product",
                variantName: it.variantName || null,
                sku: it.sku || null,
                quantity: Number(it.quantity) || 1,
                unitPrice: Number(it.unitPrice) || 0,
                total: (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1),
              })),
            },
          },
          include: { items: true },
        });

        // B. Record Split Payments
        for (const p of payments) {
          await tx.posPayment.create({
            data: {
              orderId: createdOrder.id,
              paymentMethod: p.method,
              amount: Number(p.amount) || 0,
              reference: p.reference?.trim() || null,
              status: "COMPLETED",
            },
          });
        }

        // C. Atomically Deduct Store Inventory & Write SALE Ledger Entries
        for (const it of items) {
          await recordPosSale(
            {
              storeId: store.id,
              productId: it.productId,
              variantId: it.variantId || null,
              quantity: Number(it.quantity) || 1,
              referenceId: orderNumber,
              performedById: user.id,
            },
            tx
          );
        }

        return createdOrder;
      },
      {
        maxWait: 15000,
        timeout: 30000,
      }
    );

    return NextResponse.json({
      success: true,
      message: "POS sale completed successfully",
      order: result,
      receipt: {
        orderNumber: result.orderNumber,
        invoiceNumber: result.orderNumber,
        storeName: store.name,
        storeCode: store.code,
        storeAddress: store.address,
        storePhone: store.phone,
        cashierName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        customerName: result.customerName,
        customerPhone: result.customerPhone,
        items: items.map((it: any) => ({
          name: it.name,
          subtitle: it.subtitle || "Extrait De Parfum",
          variantName: it.variantName || (it.name?.match(/\((.*?)\)/)?.[1] ?? null),
          sku: it.sku,
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice),
          total: Number(it.unitPrice) * Number(it.quantity),
        })),
        subtotal: calculatedSubtotal,
        discount: discountNum,
        tax: calculatedTax,
        taxRate,
        total: finalTotal,
        currency: store.currency,
        payments,
        paymentMethod: result.paymentMethod || "CARD",
        paidAmount: paidTotal,
        balance: Math.max(0, paidTotal - finalTotal),
        createdAt: result.createdAt,
      },
    });
  } catch (error: any) {
    console.error("POS sale processing error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process POS sale" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getErpUser();
    if (!user || !canAccessPos(user.role)) {
      return NextResponse.json({ error: "Unauthorized: Insufficient POS permissions" }, { status: 403 });
    }

    const storeContext = await getActiveErpStore();
    if (!storeContext) {
      return NextResponse.json({ error: "No active store context found" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const period = searchParams.get("period") || "all"; // "today" or "all"
    const store = storeContext.store;

    const whereClause: any = {
      channel: "POS",
      assignedStoreId: store.id,
    };

    if (period === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      whereClause.createdAt = { gte: startOfDay };
    }

    if (query) {
      whereClause.OR = [
        { orderNumber: { contains: query, mode: "insensitive" } },
        { customerName: { contains: query, mode: "insensitive" } },
        { customerPhone: { contains: query, mode: "insensitive" } },
      ];
    }

    const rawOrders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    const sales = rawOrders.map((o) => {
      const subtotal = Number(o.subtotal);
      const discount = Number(o.discount);
      let discountPercent: string | null = null;
      if (discount > 0 && subtotal > 0) {
        discountPercent = `${Math.round((discount / subtotal) * 100)}%`;
      }

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        invoiceNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        paymentMethod: o.paymentMethod,
        subtotal,
        discount,
        discountPercent,
        tax: Number(o.tax),
        total: Number(o.total),
        currency: o.currency || store.currency,
        itemCount: o.items.reduce((sum, it) => sum + it.quantity, 0),
        items: o.items.map((it) => ({
          id: it.id,
          name: it.productName,
          subtitle: "Extrait De Parfum",
          variantName: it.variantName || (it.productName.match(/\((.*?)\)/)?.[1] ?? null),
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice),
          total: Number(it.total),
        })),
        createdAt: o.createdAt,
        receiptData: {
          orderNumber: o.orderNumber,
          invoiceNumber: o.orderNumber,
          storeName: store.name,
          storePhone: store.phone,
          cashierName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
          customerName: o.customerName,
          createdAt: o.createdAt,
          items: o.items.map((it) => ({
            id: it.id,
            name: it.productName,
            subtitle: "Extrait De Parfum",
            variantName: it.variantName || (it.productName.match(/\((.*?)\)/)?.[1] ?? null),
            quantity: it.quantity,
            unitPrice: Number(it.unitPrice),
            total: Number(it.total),
          })),
          subtotal,
          discount,
          discountPercent,
          tax: Number(o.tax),
          total: Number(o.total),
          currency: o.currency || store.currency,
          paymentMethod: o.paymentMethod || "CARD",
          paidAmount: Number(o.total),
          balance: 0,
          qrPayload: `https://www.ramillette.com/?invoice=${encodeURIComponent(o.orderNumber)}`,
          websiteUrl: "WWW.RAMILLETTE.COM",
        },
      };
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaySales = sales.filter((s) => new Date(s.createdAt) >= startOfToday);
    const todayTotal = todaySales.reduce((acc, s) => acc + s.total, 0);

    return NextResponse.json({
      success: true,
      sales,
      summary: {
        todayCount: todaySales.length,
        todayTotal,
        currency: store.currency,
      },
    });
  } catch (error: any) {
    console.error("Failed to load POS sales history:", error);
    return NextResponse.json({ error: error?.message || "Failed to load sales history" }, { status: 500 });
  }
}
