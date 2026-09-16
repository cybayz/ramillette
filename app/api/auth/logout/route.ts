import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  await clearSession();

  const accept = request.headers.get("accept") || "";
  const contentType = request.headers.get("content-type") || "";
  const isHtmlOrForm =
    accept.includes("text/html") ||
    contentType.includes("application/x-www-form-urlencoded") ||
    !contentType.includes("application/json");

  if (isHtmlOrForm) {
    const referer = request.headers.get("referer") || "";
    const isAr = referer.includes("/ar");
    const redirectTarget = isAr ? "/ar/account/login" : "/account/login";
    return NextResponse.redirect(new URL(redirectTarget, request.url), 303);
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  await clearSession();
  const referer = request.headers.get("referer") || "";
  const isAr = referer.includes("/ar");
  const redirectTarget = isAr ? "/ar/account/login" : "/account/login";
  return NextResponse.redirect(new URL(redirectTarget, request.url), 303);
}
