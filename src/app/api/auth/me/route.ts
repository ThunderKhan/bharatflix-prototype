import { NextResponse } from "next/server";
import { currentAccount } from "@/lib/account-service";
import { isDemoMode } from "@/lib/demo-auth";
import { noStoreHeaders } from "@/lib/account-http";
export const runtime="nodejs";
export async function GET(){return NextResponse.json({user:await currentAccount(),demo:isDemoMode()},{headers:noStoreHeaders});}
