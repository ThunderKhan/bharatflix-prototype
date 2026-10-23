import { NextRequest, NextResponse } from "next/server";
import { actionBody, actionGuard, attachSession, noStoreHeaders, sendFailure } from "@/lib/account-http";
import { applyRateLimit, createSession, registerViewer } from "@/lib/account-service";
import { createHash } from "node:crypto";
export const runtime="nodejs";
export async function POST(request:NextRequest){
  const forbidden=actionGuard(request);if(forbidden)return forbidden;
  try {
    const body=await actionBody(request);
    const key=createHash("sha256").update(`register:${String(body.email).toLowerCase()}`).digest("hex");
    applyRateLimit(key,5,60*60_000);
    const user=registerViewer({email:body.email,name:body.name,password:body.password});
    return attachSession(NextResponse.json({user},{status:201,headers:noStoreHeaders}),createSession(user.id));
  }catch(e){return sendFailure(e)}
}
