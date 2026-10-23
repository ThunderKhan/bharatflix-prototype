import type { Metadata } from "next";
import { AdminExperience } from "@/components/admin/admin-experience";
export const metadata: Metadata = { title:"Operator Studio (Demo) | BharatFlix", robots:{ index:false,follow:false } };
export default function AdminPage() {return <AdminExperience/>;}
