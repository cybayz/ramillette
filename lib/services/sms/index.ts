import { CountryCode, getCountryConfig } from "@/lib/country/config";

export interface SmsOrderNotification {
  orderNumber: string;
  total: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  country: CountryCode;
}

export interface SmsResult {
  success: boolean;
  messageId: string;
  provider: string;
  country: CountryCode;
  recipient: string;
  sentContent: string;
}

export interface SmsProvider {
  name: string;
  country: CountryCode;
  sendOrderConfirmation(notification: SmsOrderNotification): Promise<SmsResult>;
  sendOtp(phone: string, otp: string): Promise<SmsResult>;
}

/**
 * Qatar SMS Provider (Ooredoo / Vodafone Qatar / Unifonic)
 */
export class QatarSmsProvider implements SmsProvider {
  name = "Ooredoo_Vodafone_Qatar";
  country: CountryCode = "QA";

  async sendOrderConfirmation(notification: SmsOrderNotification): Promise<SmsResult> {
    const text = `Ramillette Perfumes: Thank you ${notification.customerName}! Your order ${notification.orderNumber} for QAR ${notification.total.toFixed(2)} is confirmed. Free express 2-hour delivery across Doha. Support: +974 5555 1234`;
    console.log(`[SMS-QA:Ooredoo] Dispatched to ${notification.customerPhone}: "${text}"`);
    return {
      success: true,
      messageId: `SMS-QA-${Date.now()}`,
      provider: this.name,
      country: "QA",
      recipient: notification.customerPhone,
      sentContent: text,
    };
  }

  async sendOtp(phone: string, otp: string): Promise<SmsResult> {
    const text = `Your Ramillette Qatar verification code is: ${otp}. Valid for 10 minutes.`;
    return {
      success: true,
      messageId: `OTP-QA-${Date.now()}`,
      provider: this.name,
      country: "QA",
      recipient: phone,
      sentContent: text,
    };
  }
}

/**
 * UAE SMS Provider (Etisalat / du / Twilio UAE)
 */
export class UaeSmsProvider implements SmsProvider {
  name = "Etisalat_du_UAE";
  country: CountryCode = "AE";

  async sendOrderConfirmation(notification: SmsOrderNotification): Promise<SmsResult> {
    const text = `Ramillette Perfumes UAE: Salam ${notification.customerName}! Order ${notification.orderNumber} for AED ${notification.total.toFixed(2)} is confirmed. Next-day express delivery in Dubai & Abu Dhabi. Support: +971 4 333 5678`;
    console.log(`[SMS-AE:Etisalat] Dispatched to ${notification.customerPhone}: "${text}"`);
    return {
      success: true,
      messageId: `SMS-AE-${Date.now()}`,
      provider: this.name,
      country: "AE",
      recipient: notification.customerPhone,
      sentContent: text,
    };
  }

  async sendOtp(phone: string, otp: string): Promise<SmsResult> {
    const text = `Your Ramillette UAE security code is: ${otp}. Valid for 10 minutes.`;
    return {
      success: true,
      messageId: `OTP-AE-${Date.now()}`,
      provider: this.name,
      country: "AE",
      recipient: phone,
      sentContent: text,
    };
  }
}

/**
 * Bahrain SMS Provider (Batelco / Zain Bahrain)
 */
export class BahrainSmsProvider implements SmsProvider {
  name = "Batelco_Zain_Bahrain";
  country: CountryCode = "BH";

  async sendOrderConfirmation(notification: SmsOrderNotification): Promise<SmsResult> {
    const text = `Ramillette Perfumes Bahrain: Welcome ${notification.customerName}! Order ${notification.orderNumber} for BHD ${notification.total.toFixed(3)} is placed. Same-day express delivery across Manama & Riffa. Support: +973 17 888 999`;
    console.log(`[SMS-BH:Batelco] Dispatched to ${notification.customerPhone}: "${text}"`);
    return {
      success: true,
      messageId: `SMS-BH-${Date.now()}`,
      provider: this.name,
      country: "BH",
      recipient: notification.customerPhone,
      sentContent: text,
    };
  }

  async sendOtp(phone: string, otp: string): Promise<SmsResult> {
    const text = `Your Ramillette Bahrain pass code is: ${otp}. Valid for 10 minutes.`;
    return {
      success: true,
      messageId: `OTP-BH-${Date.now()}`,
      provider: this.name,
      country: "BH",
      recipient: phone,
      sentContent: text,
    };
  }
}

/**
 * SMS Provider Factory
 */
export function getSmsProvider(country: CountryCode = "QA"): SmsProvider {
  if (country === "AE") {
    return new UaeSmsProvider();
  }
  if (country === "BH") {
    return new BahrainSmsProvider();
  }
  return new QatarSmsProvider();
}
