import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getPayLaterConfig, verifyPayLaterWebhookSignature } from "@/lib/services/paylater";
import { getEmailProvider } from "@/lib/services/email";
import { CountryCode, getCountryConfig } from "@/lib/country/config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[PayLater Webhook] Incoming notification payload:", body);

    const {
      merchantId,
      orderId,
      paylaterRef,
      status,
      timestamp,
      signature,
      txHash,
      comments,
    } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId in webhook payload" }, { status: 400 });
    }

    const config = await getPayLaterConfig();

    // Verify webhook signature
    const verification = verifyPayLaterWebhookSignature(
      {
        merchantId: String(merchantId || ""),
        orderId: String(orderId || ""),
        status: String(status || ""),
        timestamp: String(timestamp || ""),
        comments: comments || "",
        txHash: String(txHash || ""),
        signature: String(signature || ""),
      },
      config.webhookSecret
    );

    if (!verification.isValid) {
      console.warn("[PayLater Webhook] Verification warning/failure:", verification.reason);
      // If webhookSecret is configured and verification failed, reject
      if (config.webhookSecret) {
        return NextResponse.json({ error: "Invalid webhook signature", reason: verification.reason }, { status: 403 });
      }
    }

    // Find the corresponding order
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: orderId }, { id: orderId }],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      console.warn(`[PayLater Webhook] Order #${orderId} not found in database`);
      return NextResponse.json({ message: "Order not found, acknowledged" }, { status: 200 });
    }

    const normalizedStatus = String(status).toLowerCase();

    if (normalizedStatus === "success" || normalizedStatus === "paid" || normalizedStatus === "2") {
      // Mark order confirmed and payment paid
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: order.status === "PENDING" ? "CONFIRMED" : order.status,
          paymentMethod: "PAYLATER",
        },
      });

      console.log(`[PayLater Webhook] Order #${order.orderNumber} successfully marked PAID via PayLater (Ref: ${paylaterRef || "N/A"})`);

      // Dispatch order confirmation email if customer has email
      if (order.customerEmail) {
        try {
          const targetCountry = (order.country || "QA") as CountryCode;
          const countryCfg = getCountryConfig(targetCountry);
          const emailProvider = getEmailProvider(targetCountry);
          await emailProvider.sendOrderConfirmation({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            total: Number(order.total),
            subtotal: Number(order.subtotal || order.total),
            shipping: Number(order.shipping || 0),
            discount: Number(order.discount || 0),
            currency: order.currency || countryCfg?.currency || "QAR",
            country: targetCountry,
            items: order.items.map((i) => ({
              name: i.productName,
              variantName: i.variantName,
              quantity: i.quantity,
              unitPrice: Number(i.unitPrice),
              total: Number(i.total),
            })),
          });
        } catch (emailErr) {
          console.error("[PayLater Webhook] Error sending order confirmation email:", emailErr);
        }
      }
    } else if (normalizedStatus === "failed" || normalizedStatus === "3") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });
      console.log(`[PayLater Webhook] Order #${order.orderNumber} marked payment FAILED via PayLater`);
    }

    return NextResponse.json({ message: "Webhook received successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("[PayLater Webhook] Processing error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    gateway: "PayLater Webhook Listener",
    documentation: "https://docs.paylaterapp.com/webhooks.html",
  });
}
