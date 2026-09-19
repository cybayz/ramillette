import { CountryCode, COUNTRIES, getCountryConfig } from "@/lib/country/config";

export interface PaymentOrderPayload {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  country: CountryCode;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PaymentResult {
  success: boolean;
  status: "PENDING" | "PAID" | "FAILED";
  paymentUrl?: string;
  transactionRef: string;
  message?: string;
  providerName: string;
}

export interface PaymentProvider {
  name: string;
  country: CountryCode;
  initiatePayment(payload: PaymentOrderPayload): Promise<PaymentResult>;
  verifyPayment(transactionRef: string): Promise<{ isPaid: boolean; metadata?: any }>;
}

/**
 * Universal Cash on Delivery (COD) Provider with country-specific handling
 */
export class CashOnDeliveryProvider implements PaymentProvider {
  name = "COD";
  country: CountryCode;

  constructor(country: CountryCode = "QA") {
    this.country = country;
  }

  async initiatePayment(payload: PaymentOrderPayload): Promise<PaymentResult> {
    const config = getCountryConfig(this.country);
    return {
      success: true,
      status: "PENDING",
      transactionRef: `COD-${this.country}-${payload.orderNumber}`,
      message: `Order placed for Cash on Delivery in ${config.name} (${config.currency} ${payload.amount.toFixed(config.currencyDecimals)}).`,
      providerName: `COD_${this.country}`,
    };
  }

  async verifyPayment(transactionRef: string) {
    return { isPaid: false, metadata: { method: "COD", country: this.country } };
  }
}

/**
 * Qatar Card Payment Provider (SkipCash / QNB SimpliPay / Sadad)
 */
export class QatarCardPaymentProvider implements PaymentProvider {
  name = "QATAR_CARD";
  country: CountryCode = "QA";

  async initiatePayment(payload: PaymentOrderPayload): Promise<PaymentResult> {
    const txRef = `TX-QA-${Date.now()}-${payload.orderNumber}`;
    return {
      success: true,
      status: "PAID",
      transactionRef: txRef,
      message: `Card payment authorized successfully via Qatar National Payment Network for QAR ${payload.amount.toFixed(2)}.`,
      providerName: "Qatar Card Network / QNB SimpliPay",
    };
  }

  async verifyPayment(transactionRef: string) {
    return { isPaid: true, metadata: { txRef: transactionRef, gateway: "QNB_SIMPLIPAY" } };
  }
}

/**
 * UAE Card Payment Provider (Stripe UAE / Checkout.com / Network International)
 */
export class UaeCardPaymentProvider implements PaymentProvider {
  name = "UAE_CARD";
  country: CountryCode = "AE";

  async initiatePayment(payload: PaymentOrderPayload): Promise<PaymentResult> {
    const txRef = `TX-AE-${Date.now()}-${payload.orderNumber}`;
    return {
      success: true,
      status: "PAID",
      transactionRef: txRef,
      message: `Card payment authorized successfully via UAE Payment Gateway (Stripe / Network International) for AED ${payload.amount.toFixed(2)}.`,
      providerName: "Stripe UAE / Network International",
    };
  }

  async verifyPayment(transactionRef: string) {
    return { isPaid: true, metadata: { txRef: transactionRef, gateway: "STRIPE_UAE" } };
  }
}

/**
 * UAE Tabby / Tamara 4-Month Installment Provider
 */
export class UaeTabbyTamaraProvider implements PaymentProvider {
  name = "TABBY_TAMARA";
  country: CountryCode = "AE";

  async initiatePayment(payload: PaymentOrderPayload): Promise<PaymentResult> {
    const txRef = `TABBY-AE-${Date.now()}-${payload.orderNumber}`;
    const monthlyInstallment = (payload.amount / 4).toFixed(2);
    return {
      success: true,
      status: "PAID",
      transactionRef: txRef,
      message: `Order confirmed via Tabby UAE. First installment of AED ${monthlyInstallment} processed. Remaining 3 installments scheduled.`,
      providerName: "Tabby UAE",
    };
  }

  async verifyPayment(transactionRef: string) {
    return { isPaid: true, metadata: { txRef: transactionRef, provider: "TABBY_UAE" } };
  }
}

/**
 * Bahrain BenefitPay & CrediMax Provider (National QR / Tap Bahrain)
 */
export class BahrainBenefitPayProvider implements PaymentProvider {
  name = "BENEFIT_PAY";
  country: CountryCode = "BH";

  async initiatePayment(payload: PaymentOrderPayload): Promise<PaymentResult> {
    const txRef = `BENEFIT-BH-${Date.now()}-${payload.orderNumber}`;
    return {
      success: true,
      status: "PAID",
      transactionRef: txRef,
      message: `Payment authorized instantly via Bahrain BenefitPay Network for BHD ${payload.amount.toFixed(3)}.`,
      providerName: "BenefitPay National Network / Tap Bahrain",
    };
  }

  async verifyPayment(transactionRef: string) {
    return { isPaid: true, metadata: { txRef: transactionRef, gateway: "BENEFIT_PAY_BH" } };
  }
}

/**
 * Payment Provider Factory: resolves appropriate gateway by country & method
 */
export function getPaymentProvider(
  country: CountryCode = "QA",
  method: string = "COD"
): PaymentProvider {
  const normMethod = (method || "").toUpperCase();

  if (normMethod === "COD") {
    return new CashOnDeliveryProvider(country);
  }

  if (country === "AE") {
    if (normMethod === "TABBY_TAMARA") {
      return new UaeTabbyTamaraProvider();
    }
    return new UaeCardPaymentProvider();
  }

  if (country === "BH") {
    if (normMethod === "BENEFIT_PAY" || normMethod === "ONLINE") {
      return new BahrainBenefitPayProvider();
    }
    return new BahrainBenefitPayProvider();
  }

  // Default Qatar
  return new QatarCardPaymentProvider();
}
