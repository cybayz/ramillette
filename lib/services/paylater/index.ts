import prisma from "@/lib/db/prisma";
import crypto from "crypto";

export interface PayLaterConfig {
  enabled: boolean;
  environment: "sandbox" | "production";
  clientId: string;
  clientSecret: string;
  outletId: string;
  apiKey: string;
  webhookSecret: string;
  minAmount: number;
  maxAmount: number;
}

// Sandbox defaults from official PayLater docs
const SANDBOX_DEFAULTS = {
  baseUrl: "https://connect.uat.paylaterapp.com",
  clientId: "merchant-138",
  clientSecret: "M6Xjszdtd8X2XivLmUvS9Pa7Hm0JeA6g",
  outletId: "1000000061",
};

const PROD_BASE_URL = "https://connect.paylaterapp.com";

// Cached access token in memory
let cachedToken: { token: string; expiresAt: number; env: string } | null = null;

/**
 * Retrieve PayLater configuration from database SiteSetting or fallback to defaults
 */
export async function getPayLaterConfig(): Promise<PayLaterConfig> {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "paylaterEnabled",
            "paylaterEnvironment",
            "paylaterClientId",
            "paylaterClientSecret",
            "paylaterOutletId",
            "paylaterApiKey",
            "paylaterWebhookSecret",
            "paylaterMinAmount",
            "paylaterMaxAmount",
          ],
        },
      },
    });

    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }

    const environment = (map.paylaterEnvironment || "sandbox") as "sandbox" | "production";

    return {
      enabled: map.paylaterEnabled !== "false",
      environment,
      clientId: map.paylaterClientId || (environment === "production" ? "merchant-1683" : SANDBOX_DEFAULTS.clientId),
      clientSecret: map.paylaterClientSecret || (environment === "production" ? "" : SANDBOX_DEFAULTS.clientSecret),
      outletId: map.paylaterOutletId || (environment === "production" ? "1683" : SANDBOX_DEFAULTS.outletId),
      apiKey: map.paylaterApiKey || "4868be79-c686-442e-b841-f034d3110078",
      webhookSecret: map.paylaterWebhookSecret || "",
      minAmount: parseFloat(map.paylaterMinAmount || "300") || 300,
      maxAmount: parseFloat(map.paylaterMaxAmount || "25000") || 25000,
    };
  } catch (error) {
    console.error("[PayLater] Error loading config from database:", error);
    return {
      enabled: true,
      environment: "sandbox",
      clientId: SANDBOX_DEFAULTS.clientId,
      clientSecret: SANDBOX_DEFAULTS.clientSecret,
      outletId: SANDBOX_DEFAULTS.outletId,
      apiKey: "4868be79-c686-442e-b841-f034d3110078",
      webhookSecret: "",
      minAmount: 300,
      maxAmount: 25000,
    };
  }
}

/**
 * Obtain OAuth 2.0 Bearer access token
 */
