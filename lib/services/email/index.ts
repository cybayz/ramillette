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

export class QatarEmailProvider implements EmailProvider {
  name = "Ramillette_Email_Qatar";
  country: CountryCode = "QA";

  async sendOrderConfirmation(payload: EmailOrderPayload): Promise<EmailResult> {
    const config = getCountryConfig("QA");
    const subject = `Order Confirmed: ${payload.orderNumber} | Ramillette Perfumes Qatar`;
    const from = config.orderEmail;

    const htmlPreview = `
      <div style="font-family: sans-serif; color: #1c1c1c; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #b6713e;">Thank you for your order, ${payload.customerName}!</h2>
        <p>Your order <strong>${payload.orderNumber}</strong> has been confirmed for express delivery across Doha.</p>
        <div style="background: #fbf9f5; border: 1px solid #e5e5e5; padding: 15px; border-radius: 8px;">
          <p><strong>Total:</strong> QAR ${payload.total.toFixed(2)}</p>
          <p><strong>Boutique Origin:</strong> Souq Al Wakra, Qatar</p>
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
    const subject = `Order Confirmed: ${payload.orderNumber} | Ramillette Perfumes UAE`;
    const from = config.orderEmail;

    const htmlPreview = `
      <div style="font-family: sans-serif; color: #1c1c1c; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #b6713e;">Shukran for your order, ${payload.customerName}!</h2>
        <p>Your order <strong>${payload.orderNumber}</strong> has been confirmed for next-day delivery across the UAE.</p>
        <div style="background: #fbf9f5; border: 1px solid #e5e5e5; padding: 15px; border-radius: 8px;">
          <p><strong>Total:</strong> AED ${payload.total.toFixed(2)}</p>
          <p><strong>Fulfillment Hub:</strong> Downtown Dubai, UAE</p>
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
    const subject = `Order Confirmed: ${payload.orderNumber} | Ramillette Perfumes Bahrain`;
    const from = config.orderEmail;

    const htmlPreview = `
      <div style="font-family: sans-serif; color: #1c1c1c; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #b6713e;">Welcome to Ramillette Bahrain, ${payload.customerName}!</h2>
        <p>Your order <strong>${payload.orderNumber}</strong> is being prepared for express delivery across the Kingdom.</p>
        <div style="background: #fbf9f5; border: 1px solid #e5e5e5; padding: 15px; border-radius: 8px;">
          <p><strong>Total:</strong> BHD ${payload.total.toFixed(3)}</p>
          <p><strong>Showroom:</strong> Bab Al Bahrain, Manama</p>
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
