import type { AccountRole, PublicAccount } from "@/lib/account-security";

export type DemoAccount = PublicAccount & {
  password: string;
  label: string;
  description: string;
};

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    id: "demo-viewer",
    name: "Viewer Demo",
    email: "viewer@bharatflix.demo",
    password: "ViewerDemo2026!",
    role: "viewer",
    label: "VIEWER",
    description: "Browse, watch and manage a personal library. No studio access.",
  },
  {
    id: "demo-admin",
    name: "Admin Demo",
    email: "admin@bharatflix.demo",
    password: "AdminDemo2026!",
    role: "admin",
    label: "ADMIN",
    description: "Manage content, homepage rows and editorial workspaces.",
  },
  {
    id: "demo-superadmin",
    name: "Super Admin Demo",
    email: "superadmin@bharatflix.demo",
    password: "SuperDemo2026!",
    role: "superadmin",
    label: "SUPER ADMIN",
    description: "Full studio access, account overview, settings and audit history.",
  },
];

export function hasDemoRole(role: string): role is AccountRole {
  return role === "viewer" || role === "admin" || role === "superadmin";
}
