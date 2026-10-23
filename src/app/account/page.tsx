import { Suspense } from "react";
import type { Metadata } from "next";
import { AccountExperience } from "@/components/account/account-experience";
export const metadata:Metadata={title:"Sign in · BharatFlix",robots:{index:false}};
export default function AccountPage(){return <Suspense fallback={<main className="auth-page">Loading account…</main>}><AccountExperience/></Suspense>}
