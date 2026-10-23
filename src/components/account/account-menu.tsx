"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import type { PublicAccount } from "@/lib/account-security";
export function AccountMenu(){
 const [user,setUser]=useState<PublicAccount|null>(null);
 useEffect(()=>{let alive=true;fetch("/api/auth/me",{cache:"no-store"}).then(r=>r.json()).then(x=>{if(alive)setUser(x.user??null)}).catch(()=>{});return()=>{alive=false}},[]);
 async function logout(){await fetch("/api/auth/logout",{method:"POST",headers:{"content-type":"application/json","x-bharatflix-action":"1"},body:"{}"});window.location.href="/";}
 return <div className="account-top-nav">
  {user ? <><Link href="/my-space" className="account-nav-link"><UserRound size={16}/>{user.name.split(" ")[0]}</Link>{user.role!=="viewer"&&<Link href="/admin" className="account-nav-link"><ShieldCheck size={16}/>Studio</Link>}<button type="button" className="account-signout" onClick={logout} aria-label="Sign out"><LogOut size={17}/></button></>:
  <Link href="/account" className="account-nav-link"><UserRound size={16}/>Sign in</Link>}
 </div>;
}
