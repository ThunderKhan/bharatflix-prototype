import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/account-security";
import { AccountError } from "@/lib/account-service";

export const runtime = "nodejs";
export const noStoreHeaders = { "Cache-Control": "private, no-store" };
export function isSameOriginAction(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  // Next.js may normalize nextUrl.origin to localhost even when accessed through 127.0.0.1 or a LAN host.
  // For reverse proxies, configure BHARATFLIX_APP_ORIGIN to an exact, trusted canonical origin.
  const host = request.headers.get("host");
  const expected = process.env.BHARATFLIX_APP_ORIGIN ?? (host ? `${request.nextUrl.protocol}//${host}` : request.nextUrl.origin);
  return origin === expected && request.headers.get("x-bharatflix-action") === "1" && (request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json");
}
export function actionGuard(request: NextRequest): NextResponse | null {
  return isSameOriginAction(request) ? null : NextResponse.json({ error: "Request origin not permitted." }, { status: 403, headers:noStoreHeaders });
}
export async function actionBody(request: NextRequest): Promise<Record<string, unknown>> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 10_000) throw new AccountError(413,"Request is too large.");
  const text = await request.text();
  if (text.length > 10_000) throw new AccountError(413,"Request is too large.");
  const raw: unknown = JSON.parse(text);
  if (typeof raw !== "object" || !raw || Array.isArray(raw)) throw new AccountError(400,"Invalid JSON body.");
  return raw as Record<string,unknown>;
}
export function sendFailure(error: unknown): NextResponse {
  if (error instanceof AccountError) return NextResponse.json({error:error.message},{status:error.status,headers:noStoreHeaders});
  if (error instanceof SyntaxError) return NextResponse.json({error:"Invalid JSON body."},{status:400,headers:noStoreHeaders});
  console.error("BharatFlix account operation failed",error);
  return NextResponse.json({error:"Unable to complete this action."},{status:500,headers:noStoreHeaders});
}
export function attachSession(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV === "production",sameSite:"lax",path:"/",maxAge:SESSION_TTL_MS/1000});
  return response;
}
