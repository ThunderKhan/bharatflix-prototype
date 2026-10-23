import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { actionBody, actionGuard, attachSession, noStoreHeaders, sendFailure } from "@/lib/account-http";
import { applyRateLimit, createSession, verifyLogin } from "@/lib/account-service";
export const runtime="nodejs";
export async function POST(request:NextRequest){
  const forbidden=actionGuard(request);if(forbidden)return forbidden;
  try{
    const body=await actionBody(request);
    const key=createHash("sha256").update(`login:${String(body.email).trim().toLowerCase()}`).digest("hex");
    applyRateLimit(key,12,15*60_000);
    const user=verifyLogin(body.email,body.password);
    return attachSession(NextResponse.json({user},{headers:noStoreHeaders}),createSession(user.id));
  }catch(e){return sendFailure(e)}
}
