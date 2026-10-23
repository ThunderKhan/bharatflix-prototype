import { NextRequest, NextResponse } from "next/server";
import { actionBody, actionGuard, noStoreHeaders, sendFailure } from "@/lib/account-http";
import { allowRoles, assignRole, listAccounts } from "@/lib/account-service";
export const runtime="nodejs";
export async function GET(){
  const actor=await allowRoles("superadmin");
  if(!actor)return NextResponse.json({error:"Super-admin access required."},{status:403,headers:noStoreHeaders});
  return NextResponse.json({users:listAccounts()},{headers:noStoreHeaders});
}
export async function PATCH(request:NextRequest){
  const forbidden=actionGuard(request);if(forbidden)return forbidden;
  try{
    const actor=await allowRoles("superadmin");
    if(!actor)return NextResponse.json({error:"Super-admin access required."},{status:403,headers:noStoreHeaders});
    const input=await actionBody(request);
    assignRole(actor,input.userId,input.role);
    return NextResponse.json({ok:true},{headers:noStoreHeaders});
  }catch(e){return sendFailure(e)}
}
