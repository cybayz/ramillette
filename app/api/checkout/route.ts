import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { getPaymentProvider } from "@/lib/payments";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Please sign in or create an account to proceed with your order." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      addressLine1,
      addressLine2,
      area,
      city = "Doha",
      country = "Qatar",
      deliveryNotes,
      paymentMethod = "COD", // COD or ONLINE
      couponCode,
      items,
    } = body;

    // 1. Basic validation
    if (!customerName || !customerEmail || !customerPhone || !addressLine1) {
      return NextResponse.json(
        { error: "Customer name, email, phone, and delivery address are required." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Shopping cart is empty." },
        { status: 400 }
      );
    }

    // 2. SERVER-SIDE PRICING & INVENTORY RECALCULATION (Never trust client prices)
    let calculatedSubtotal = 0;
    const validatedOrderItems: {
      productId: string;
      variantId?: string;
      productName: string;
      variantName?: string;
      sku?: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product || !product.active) {
        return NextResponse.json(
          { error: `Product not found or unavailable: ${item.name || item.productId}` },
          { status: 400 }
        );
      }

      let unitPrice = Number(product.basePrice);
      let variantName: string | undefined = undefined;
      let sku = product.sku || undefined;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant || !variant.active) {
          return NextResponse.json(
            { error: `Selected variant is no longer available for ${product.name}` },
            { status: 400 }
          );
        }
        if (variant.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name} (${variant.name}). Only ${variant.stock} left.` },
            { status: 400 }
          );
        }
        unitPrice = Number(variant.price);
        variantName = variant.name;
        sku = variant.sku || sku;
      } else {
        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name}. Only ${product.stock} left.` },
            { status: 400 }
          );
        }
      }

      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      validatedOrderItems.push({
        productId: product.id,
        variantId: item.variantId,
        productName: product.name,
        variantName,
        sku,
        quantity: item.quantity,
        unitPrice,
        total: lineTotal,
      });
    }

    // 3. Server-side Coupon Recalculation
    let discountAmount = 0;
    let appliedCouponId: string | null = null;

    if (couponCode && couponCode.trim()) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (
        coupon &&
        coupon.active &&
        (!coupon.minimumOrder || calculatedSubtotal >= Number(coupon.minimumOrder)) &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)
      ) {
        appliedCouponId = coupon.id;
        if (coupon.type === "PERCENTAGE") {
          discountAmount = (calculatedSubtotal * Number(coupon.value)) / 100;
          if (coupon.maximumDiscount) {
            discountAmount = Math.min(discountAmount, Number(coupon.maximumDiscount));
          }
        } else {
          discountAmount = Math.min(Number(coupon.value), calculatedSubtotal);
        }
      }
    }

    // 4. Shipping Calculation: Free on orders over QAR 900
    const shippingFee = calculatedSubtotal >= 900 ? 0.0 : 30.0;
    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

    // 5. Generate Human-readable Unique Order Number (e.g. RAM-2609-8472)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(2, 7).replace("-", "");
    const orderNumber = `RAM-${dateStr}-${randomSuffix}`;

    // 6. Database Transaction: Create Order, Deduct Stock, Increment Coupon
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: session?.userId || null,
          orderNumber,
          status: "CONFIRMED",
          paymentStatus: paymentMethod === "ONLINE" ? "PAID" : "PENDING",
          fulfillmentStatus: "UNFULFILLED",
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress: {
            name: customerName,
            phone: customerPhone,
            addressLine1,
            addressLine2: addressLine2 || null,
            area: area || null,
            city,
            country,
          },
          billingAddress: {
            name: customerName,
            addressLine1,
            city,
            country,
          },
          deliveryNotes: deliveryNotes || null,
          subtotal: calculatedSubtotal,
          discount: discountAmount,
          shipping: shippingFee,
          tax: 0.0,
          total: finalTotal,
          currency: "QAR",
          paymentMethod,
          items: {
            create: validatedOrderItems.map((oi) => ({
              productId: oi.productId,
              variantId: oi.variantId,
              productName: oi.productName,
              variantName: oi.variantName,
              sku: oi.sku,
              quantity: oi.quantity,
              unitPrice: oi.unitPrice,
              total: oi.total,
            })),
          },
        },
      });

      // Deduct stock
      for (const item of validatedOrderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Increment coupon if applied
      if (appliedCouponId) {
        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Save address to user if logged in
      if (session?.userId) {
        await tx.address.create({
          data: {
            userId: session.userId,
            name: customerName,
            phone: customerPhone,
            addressLine1,
            addressLine2: addressLine2 || null,
            area: area || null,
            city,
            country,
            isDefault: false,
          },
        });
      }

      return createdOrder;
    });

    // 7. Payment Provider Abstraction
    const provider = getPaymentProvider(paymentMethod);
    const paymentResult = await provider.initiatePayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: finalTotal,
      currency: "QAR",
      customerName,
      customerEmail,
      customerPhone,
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      paymentResult,
    });
  } catch (error) {
    console.error("Checkout execution error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout. Please try again." },
      { status: 500 }
    );
  }
}
