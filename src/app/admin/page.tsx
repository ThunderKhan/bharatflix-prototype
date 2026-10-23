import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/account-service";
import { AdminExperience } from "@/components/admin/admin-experience";
export const metadata: Metadata = { title:"Operator Studio (Demo) | BharatFlix", robots:{ index:false,follow:false } };
export const runtime="nodejs";
export default async function AdminPage() {const user=await currentAccount();if(!user)redirect("/account?next=/admin");if(user.role==="viewer")redirect("/my-space");return <><div className="admin-role-banner"><span>Signed in as {user.name} · {user.role}</span>{user.role==="superadmin"&&<a href="/admin/users">Manage accounts →</a>}</div><AdminExperience/></>;}
