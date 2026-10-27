import { NextRequest, NextResponse } from "next/server";
import { actionBody, actionGuard, noStoreHeaders, sendFailure } from "@/lib/account-http";
import { accountDb } from "@/lib/account-db";
import { isDemoMode } from "@/lib/demo-auth";
import { currentAccount, AccountError } from "@/lib/account-service";
import { getTitleBySlug } from "@/lib/catalog";
import { getWatchTarget } from "@/lib/demo-media";
export const runtime="nodejs";
function accountLibrary(userId:string){
  const db=accountDb();
  const watchlist=db.prepare("SELECT slug FROM watchlist WHERE user_id=? ORDER BY rowid DESC").all(userId) as {slug:string}[];
  const history=db.prepare("SELECT media_id AS id,seconds,duration,updated_at AS updatedAt FROM watch_history WHERE user_id=? ORDER BY updated_at DESC LIMIT 100").all(userId);
  return {watchlist:watchlist.map(x=>x.slug),history};
}
export async function GET(){
  const user=await currentAccount();
  if(!user)return NextResponse.json({error:"Sign in first."},{status:401,headers:noStoreHeaders});
  if(isDemoMode())return NextResponse.json({library:{watchlist:[],history:[]},demo:true},{headers:noStoreHeaders});
  return NextResponse.json({library:accountLibrary(user.id)},{headers:noStoreHeaders});
}
export async function POST(request:NextRequest){
  const forbidden=actionGuard(request);if(forbidden)return forbidden;
  try{
    const user=await currentAccount();if(!user)throw new AccountError(401,"Sign in first.");
    if(isDemoMode())throw new AccountError(409,"Demo watchlists and playback progress are saved in your browser.");
    const input=await actionBody(request);
    const db=accountDb();
    if(input.action==="toggle"){
      if(typeof input.slug!=="string"||!getTitleBySlug(input.slug))throw new AccountError(400,"Unknown title.");
      const found=db.prepare("SELECT 1 FROM watchlist WHERE user_id=? AND slug=?").get(user.id,input.slug);
      if(found)db.prepare("DELETE FROM watchlist WHERE user_id=? AND slug=?").run(user.id,input.slug);
      else db.prepare("INSERT INTO watchlist(user_id,slug) VALUES (?,?)").run(user.id,input.slug);
    }else if(input.action==="progress"){
      if(typeof input.id!=="string"||!getWatchTarget(input.id))throw new AccountError(400,"Unknown video.");
      const seconds=Number(input.seconds), duration=Number(input.duration);
      if(!Number.isFinite(seconds)||!Number.isFinite(duration)||duration<=0||duration>86_400||seconds<0)throw new AccountError(400,"Invalid video position.");
      db.prepare("INSERT INTO watch_history(user_id,media_id,seconds,duration,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id,media_id) DO UPDATE SET seconds=excluded.seconds,duration=excluded.duration,updated_at=excluded.updated_at").run(user.id,input.id,Math.min(seconds,duration),duration,Date.now());
    }else if(input.action==="removeHistory"){
      if(typeof input.id!=="string"||!getWatchTarget(input.id))throw new AccountError(400,"Unknown video.");
      db.prepare("DELETE FROM watch_history WHERE user_id=? AND media_id=?").run(user.id,input.id);
    }else if(input.action==="reset"){
      db.prepare("DELETE FROM watchlist WHERE user_id=?").run(user.id);
      db.prepare("DELETE FROM watch_history WHERE user_id=?").run(user.id);
    }else throw new AccountError(400,"Unknown action.");
    return NextResponse.json({library:accountLibrary(user.id)},{headers:noStoreHeaders});
  }catch(e){return sendFailure(e)}
}
