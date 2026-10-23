"use client";

import { Clapperboard, Menu, Search, UserRound, X } from "lucide-react";
import { useState } from "react";

interface Props { onOpenSearch: () => void; }

export function SiteHeader({ onOpenSearch }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [{ label: "Home", href: "#top" }, { label: "Trending", href: "#trending" }, { label: "Movies", href: "#movies" }, { label: "Series", href: "#series" }, { label: "Collections", href: "#collections" }];
  return <header className="site-header">
    <div className="header-inner">
      <a href="#top" className="brand-logo" aria-label="BharatFlix home"><span className="brand-icon"><Clapperboard size={22}/></span><span>bharat<span>flix</span></span><span className="brand-dot">.</span></a>
      <nav className="desktop-nav" aria-label="Home sections">{links.map((link, i) => <a key={link.href} className={i === 0 ? "active" : ""} href={link.href}>{link.label}</a>)}</nav>
      <div className="header-actions">
        <span className="demo-chip"><span/> DEMO EDITION</span>
        <button className="header-icon-button" type="button" aria-label="Search titles" onClick={onOpenSearch}><Search size={21}/></button>
        <span className="header-avatar" aria-label="Demo viewer" title="Demo viewer"><UserRound size={19}/></span>
        <button className="header-icon-button mobile-menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
    </div>
    {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{links.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>)}</nav>}
  </header>;
}
