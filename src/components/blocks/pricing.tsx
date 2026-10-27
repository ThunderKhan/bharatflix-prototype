"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, Check, Clapperboard, Star } from "lucide-react";
import { SiteHeader } from "@/components/home/site-header";
import { SearchOverlay } from "@/components/home/search-overlay";
import { PreviewDialog } from "@/components/home/preview-dialog";
import type { MediaTitle } from "@/types/media";
import styles from "./pricing.module.css";

export interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

const rupees = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);

const confettiPieces = Array.from({ length: 14 }, (_, index) => {
  const angle = (index / 14) * Math.PI * 2;
  const distance = 36 + (index % 3) * 13;
  return {
    "--dx": String(Math.round(Math.cos(angle) * distance)) + "px",
    "--dy": String(Math.round(Math.sin(angle) * distance)) + "px",
    "--delay": String((index % 4) * 28) + "ms",
  } as CSSProperties;
});

export function Pricing({
  plans,
  title = "A plan for every screen.",
  description = "Explore our proposed streaming plans for the BharatFlix experience.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const [burst, setBurst] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<MediaTitle | null>(null);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closePreview = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  const handleToggle = () => {
    setIsMonthly((previous) => !previous);
    setBurst((previous) => previous + 1);
  };

  return (
    <div className={styles.shell}>
      <SiteHeader onOpenSearch={openSearch} />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}><Clapperboard size={15} aria-hidden="true" /> BHARATFLIX MEMBERSHIP CONCEPT</p>
          <h1>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.billing} role="group" aria-label="Billing frequency">
          <span className={isMonthly ? styles.activePeriod : styles.periodLabel}>Monthly</span>
          <span className={styles.switchWrap}>
            <button
              className={styles.billingSwitch}
              type="button"
              role="switch"
              aria-label="Annual billing"
              aria-checked={!isMonthly}
              onClick={handleToggle}
            >
              <span className={styles.switchThumb} />
            </button>
            {!isMonthly && (
              <span key={burst} className={styles.confetti} aria-hidden="true">
                {confettiPieces.map((style, index) => <i key={index} style={style} />)}
              </span>
            )}
          </span>
          <span className={!isMonthly ? styles.activePeriod : styles.periodLabel}>Annual <span className={styles.saveTag}>SAVE 20%</span></span>
        </div>

        <div className={styles.cards}>
          {plans.map((plan, index) => {
            const price = Number(isMonthly ? plan.price : plan.yearlyPrice);
            const annualTotal = Number(plan.yearlyPrice) * 12;
            return (
              <article
                key={plan.name}
                className={[
                  styles.plan,
                  plan.isPopular ? styles.popular : "",
                  index === 0 ? styles.left : "",
                  index === plans.length - 1 ? styles.right : "",
                ].filter(Boolean).join(" ")}
              >
                {plan.isPopular && (
                  <div className={styles.popularTag}><Star size={13} fill="currentColor" aria-hidden="true" /> MOST POPULAR</div>
                )}
                <div className={styles.planHeading}>
                  <p className={styles.planName}>{plan.name}</p>
                  <p className={styles.planDescription}>{plan.description}</p>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.price} key={isMonthly ? "monthly" : "annual"} aria-live="polite">{rupees(price)}</span>
                  <span className={styles.per}>/ {plan.period}</span>
                </div>
                <p className={styles.billingDetail}>
                  {isMonthly ? "Billed monthly" : "Billed annually at " + rupees(annualTotal)}
                </p>
                <div className={styles.cardRule} />
                <p className={styles.includes}>WHAT&apos;S INCLUDED</p>
                <ul className={styles.features}>
                  {plan.features.map((feature) => (
                    <li key={feature}><Check size={16} strokeWidth={2.5} aria-hidden="true" /><span>{feature}</span></li>
                  ))}
                </ul>
                <div className={styles.cardBottom}>
                  <Link href={plan.href} className={plan.isPopular ? styles.featuredAction : styles.action}>
                    {plan.buttonText}<ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <p className={styles.pricingFinePrint}>
          Concept pricing only. Plan prices, screen limits and premium features are illustrative; no subscriptions, payments, or plan-based access are available in this demo.
        </p>

        <section className={styles.afterPlans} aria-labelledby="after-plans-title">
          <div>
            <p className={styles.eyebrow}>THE STORIES ARE WAITING</p>
            <h2 id="after-plans-title">Discover what BharatFlix feels like.</h2>
            <p>Explore original fictional titles and licensed open-film demonstrations without selecting a paid plan.</p>
          </div>
          <Link href="/explore" className={styles.exploreAction}>Browse the catalogue <ArrowRight size={17} aria-hidden="true" /></Link>
        </section>
      </main>
      <footer className="site-footer site-footer-editorial">
        <div className="footer-bottom">
          <span>© 2026 BharatFlix · VSPH concept</span>
          <span>Illustrative membership plans · No active billing service</span>
        </div>
      </footer>
      {searchOpen && <SearchOverlay onClose={closeSearch} onSelect={(title) => { setSearchOpen(false); setSelected(title); }} />}
      {selected && <PreviewDialog title={selected} onClose={closePreview} />}
    </div>
  );
}
