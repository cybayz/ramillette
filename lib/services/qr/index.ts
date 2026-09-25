import QRCode from "qrcode";

export interface PickupQrData {
  orderNumber: string;
  pickupCode: string;
  storeCode?: string;
  storeName?: string;
  customerName?: string;
  customerPhone?: string;
  date?: string;
}

/**
 * Generate a secure, unique human-readable pickup verification code
 * e.g. PKUP-8492-X7
 */
export function generatePickupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PKUP-${randomPart.slice(0, 3)}-${randomPart.slice(3)}`;
}

/**
 * Generates a PNG Data URL string for QR Code that can be embedded in HTML/email
 */
export async function generateQrDataUrl(data: string | PickupQrData): Promise<string> {
  const payload = typeof data === "string" ? data : JSON.stringify({
    type: "STORE_PICKUP",
    order: data.orderNumber,
    code: data.pickupCode,
    store: data.storeCode || data.storeName,
    phone: data.customerPhone,
  });

  return await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 6,
    color: {
      dark: "#1c1c1c",
      light: "#ffffff",
    },
  });
}

/**
 * Generates an SVG string representation of the QR code
 */
export async function generateQrSvg(data: string | PickupQrData): Promise<string> {
  const payload = typeof data === "string" ? data : JSON.stringify({
    type: "STORE_PICKUP",
    order: data.orderNumber,
    code: data.pickupCode,
    store: data.storeCode || data.storeName,
  });

  return await QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: {
      dark: "#1c1c1c",
      light: "#ffffff",
    },
  });
}
