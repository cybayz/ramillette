import { CountryCode, getCountryConfig } from "@/lib/country/config";

export interface EmailOrderPayload {
  orderNumber: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  currency: string;
  country: CountryCode;
  customerName: string;
  customerEmail: string;
  orderType?: "DELIVERY" | "PICKUP";
  pickupStoreName?: string | null;
  pickupStoreAddress?: string | null;
  pickupStorePhone?: string | null;
  pickupDate?: string | null;
  pickupTimeSlot?: string | null;
  pickupCode?: string | null;
  qrCodeDataUrl?: string | null;
  items: Array<{
    name: string;
    variantName?: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId: string;
  from: string;
  to: string;
  subject: string;
  htmlPreview: string;
}

export interface EmailProvider {
  name: string;
  country: CountryCode;
  sendOrderConfirmation(payload: EmailOrderPayload): Promise<EmailResult>;
}

function renderPickupBlock(payload: EmailOrderPayload): string {
  if (payload.orderType !== "PICKUP") return "";

  return `
    <div style="background: #fbf9f5; border: 2px dashed #b6713e; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
      <span style="background: #b6713e; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px;">
        Store Pickup Verification Pass
      </span>
      <h3 style="color: #1c1c1c; margin: 12px 0 6px 0; font-size: 16px;">
        ${payload.pickupStoreName || "Ramillette Flagship Boutique"}
      </h3>
      <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
        ${payload.pickupStoreAddress || "Boutique Location"}
      </p>

      ${payload.pickupDate ? `
        <div style="background: #ffffff; border: 1px solid #ecdac1; display: inline-block; padding: 8px 16px; border-radius: 6px; margin-bottom: 12px;">
          <strong style="color: #1c1c1c; font-size: 12px;">Date of Visit:</strong> 
          <span style="color: #b6713e; font-size: 12px; font-weight: bold;">
            ${new Date(payload.pickupDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </span>
          ${payload.pickupTimeSlot ? `<span style="color: #888; font-size: 11px;"> (${payload.pickupTimeSlot})</span>` : ""}
        </div>
      ` : ""}

      ${payload.qrCodeDataUrl ? `
        <div style="margin: 14px auto; background: #ffffff; padding: 12px; display: inline-block; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); border: 1px solid #e5e5e5;">
          <img src="${payload.qrCodeDataUrl}" alt="Order QR Code" width="160" height="160" style="display: block; margin: auto;" />
          <p style="margin: 6px 0 0 0; font-size: 10px; color: #888; letter-spacing: 0.5px;">SCAN IN BOUTIQUE</p>
        </div>
      ` : ""}

      ${payload.pickupCode ? `
        <div style="margin-top: 10px;">
          <span style="font-size: 11px; color: #888; text-transform: uppercase;">Pickup Verification Code:</span><br/>
          <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: #1c1c1c; background: #faedcd; padding: 4px 12px; border-radius: 4px; display: inline-block; margin-top: 4px; border: 1px solid #e2cfa7;">
            ${payload.pickupCode}
          </span>
        </div>
      ` : ""}

      <p style="color: #777; font-size: 11px; margin-top: 14px; line-height: 1.4;">
        Please present this digital pass or mention your pickup code to our fragrance boutique specialist upon your visit.
      </p>
    </div>
  `;
}

export class QatarEmailProvider implements EmailProvider {
  name = "Ramillette_Email_Qatar";
  country: CountryCode = "QA";

  async sendOrderConfirmation(payload: EmailOrderPayload): Promise<EmailResult> {
    const config = getCountryConfig("QA");
    const isPickup = payload.orderType === "PICKUP";
    const subject = isPickup
      ? `Store Pickup Ready: ${payload.orderNumber} | Ramillette Perfumes Qatar`
      : `Order Confirmed: ${payload.orderNumber} | Ramillette Perfumes Qatar`;
    const from = config.orderEmail;

    const htmlPreview = `
      <div style="font-family: sans-serif; color: #1c1c1c; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #b6713e;">${isPickup ? "Your Boutique Pickup Order is Confirmed" : "Thank you for your order"}, ${payload.customerName}!</h2>
        <p>Your order <strong>${payload.orderNumber}</strong> has been secured ${isPickup ? `for pickup at ${payload.pickupStoreName || "our boutique"}` : "for express delivery across Doha"}.</p>
        
        ${renderPickupBlock(payload)}

        <div style="background: #fbf9f5; border: 1px solid #e5e5e5; padding: 15px; border-radius: 8px;">
          <p><strong>Total:</strong> QAR ${payload.total.toFixed(2)}</p>
          <p><strong>Order Type:</strong> ${isPickup ? "Boutique Pickup (Free)" : "Express Delivery"}</p>
          <p><strong>Customer Care:</strong> +974 5555 1234 | support.qa@ramillette.com</p>
        </div>
      </div>
    `;

    console.log(`[EMAIL-QA] Dispatched to ${payload.customerEmail} from ${from}: "${subject}"`);
    return {
      success: true,
      messageId: `MAIL-QA-${Date.now()}`,
      from,
      to: payload.customerEmail,
      subject,
      htmlPreview,
    };
  }
}

export class UaeEmailProvider implements EmailProvider {
  name = "Ramillette_Email_UAE";
  country: CountryCode = "AE";

  async sendOrderConfirmation(payload: EmailOrderPayload): Promise<EmailResult> {
    const config = getCountryConfig("AE");
    const isPickup = payload.orderType === "PICKUP";
    const subject = isPickup
      ? `Store Pickup Ready: ${payload.orderNumber} | Ramillette Perfumes UAE`
      : `Order Confirmed: ${payload.orderNumber} | Ramillette Perfumes UAE`;
    const from = config.orderEmail;

    const htmlPreview = `
      <div style="font-family: sans-serif; color: #1c1c1c; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #b6713e;">Shukran for your order, ${payload.customerName}!</h2>
        <p>Your order <strong>${payload.orderNumber}</strong> has been secured ${isPickup ? `for boutique collection at ${payload.pickupStoreName || "our UAE showroom"}` : "for next-day delivery across the UAE"}.</p>

        ${renderPickupBlock(payload)}

        <div style="background: #fbf9f5; border: 1px solid #e5e5e5; padding: 15px; border-radius: 8px;">
          <p><strong>Total:</strong> AED ${payload.total.toFixed(2)}</p>
          <p><strong>Order Type:</strong> ${isPickup ? "Boutique Pickup (Free)" : "Courier Delivery"}</p>
          <p><strong>Customer Care:</strong> +971 4 333 5678 | support.ae@ramillette.com</p>
          <p style="font-size: 11px; color: #888;">UAE TRN / VAT Registered</p>
        </div>
      </div>
    `;

    console.log(`[EMAIL-AE] Dispatched to ${payload.customerEmail} from ${from}: "${subject}"`);
    return {
      success: true,
      messageId: `MAIL-AE-${Date.now()}`,
      from,
      to: payload.customerEmail,
      subject,
      htmlPreview,
    };
  }
}

export class BahrainEmailProvider implements EmailProvider {
  name = "Ramillette_Email_Bahrain";
  country: CountryCode = "BH";

  async sendOrderConfirmation(payload: EmailOrderPayload): Promise<EmailResult> {
    const config = getCountryConfig("BH");
    const isPickup = payload.orderType === "PICKUP";
    const subject = isPickup
      ? `Store Pickup Ready: ${payload.orderNumber} | Ramillette Perfumes Bahrain`
      : `Order Confirmed: ${payload.orderNumber} | Ramillette Perfumes Bahrain`;
    const from = config.orderEmail;

    const htmlPreview = `
      <div style="font-family: sans-serif; color: #1c1c1c; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #b6713e;">Welcome to Ramillette Bahrain, ${payload.customerName}!</h2>
        <p>Your order <strong>${payload.orderNumber}</strong> has been prepared ${isPickup ? `for boutique collection at ${payload.pickupStoreName || "our Manama showroom"}` : "for express delivery across the Kingdom"}.</p>

        ${renderPickupBlock(payload)}

        <div style="background: #fbf9f5; border: 1px solid #e5e5e5; padding: 15px; border-radius: 8px;">
          <p><strong>Total:</strong> BHD ${payload.total.toFixed(3)}</p>
          <p><strong>Order Type:</strong> ${isPickup ? "Boutique Pickup (Free)" : "Express Delivery"}</p>
          <p><strong>Customer Care:</strong> +973 17 888 999 | support.bh@ramillette.com</p>
          <p style="font-size: 11px; color: #888;">Kingdom of Bahrain National Commerce Registered</p>
        </div>
      </div>
    `;

    console.log(`[EMAIL-BH] Dispatched to ${payload.customerEmail} from ${from}: "${subject}"`);
    return {
      success: true,
      messageId: `MAIL-BH-${Date.now()}`,
      from,
      to: payload.customerEmail,
      subject,
      htmlPreview,
    };
  }
}

/**
 * Email Provider Factory
 */
export function getEmailProvider(country: CountryCode = "QA"): EmailProvider {
  if (country === "AE") {
    return new UaeEmailProvider();
  }
  if (country === "BH") {
    return new BahrainEmailProvider();
  }
  return new QatarEmailProvider();
}
