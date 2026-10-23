import { NextRequest, NextResponse } from "next/server";
import { actionGuard, noStoreHeaders } from "@/lib/account-http";
import { revokeSession } from "@/lib/account-service";
import { SESSION_COOKIE } from "@/lib/account-security";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 const forbidden=actionGuard(request);if(forbidden)return forbidden;
 revokeSession(request.cookies.get(SESSION_COOKIE)?.value);
 const response=NextResponse.json({ok:true},{headers:noStoreHeaders});
 response.cookies.delete(SESSION_COOKIE);
 return response;
}
