import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CountryCode, getCountryConfig, isValidCountry, GiftWrapOption } from "@/lib/country/config";
import { resolveProductForCountry, resolveVariantForCountry } from "@/lib/country/productResolver";
import { getPaymentProvider } from "@/lib/services/payment";
import { getSmsProvider } from "@/lib/services/sms";
import { getEmailProvider } from "@/lib/services/email";
import { findOptimalFulfillmentStore, reserveStockForOrder } from "@/lib/inventory/inventoryService";
import { generatePickupCode, generateQrDataUrl } from "@/lib/services/qr";

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
      orderType = "DELIVERY", // "DELIVERY" | "PICKUP"
      pickupStoreId,
      pickupDate,
      pickupTimeSlot,
      isGift = false,
      giftMessage,
      hasGiftWrap = false,
      giftWrapOptionId,
      giftWrapName,
      items,
    } = body;

    const isPickup = orderType === "PICKUP";

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
    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: "Customer name, email, and phone number are required." },
        { status: 400 }
      );
    }

    if (!isPickup && !addressLine1) {
      return NextResponse.json(
        { error: "Delivery address is required for home delivery." },
        { status: 400 }
      );
    }

    let pickupStoreRecord: any = null;
    if (isPickup) {
      if (!pickupStoreId) {
        return NextResponse.json(
          { error: "Please select a boutique location for store pickup." },
          { status: 400 }
        );
      }

      pickupStoreRecord = await prisma.store.findUnique({
        where: { id: pickupStoreId },
        include: { region: true },
      });

      if (!pickupStoreRecord || !pickupStoreRecord.active) {
        return NextResponse.json(
          { error: "Selected pickup boutique is currently unavailable. Please choose another location." },
          { status: 400 }
        );
      }
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

    // 4. Country-Specific Shipping & VAT Calculation (using DB settings if present)
    const dbCountry = await prisma.country.findUnique({
      where: { code: targetCountryCode },
    });

    const standardShippingFee = dbCountry
      ? Number(dbCountry.standardShippingFee)
      : countryConfig.standardShippingFee;
    const freeShippingThreshold = dbCountry
      ? Number(dbCountry.freeShippingThreshold)
      : countryConfig.freeShippingThreshold;
    const taxRate = dbCountry
      ? Number(dbCountry.taxRate)
      : (targetCountryCode === "AE" ? 5.0 : targetCountryCode === "BH" ? 10.0 : 0.0);

    const shippingFee = isPickup
      ? 0.0
      : (calculatedSubtotal >= freeShippingThreshold ? 0.0 : standardShippingFee);
    const allowGiftWrap = dbCountry?.allowGiftWrap ?? countryConfig.allowGiftWrap ?? true;

    // Resolve available gift wrap tiers from database or fallback defaults
    let availableGiftOptions: GiftWrapOption[] = [];
    if (dbCountry?.giftWrapOptions) {
      try {
        availableGiftOptions = typeof dbCountry.giftWrapOptions === "string"
          ? JSON.parse(dbCountry.giftWrapOptions)
          : (dbCountry.giftWrapOptions as any);
      } catch (e) {
        availableGiftOptions = [];
      }
    }
    if (!availableGiftOptions || !Array.isArray(availableGiftOptions) || availableGiftOptions.length === 0) {
      availableGiftOptions = countryConfig.giftWrapOptions || [];
    }

    let selectedWrapOpt: GiftWrapOption | undefined = undefined;
    if (isGift && giftWrapOptionId) {
      selectedWrapOpt = availableGiftOptions.find((opt) => opt.id === giftWrapOptionId && opt.active !== false);
    }
    if (!selectedWrapOpt && isGift && hasGiftWrap) {
      selectedWrapOpt = availableGiftOptions.find((opt) => opt.price > 0 && opt.active !== false) || {
        id: "paper-wrap",
        name: giftWrapName || "Classic Artisanal Paper Wrap",
        price: dbCountry?.giftWrapFee !== undefined ? Number(dbCountry.giftWrapFee) : (countryConfig.giftWrapFee ?? 25),
        description: "Signature gift wrap",
      };
    }

    const giftWrapAmount = (isGift && selectedWrapOpt && allowGiftWrap) ? Number(selectedWrapOpt.price || 0) : 0;
    const shouldApplyGiftWrap = Boolean(isGift && selectedWrapOpt && giftWrapAmount > 0);
    const finalGiftWrapOptionId = isGift && selectedWrapOpt ? selectedWrapOpt.id : null;
    const finalGiftWrapName = isGift && selectedWrapOpt ? selectedWrapOpt.name : null;

    const taxableAmount = Math.max(0, calculatedSubtotal - discountAmount);
    const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(countryConfig.currencyDecimals || 2));
    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee + giftWrapAmount + taxAmount);

    // 5. Generate Human-readable Unique Order Number (e.g. RAM-QA-2609-8472)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(2, 7).replace("-", "");
    const orderNumber = `RAM-${targetCountryCode}-${dateStr}-${randomSuffix}`;
    const pickupCode = isPickup ? generatePickupCode() : null;

    // 5b. Smart Order Fulfillment Routing to Store
    const fulfillmentStore = isPickup && pickupStoreRecord
      ? { storeId: pickupStoreRecord.id, storeName: pickupStoreRecord.name }
      : await findOptimalFulfillmentStore({
          countryCode: targetCountryCode,
          cityName: city || area || null,
          items: validatedOrderItems.map((oi) => ({
            productId: oi.productId,
            variantId: oi.variantId,
            quantity: oi.quantity,
          })),
        });

    // Generate QR code Data URL for pickup verification
    let qrDataUrl: string | null = null;
    if (isPickup && pickupStoreRecord && pickupCode) {
      try {
        qrDataUrl = await generateQrDataUrl({
          orderNumber,
          pickupCode,
          storeCode: pickupStoreRecord.code,
          storeName: pickupStoreRecord.name,
          customerName,
          customerPhone,
          date: pickupDate ? String(pickupDate) : undefined,
        });
      } catch (qrErr) {
        console.warn("Failed to generate QR data URL:", qrErr);
      }
    }

    // 6. Database Transaction: Create Order, Deduct Country Stock, Increment Coupon
    const order = await prisma.$transaction(
      async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: session?.userId || null,
          orderNumber,
          orderType: isPickup ? "PICKUP" : "DELIVERY",
          channel: "ONLINE",
          assignedStoreId: fulfillmentStore?.storeId || null,
          pickupStoreId: isPickup && pickupStoreRecord ? pickupStoreRecord.id : null,
          pickupDate: isPickup && pickupDate ? new Date(pickupDate) : null,
          pickupTimeSlot: isPickup ? (pickupTimeSlot || null) : null,
          pickupCode,
          idempotencyKey: `CHK-${orderNumber}`,
          status: "CONFIRMED",
          paymentStatus: paymentMethod === "ONLINE" || paymentMethod === "TABBY_TAMARA" || paymentMethod === "BENEFIT_PAY" ? "PAID" : "PENDING",
          fulfillmentStatus: "UNFULFILLED",
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress: isPickup && pickupStoreRecord
            ? {
                orderType: "PICKUP",
                name: customerName,
                phone: customerPhone,
                storeId: pickupStoreRecord.id,
                storeCode: pickupStoreRecord.code,
                storeName: pickupStoreRecord.name,
                storeNameAr: pickupStoreRecord.nameAr || pickupStoreRecord.name,
                addressLine1: pickupStoreRecord.address || "Flagship Boutique",
                city: pickupStoreRecord.region?.name || city || countryConfig.defaultCity,
                country: countryConfig.name,
                countryCode: targetCountryCode,
                pickupDate: pickupDate || null,
                pickupTimeSlot: pickupTimeSlot || null,
              }
            : {
                orderType: "DELIVERY",
                name: customerName,
                phone: customerPhone,
                addressLine1: addressLine1 || "",
                addressLine2: addressLine2 || null,
                area: area || null,
                city: city || countryConfig.defaultCity,
                country: countryConfig.name,
                countryCode: targetCountryCode,
              },
          billingAddress: {
            name: customerName,
            addressLine1: isPickup ? (pickupStoreRecord?.address || "Flagship Boutique") : (addressLine1 || ""),
            city: isPickup ? (pickupStoreRecord?.region?.name || city || countryConfig.defaultCity) : (city || countryConfig.defaultCity),
            country: countryConfig.name,
          },
          deliveryNotes: deliveryNotes || null,
          isGift: Boolean(isGift),
          giftMessage: isGift && giftMessage ? String(giftMessage).trim() : null,
          hasGiftWrap: shouldApplyGiftWrap,
          giftWrapOptionId: finalGiftWrapOptionId,
          giftWrapName: finalGiftWrapName,
          giftWrapFee: giftWrapAmount,
          subtotal: calculatedSubtotal,
          discount: discountAmount,
          shipping: shippingFee,
          tax: taxAmount,
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

      // Synchronize User Profile and Address from Order Details
      if (session?.userId) {
        const nameParts = customerName.trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const currentUser = await tx.user.findUnique({
          where: { id: session.userId },
        });

        if (currentUser) {
          const profileUpdate: {
            firstName?: string;
            lastName?: string;
            phone?: string;
            email?: string;
          } = {};

          if (firstName && (!currentUser.firstName || currentUser.firstName.length === 0)) {
            profileUpdate.firstName = firstName;
          }
          if (lastName && (!currentUser.lastName || currentUser.lastName.length === 0)) {
            profileUpdate.lastName = lastName;
          }
          if (customerPhone && currentUser.phone !== customerPhone) {
            profileUpdate.phone = customerPhone;
          }

          // If current email is a synthetic placeholder (@ramillette.user), upgrade to valid customerEmail
          if (
            customerEmail &&
            !customerEmail.endsWith("@ramillette.user") &&
            currentUser.email.endsWith("@ramillette.user")
          ) {
            const normalizedNewEmail = customerEmail.trim().toLowerCase();
            const existingWithEmail = await tx.user.findUnique({
              where: { email: normalizedNewEmail },
            });
            if (!existingWithEmail || existingWithEmail.id === session.userId) {
              profileUpdate.email = normalizedNewEmail;
            }
          }

          if (Object.keys(profileUpdate).length > 0) {
            await tx.user.update({
              where: { id: session.userId },
              data: profileUpdate,
            });
          }

          // Auto-save shipping address if user has no saved addresses yet
          const existingAddressesCount = await tx.address.count({
            where: { userId: session.userId },
          });

          if (existingAddressesCount === 0) {
            await tx.address.create({
              data: {
                userId: session.userId,
                name: customerName,
                phone: customerPhone,
                addressLine1,
                addressLine2: addressLine2 || null,
                area: area || null,
                city: city || countryConfig.defaultCity,
                country: targetCountryCode,
                isDefault: true,
              },
            });
          }
        }
      }

      // Reserve stock in assigned physical store if store was resolved
      if (fulfillmentStore) {
        for (const item of validatedOrderItems) {
          try {
            await reserveStockForOrder(
              {
                storeId: fulfillmentStore.storeId,
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                referenceId: orderNumber,
                performedById: session?.userId || null,
              },
              tx
            );
          } catch (reserveErr) {
            console.warn("Store stock reservation fallback:", reserveErr);
          }
        }
      }

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

        return createdOrder;
      },
      {
        maxWait: 15000,
        timeout: 30000,
      }
    );

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
        orderType: isPickup ? "PICKUP" : "DELIVERY",
        pickupStoreName: pickupStoreRecord?.name || null,
        pickupStoreAddress: pickupStoreRecord?.address || null,
        pickupStorePhone: pickupStoreRecord?.phone || null,
        pickupDate: pickupDate ? String(pickupDate) : null,
        pickupTimeSlot: pickupTimeSlot || null,
        pickupCode: pickupCode || null,
        qrCodeDataUrl: qrDataUrl || null,
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
      orderType: order.orderType,
      pickupCode,
      pickupDate: isPickup && pickupDate ? pickupDate : null,
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
