import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { requireOperator } from "@/lib/admin/auth";
import { StudioShell } from "@/components/admin/studio-shell";
import "@/components/admin/persistent-studio.css";

export const metadata: Metadata = { title: "Studio | BharatFlix", robots: { index: false, follow: false } };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

/** Every studio route sits behind this group, so one guard covers the lot. */
export default async function StudioLayout({ children }: { children: ReactNode }) {
  const operator = await requireOperator();
  return <StudioShell operatorName={operator.name || operator.email} operatorEmail={operator.email} operatorRole={operator.role}>{children}</StudioShell>;
}