export async function getPayLaterAccessToken(forcedEnv?: "sandbox" | "production"): Promise<string> {
  const config = await getPayLaterConfig();
  const env = forcedEnv || config.environment;

  // Use cached token if valid (buffer 30 seconds)
  const now = Date.now();
  if (cachedToken && cachedToken.env === env && cachedToken.expiresAt > now + 30000) {
    return cachedToken.token;
  }

  const isProd = env === "production";
  const baseUrl = isProd ? PROD_BASE_URL : SANDBOX_DEFAULTS.baseUrl;
  const clientId = isProd && config.clientId ? config.clientId : (isProd ? "merchant-1683" : SANDBOX_DEFAULTS.clientId);
  const clientSecret = isProd && config.clientSecret ? config.clientSecret : (isProd ? config.apiKey : SANDBOX_DEFAULTS.clientSecret);

  if (!clientSecret) {
    throw new Error("PayLater production Client Secret is not configured. Please enter your secret in Admin Settings.");
  }

  const tokenUrl = `${baseUrl}/auth/realms/api/protocol/openid-connect/token`;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[PayLater] Token authentication failed:", res.status, errorText);
    throw new Error(`PayLater authentication failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const token = data.access_token as string;
  const expiresIn = (data.expires_in || 300) as number;

  cachedToken = {
    token,
    expiresAt: now + expiresIn * 1000,
    env,
  };

  return token;
}

export interface CreateCheckoutLinkParams {
  orderId: string;
  amount: number;
  currency?: string;
  successRedirectUrl: string;
  failRedirectUrl: string;
  expiryMinutes?: number;
}

/**
 * Generate hosted PayLater payment link
 */
export async function createPayLaterPaymentLink(params: CreateCheckoutLinkParams): Promise<{ paymentLinkUrl: string }> {
  const config = await getPayLaterConfig();
  const token = await getPayLaterAccessToken();

  const isProd = config.environment === "production";
  const baseUrl = isProd ? PROD_BASE_URL : SANDBOX_DEFAULTS.baseUrl;
  const checkoutUrl = `${baseUrl}/api/paylater/merchant-portal/v2/web-checkout`;

  const outletIdNum = isProd
    ? parseInt(config.outletId || "", 10)
    : parseInt(SANDBOX_DEFAULTS.outletId, 10);

  const payload = {
    outlet_id: isNaN(outletIdNum) ? 1000000061 : outletIdNum,
    currency: params.currency || "QAR",
    amount: Number(params.amount.toFixed(2)),
    order_id: params.orderId,
    success_redirect_url: params.successRedirectUrl,
    fail_redirect_url: params.failRedirectUrl,
    expiry_duration: params.expiryMinutes || 60,
  };

  console.log("[PayLater] Creating web-checkout link:", { url: checkoutUrl, order_id: payload.order_id, amount: payload.amount });

  const res = await fetch(checkoutUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.paymentLinkUrl) {
    const errMsg = data.error || data.message || `Failed to create PayLater payment link (HTTP ${res.status})`;
    console.error("[PayLater] Link creation failed:", data);
    throw new Error(errMsg);
  }

  return { paymentLinkUrl: data.paymentLinkUrl };
}

/**
 * Check payment status of an order
 */
export async function checkPayLaterPaymentStatus(orderId: string): Promise<{
  status: number; // 0 = Not initiated, 1 = Pending, 2 = Success, 3 = Failed
  message: string;
  payLaterOrderId?: string;
  merchantReference?: string;
}> {
  const config = await getPayLaterConfig();
  const token = await getPayLaterAccessToken();

  const isProd = config.environment === "production";
  const baseUrl = isProd ? PROD_BASE_URL : SANDBOX_DEFAULTS.baseUrl;
  const url = `${baseUrl}/api/paylater/merchant-portal/v2/web-checkout/status?order_id=${encodeURIComponent(orderId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`PayLater status check failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Verify signed PayLater webhook payload
 */
export function verifyPayLaterWebhookSignature(
  body: {
    merchantId?: string;
    orderId?: string;
    status?: string;
    timestamp?: string | number;
    comments?: string;
    txHash?: string;
    signature?: string;
  },
  webhookSecret: string
): { isValid: boolean; reason?: string } {
  const { merchantId = "", orderId = "", status = "", timestamp = "", comments = "", txHash = "", signature = "" } = body;

  if (!txHash || !signature) {
    return { isValid: false, reason: "Missing txHash or signature in webhook payload" };
  }

  // 1. Reconstruct txHash: MD5(UPPERCASE(merchantId + orderId + status + timestamp + comments))
  const data = `${merchantId}${orderId}${status}${timestamp}${comments}`.toUpperCase();
  const computedTxHash = crypto.createHash("md5").update(data).digest("hex");

  if (computedTxHash.toLowerCase() !== txHash.toLowerCase()) {
    return {
      isValid: false,
      reason: `txHash mismatch: computed ${computedTxHash} != received ${txHash}`,
    };
  }

  // 2. Validate HMAC SHA-256 signature if webhookSecret is configured
  if (webhookSecret) {
    const computedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(txHash)
      .digest("hex");

    if (computedSignature.toLowerCase() !== signature.toLowerCase()) {
      return {
        isValid: false,
        reason: `Signature mismatch: computed ${computedSignature} != received ${signature}`,
      };
    }
  }

  return { isValid: true };
}
