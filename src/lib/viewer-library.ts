"use client";
import { useEffect, useState } from "react";
import { emptyLibrary, removeHistory, resetDemoLibrary, saveViewingProgress, toggleWatchlist, useDemoLibrary, type DemoLibrary } from "@/lib/demo-library";
import type { PublicAccount } from "@/lib/account-security";

type Identity = PublicAccount | null;
let signedIn: Identity = null;
let currentLibrary: DemoLibrary = emptyLibrary;
const listeners=new Set<()=>void>();
function inform(){for(const cb of listeners)cb();}
async function sendAction(body:Record<string,unknown>):Promise<void>{
  const response=await fetch("/api/library",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json","x-bharatflix-action":"1"},body:JSON.stringify(body),cache:"no-store"});
  if(!response.ok)throw new Error("Unable to save library changes.");
  const value=await response.json() as {library:DemoLibrary};
  currentLibrary=value.library;
  inform();
}
export function useViewerLibrary(){
  const local=useDemoLibrary();
  const [account,setAccount]=useState<Identity>(null);
  const [library,setLibrary]=useState<DemoLibrary>(emptyLibrary);
  useEffect(()=>{
    let cancelled=false;
    async function load(){
      try{
        const response=await fetch("/api/auth/me",{cache:"no-store"});
        const data=await response.json() as {user:Identity};
        if(cancelled)return;
        signedIn=data.user;
        setAccount(data.user);
        if(data.user){
          const result=await fetch("/api/library",{cache:"no-store"});
          if(!result.ok)return;
          const current=await result.json() as {library:DemoLibrary};
          if(cancelled)return;
          currentLibrary=current.library;
          setLibrary(current.library);
          inform();
        }
      }catch{/* Gracefully retain local demo experience while offline. */}
    }
    load();
    const onChange=()=>setLibrary(currentLibrary);
    listeners.add(onChange);
    return()=>{cancelled=true;listeners.delete(onChange);};
  },[]);
  return {library:account?library:local,account};
}
export function toggleViewerWatchlist(slug:string){
  if(signedIn){void sendAction({action:"toggle",slug}).catch(console.error);}else toggleWatchlist(slug);
}
export function saveViewerProgress(id:string,seconds:number,duration:number){
  if(signedIn){void sendAction({action:"progress",id,seconds,duration}).catch(console.error);}else saveViewingProgress(id,seconds,duration);
}
export function removeViewerHistory(id:string){
  if(signedIn){void sendAction({action:"removeHistory",id}).catch(console.error);}else removeHistory(id);
}
export function resetViewerLibrary(){
  if(signedIn){void sendAction({action:"reset"}).catch(console.error);}else resetDemoLibrary();
}
