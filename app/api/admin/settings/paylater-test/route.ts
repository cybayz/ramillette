import { NextResponse } from "next/server";
import { getSession, isAdminRole } from "@/lib/auth/session";
import { getPayLaterAccessToken, getPayLaterConfig } from "@/lib/services/paylater";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const config = await getPayLaterConfig();
    const token = await getPayLaterAccessToken();

    return NextResponse.json({
      success: true,
      environment: config.environment,
      clientId: config.clientId,
      outletId: config.outletId,
      message: `Successfully authenticated with PayLater ${config.environment.toUpperCase()} OAuth2 server! Bearer token acquired.`,
      tokenPreview: `${token.slice(0, 15)}...${token.slice(-10)}`,
    });
  } catch (error: any) {
    console.error("[PayLater Test] Auth error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to authenticate with PayLater API",
      },
      { status: 400 }
    );
  }
}
