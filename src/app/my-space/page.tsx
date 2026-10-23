import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/account-service";
import { CatalogProvider } from "@/lib/catalog-context";
import { MySpaceExperience } from "@/components/library/my-space-experience";
import { getPublishedCatalog } from "@/lib/db/queries";
export const metadata: Metadata = { title: "My Space | BharatFlix", robots: { index: false } };
export const runtime="nodejs";
export const dynamic = "force-dynamic";
export default async function MySpacePage() {const user=await currentAccount();if(!user)redirect("/account?next=/my-space");return <CatalogProvider snapshot={getPublishedCatalog()}><MySpaceExperience /></CatalogProvider>;}
