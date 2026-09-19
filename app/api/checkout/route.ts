import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CountryCode, getCountryConfig, isValidCountry } from "@/lib/country/config";
import { resolveProductForCountry, resolveVariantForCountry } from "@/lib/country/productResolver";
import { getPaymentProvider } from "@/lib/services/payment";
import { getSmsProvider } from "@/lib/services/sms";
import { getEmailProvider } from "@/lib/services/email";

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
      city,
      country = "Qatar",
      countryCode: rawCountryCode,
      deliveryNotes,
      paymentMethod = "COD",
      couponCode,
      items,
    } = body;

    // Resolve Country Code
    let targetCountryCode: CountryCode = "QA";
    if (isValidCountry(rawCountryCode)) {
      targetCountryCode = rawCountryCode;
    } else if (country.includes("Emirates") || country.includes("UAE") || country === "AE") {
      targetCountryCode = "AE";
    } else if (country.includes("Bahrain") || country === "BH") {
      targetCountryCode = "BH";
    }

    const countryConfig = getCountryConfig(targetCountryCode);

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

    // 2. SERVER-SIDE PRICING & INVENTORY RECALCULATION PER COUNTRY
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
        include: {
          countries: true,
          variants: {
            include: { countries: true },
          },
        },
      });

      if (!product || !product.active) {
        return NextResponse.json(
          { error: `Product not found or unavailable: ${item.name || item.productId}` },
          { status: 400 }
        );
      }

      const resolvedProd = resolveProductForCountry(product, targetCountryCode);
      let unitPrice = resolvedProd.price;
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

        const resolvedVar = resolveVariantForCountry(variant, targetCountryCode);
        if (resolvedVar.stock < item.quantity) {
          return NextResponse.json(
            {
              error: `Insufficient stock in ${countryConfig.name} for ${product.name} (${variant.name}). Only ${resolvedVar.stock} available.`,
            },
            { status: 400 }
          );
        }

        unitPrice = resolvedVar.price;
        variantName = variant.name;
        sku = variant.sku || sku;
      } else {
        if (resolvedProd.stock < item.quantity) {
          return NextResponse.json(
            {
              error: `Insufficient stock in ${countryConfig.name} for ${product.name}. Only ${resolvedProd.stock} available.`,
            },
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

    // 4. Country-Specific Shipping Calculation
    const shippingFee =
      calculatedSubtotal >= countryConfig.freeShippingThreshold
        ? 0.0
        : countryConfig.standardShippingFee;

    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

    // 5. Generate Human-readable Unique Order Number (e.g. RAM-QA-2609-8472)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(2, 7).replace("-", "");
    const orderNumber = `RAM-${targetCountryCode}-${dateStr}-${randomSuffix}`;

    // 6. Database Transaction: Create Order, Deduct Country Stock, Increment Coupon
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: session?.userId || null,
          orderNumber,
          status: "CONFIRMED",
          paymentStatus: paymentMethod === "ONLINE" || paymentMethod === "TABBY_TAMARA" || paymentMethod === "BENEFIT_PAY" ? "PAID" : "PENDING",
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
            city: city || countryConfig.defaultCity,
            country: countryConfig.name,
            countryCode: targetCountryCode,
          },
          billingAddress: {
            name: customerName,
            addressLine1,
            city: city || countryConfig.defaultCity,
            country: countryConfig.name,
          },
          deliveryNotes: deliveryNotes || null,
          subtotal: calculatedSubtotal,
          discount: discountAmount,
          shipping: shippingFee,
          tax: 0.0,
          total: finalTotal,
          currency: countryConfig.currency,
          country: targetCountryCode,
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

      // Deduct country warehouse stock or base stock
      for (const item of validatedOrderItems) {
        if (item.variantId) {
          // Check if explicit country record exists
          const existingVariantCountry = await tx.productVariantCountry.findUnique({
            where: {
              variantId_country: {
                variantId: item.variantId,
                country: targetCountryCode,
              },
            },
          });

          if (existingVariantCountry) {
            await tx.productVariantCountry.update({
              where: { id: existingVariantCountry.id },
              data: { stock: { decrement: item.quantity } },
            });
          } else {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }

        const existingProductCountry = await tx.productCountry.findUnique({
          where: {
            productId_country: {
              productId: item.productId,
              country: targetCountryCode,
            },
          },
        });

        if (existingProductCountry) {
          await tx.productCountry.update({
            where: { id: existingProductCountry.id },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
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
            city: city || countryConfig.defaultCity,
            country: countryConfig.name,
            isDefault: false,
          },
        });
      }

      return createdOrder;
    });

    // 7. Payment Provider Abstraction per Country
    const paymentProvider = getPaymentProvider(targetCountryCode, paymentMethod);
    const paymentResult = await paymentProvider.initiatePayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: finalTotal,
      currency: countryConfig.currency,
      country: targetCountryCode,
      customerName,
      customerEmail,
      customerPhone,
    });

    // 8. Asynchronous Notifications: SMS and Email per Country
    try {
      const smsProvider = getSmsProvider(targetCountryCode);
      await smsProvider.sendOrderConfirmation({
        orderNumber: order.orderNumber,
        total: finalTotal,
        currency: countryConfig.currency,
        customerName,
        customerPhone,
        country: targetCountryCode,
      });

      const emailProvider = getEmailProvider(targetCountryCode);
      await emailProvider.sendOrderConfirmation({
        orderNumber: order.orderNumber,
        total: finalTotal,
        subtotal: calculatedSubtotal,
        shipping: shippingFee,
        discount: discountAmount,
        currency: countryConfig.currency,
        country: targetCountryCode,
        customerName,
        customerEmail,
        items: validatedOrderItems.map((vi) => ({
          name: vi.productName,
          variantName: vi.variantName,
          quantity: vi.quantity,
          unitPrice: vi.unitPrice,
          total: vi.total,
        })),
      });
    } catch (notifErr) {
      console.warn("Non-blocking notification error:", notifErr);
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      country: targetCountryCode,
      currency: countryConfig.currency,
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
