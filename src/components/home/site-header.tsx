"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { AccountMenu } from "@/components/account/account-menu";

interface Props { onOpenSearch: () => void; }

const links = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Movies", href: "/explore?kind=movie" },
  { label: "TV Shows", href: "/explore?kind=series" },
  { label: "Open Cinema", href: "/#open-cinema" },
  { label: "Pricing", href: "/pricing" },
  { label: "My Space", href: "/my-space" },

];

export function SiteHeader({ onOpenSearch }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const active = (href: string) => href === "/" ? pathname === "/" : href === "/pricing" ? pathname === "/pricing" : href === "/explore" && pathname === "/explore";
  return <header className="site-header">
    <div className="header-inner">
      <Link href="/" className="brand-logo" aria-label="BharatFlix home"><span className="brand-icon"><Clapperboard size={22}/></span><span>bharat<span>flix</span></span><span className="brand-dot">.</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map((link) => <Link key={link.href} className={active(link.href) ? "active" : ""} href={link.href}>{link.label}</Link>)}</nav>
      <div className="header-actions">

        <button className="header-icon-button" type="button" aria-label="Search titles" onClick={onOpenSearch}><Search size={21}/></button>
        <AccountMenu/>
        <button className="header-icon-button mobile-menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
    </div>
    {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}</nav>}
  </header>;
}
