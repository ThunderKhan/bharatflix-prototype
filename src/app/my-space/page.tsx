import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/account-service";
import { MySpaceExperience } from "@/components/library/my-space-experience";
export const metadata: Metadata = { title: "My Space | BharatFlix", robots: { index: false } };
export const runtime="nodejs";
export default async function MySpacePage() {const user=await currentAccount();if(!user)redirect("/account?next=/my-space");return <MySpaceExperience/>;}
