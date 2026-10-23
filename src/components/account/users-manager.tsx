"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { ArrowLeft, ShieldCheck, Users } from "lucide-react";
type Row={id:string;email:string;display_name:string;role:"viewer"|"admin"|"superadmin";disabled:number;created_at:number};
export function UsersManager({selfId}:{selfId:string}){
 const [users,setUsers]=useState<Row[]>([]);const [busy,setBusy]=useState<string|null>(null);const [message,setMessage]=useState("");
 useEffect(()=>{fetch("/api/admin/users",{cache:"no-store"}).then(x=>x.json()).then(data=>setUsers(data.users??[])).catch(()=>setMessage("Unable to load accounts."))},[]);
 async function setRole(id:string,role:Row["role"]){setBusy(id);setMessage("");try{
 const res=await fetch("/api/admin/users",{method:"PATCH",headers:{"content-type":"application/json","x-bharatflix-action":"1"},body:JSON.stringify({userId:id,role})});const response=await res.json();if(!res.ok)throw Error(response.error??"Update failed.");setUsers(all=>all.map(u=>u.id===id?{...u,role}:u));setMessage("Role updated.");
 }catch(e){setMessage(e instanceof Error?e.message:"Update failed.")}finally{setBusy(null)}}
 return <main className="user-admin-page"><Link href="/admin" className="user-admin-back"><ArrowLeft size={17}/> Back to Studio</Link><div className="user-admin-title"><ShieldCheck size={29}/><div><span className="section-eyebrow">SUPER-ADMIN ONLY</span><h1>Account permissions</h1><p>Server-enforced roles. Registrations always start as viewers.</p></div></div>
 {message&&<p className="admin-notice" role="status">{message}</p>}
 <div className="user-admin-table"><div className="user-admin-table-header"><Users size={18}/> {users.length} registered accounts</div><div className="user-admin-table-scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td>{u.display_name}{u.id===selfId?" (you)":""}</td><td>{u.email}</td><td><select aria-label={`Role for ${u.email}`} value={u.role} disabled={busy===u.id||u.id===selfId} onChange={e=>void setRole(u.id,e.target.value as Row["role"])}><option value="viewer">Viewer</option><option value="admin">Admin</option><option value="superadmin">Super-admin</option></select></td><td>{new Date(u.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></div><p className="user-admin-warning">Only promote colleagues you trust. Admin and super-admin accounts can access the prototype operator studio. The CMS remains a browser-local demo until your colleague connects the persistent backend.</p></main>;
}
