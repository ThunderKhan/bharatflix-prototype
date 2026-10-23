"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon, Clapperboard, Film, History, LayoutDashboard, LogOut, Rows3, Settings, ShieldCheck, Users } from "lucide-react";
import type { ReactNode } from "react";
import { logout } from "@/lib/admin/actions";

const links: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/titles", label: "Catalogue", icon: Film },
  { href: "/admin/rows", label: "Homepage rows", icon: Rows3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/operators", label: "Operators", icon: Users },
  { href: "/admin/audit", label: "Activity", icon: History },
];

/** Sidebar chrome shared by every studio screen. */
export function StudioShell({ operatorName, operatorEmail, children }: { operatorName: string; operatorEmail: string; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand"><Clapperboard size={22} /> BharatFlix <span>Studio</span></Link>
        <span className="admin-sidebar-label">MANAGE</span>
        {links.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className={active ? "admin-nav-active" : undefined}>
              <Icon size={16} /> {link.label}
            </Link>
          );
        })}
        <div className="admin-side-foot">
          <ShieldCheck size={15} />
          <div><strong>{operatorName}</strong><br />{operatorEmail}</div>
        </div>
      </aside>
      <div className="admin-main">
        <div className="studio-actions">
          <Link href="/" className="admin-preview" target="_blank">View site ↗</Link>
          <form action={logout}>
            <button className="admin-edit" type="submit"><LogOut size={14} /> Sign out</button>
          </form>
        </div>
        {children}
      </div>
    </div>
  );
}
