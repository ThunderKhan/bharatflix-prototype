"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Clapperboard, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { safeNextPath } from "@/lib/safe-next-path";
export function AccountExperience(){
 const params=useSearchParams();const next=safeNextPath(params.get("next"));
 const [mode,setMode]=useState<"login"|"register">("login");
 const [email,setEmail]=useState("");const [name,setName]=useState("");const [password,setPassword]=useState("");
 const [visible,setVisible]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");
  try{const response=await fetch(`/api/auth/${mode}`,{method:"POST",headers:{"content-type":"application/json","x-bharatflix-action":"1"},credentials:"same-origin",body:JSON.stringify({email,name,password})});
   const data=await response.json() as {user?:{role:string};error?:string};
   if(!response.ok)throw Error(data.error??"Sign in failed.");
   window.location.href=next==="/my-space"&&data.user?.role!=="viewer"?"/admin":next;
  }catch(e){setError(e instanceof Error?e.message:"Request failed.")}finally{setBusy(false)}
 }
 return <div className="auth-page"><div className="auth-gradient" aria-hidden="true"/><Link href="/" className="auth-logo"><Clapperboard size={25}/> bharat<span>flix</span><b>.</b></Link>
  <main className="auth-card"><div className="auth-icon"><LockKeyhole size={23}/></div><span className="section-eyebrow">YOUR BHARATFLIX ACCOUNT</span><h1>{mode==="login"?"Welcome back.":"Create your account."}</h1><p>{mode==="login"?"Sign in to save films, resume playback and access your personal library.":"Your own watchlist and viewing history, synced to this demo server."}</p>
  <div className="auth-tabs" role="group" aria-label="Authentication mode"><button type="button" aria-pressed={mode==="login"} onClick={()=>{setMode("login");setError("")}}>Sign in</button><button type="button" aria-pressed={mode==="register"} onClick={()=>{setMode("register");setError("")}}>Create account</button></div>
  <form onSubmit={submit}>{mode==="register"&&<label>Display name<input autoComplete="name" required minLength={2} maxLength={70} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label>}
   <label>Email address<input type="email" required autoComplete="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
   <label>Password<div className="auth-password"><input required type={visible?"text":"password"} autoComplete={mode==="login"?"current-password":"new-password"} minLength={mode==="register"?12:undefined} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 12 characters"/><button type="button" aria-label={visible?"Hide password":"Show password"} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
   {error&&<div role="alert" className="auth-error">{error}</div>}
   <button className="auth-submit" disabled={busy} type="submit"><UserRound size={18}/>{busy?"Please wait…":mode==="login"?"Sign in":"Create viewer account"}</button>
  </form><p className="auth-note">New accounts are viewers. Only a super-admin can grant staff access. Demo credentials and sessions are stored on the local server.</p></main><Link className="auth-back" href="/">← Back to BharatFlix</Link></div>;
}
