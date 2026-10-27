import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (filename) => fs.readFileSync(path.join(root, filename), "utf8");

test("Pricing page exposes three illustrative OTT tiers with INR monthly and annual prices", () => {
  const page = read("src/app/pricing/page.tsx");
  for (const name of ["MOBILE", "STANDARD", "PREMIUM"]) {
    assert.match(page, new RegExp('name: "' + name + '"'));
  }
  for (const [monthly, annual] of [[149,119],[299,239],[499,399]]) {
    assert.match(page, new RegExp('price: "' + monthly + '"'));
    assert.match(page, new RegExp('yearlyPrice: "' + annual + '"'));
    const saving = (1 - annual / monthly) * 100;
    assert.ok(saving >= 19 && saving <= 21);
  }
  assert.equal((page.match(/href: "\/explore"/g) || []).length, 3);
  assert.match(page, /illustrative concepts/);
});

test("Pricing has accessible billing toggle, responsive cards, and honest demo disclaimer", () => {
  const component = read("src/components/blocks/pricing.tsx");
  const stylesheet = read("src/components/blocks/pricing.module.css");
  const header = read("src/components/home/site-header.tsx");
  assert.match(component, /role="switch"/);
  assert.match(component, /aria-checked=\{!isMonthly\}/);
  assert.match(component, /Number\(plan\.yearlyPrice\) \* 12/);
  assert.match(component, /no subscriptions, payments, or plan-based access/);
  assert.match(component, /prefers-reduced-motion|className=\{styles\.cards\}/);
  assert.match(stylesheet, /@media \(max-width: 1060px\)/);
  assert.match(stylesheet, /@media \(max-width: 700px\)/);
  assert.match(stylesheet, /prefers-reduced-motion/);
  assert.match(header, /href: "\/pricing"/);
});
