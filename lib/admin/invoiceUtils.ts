import { formatPrice } from "@/lib/utils";

export interface InvoiceOrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus?: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  currency: string;
  country: string;
  city?: string;
  addressLine1?: string;
  area?: string | null;
  deliveryNotes?: string | null;
  adminNotes?: string | null;
  paymentGatewayRef?: string | null;
  carrierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippedAt?: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    variantName?: string | null;
    sku?: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export function cleanPhoneNumber(phone: string, countryCode: string = "QA"): string {
  if (!phone) return "";
  // Strip all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // Prepend default GCC country dialing codes if no international prefix
  const prefixes: Record<string, string> = {
    QA: "974",
    AE: "971",
    BH: "973",
    SA: "966",
    KW: "965",
    OM: "968",
  };

  const prefix = prefixes[countryCode.toUpperCase()] || "974";

  if (!cleaned.startsWith(prefix) && cleaned.length <= 10) {
    cleaned = `${prefix}${cleaned}`;
  }

  return cleaned;
}

export function generateWhatsAppInvoiceUrl(order: InvoiceOrderData): string {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const fullAddress = [order.addressLine1, order.area, order.city, order.country]
    .filter(Boolean)
    .join(", ");

  const itemsList = order.items
    .map(
      (it, idx) =>
        `${idx + 1}. *${it.productName}*${it.variantName ? ` (${it.variantName})` : ""} × ${it.quantity} = ${formatPrice(it.total, order.country)}`
    )
    .join("\n");

  const lines = [
    `*RAMILLETTE PERFUMES — INVOICE & ORDER SUMMARY* 🛍️`,
    `────────────────────────`,
    `*Order Number:* #${order.orderNumber}`,
    `*Date:* ${formattedDate}`,
    `*Customer:* ${order.customerName}`,
    `*Phone:* ${order.customerPhone}`,
    fullAddress ? `*Delivery Destination:* ${fullAddress}` : null,
    ``,
    `*ORDER ITEMS:*`,
    itemsList,
    `────────────────────────`,
    `*Subtotal:* ${formatPrice(order.subtotal, order.country)}`,
    order.discount > 0 ? `*Discount:* -${formatPrice(order.discount, order.country)}` : null,
    `*Shipping Fee:* ${order.shippingFee > 0 ? formatPrice(order.shippingFee, order.country) : "Free Express Delivery"}`,
    order.tax > 0 ? `*VAT / Taxes:* ${formatPrice(order.tax, order.country)}` : null,
    `*TOTAL AMOUNT:* *${formatPrice(order.total, order.country)}*`,
    `────────────────────────`,
    `*Payment Method:* ${order.paymentMethod} (${order.paymentStatus})`,
    `*Fulfillment Status:* ${order.status}`,
    order.trackingNumber ? `*Tracking Number:* ${order.trackingNumber} (${order.carrierName || "Courier"})` : null,
    order.trackingUrl ? `*Track Online:* ${order.trackingUrl}` : null,
    ``,
    `Thank you for shopping with Ramillette Perfumes! ✨`,
    `Souq Al Wakra, Qatar • ramillette.com`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const cleanedPhone = cleanPhoneNumber(order.customerPhone, order.country);
  const encodedText = encodeURIComponent(lines);

  return cleanedPhone
    ? `https://wa.me/${cleanedPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
}
