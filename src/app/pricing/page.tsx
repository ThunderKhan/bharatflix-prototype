import type { Metadata } from "next";
import { Pricing, type PricingPlan } from "@/components/blocks/pricing";

export const metadata: Metadata = {
  title: "Plans & Pricing | BharatFlix",
  description: "Explore illustrative BharatFlix streaming plans for individuals and households. This is a concept preview, not an active subscription service.",
};

const demoPlans: PricingPlan[] = [
  {
    name: "MOBILE",
    price: "149",
    yearlyPrice: "119",
    period: "month",
    features: [
      "Watch on 1 screen at a time",
      "Mobile and tablet viewing",
      "Standard-definition streaming",
      "Your own watchlist and progress",
      "Movies, series and Open Cinema",
    ],
    description: "A personal screen for stories on the go.",
    buttonText: "Explore the demo",
    href: "/explore",
    isPopular: false,
  },
  {
    name: "STANDARD",
    price: "299",
    yearlyPrice: "239",
    period: "month",
    features: [
      "Watch on 2 screens at a time",
      "Full HD (1080p) where available",
      "Phones, laptops, tablets and TVs",
      "Household viewing profiles",
      "Personal watchlists and progress",
      "An ad-free viewing experience",
    ],
    description: "A flexible home for everyday movie nights.",
    buttonText: "Explore the demo",
    href: "/explore",
    isPopular: true,
  },
  {
    name: "PREMIUM",
    price: "499",
    yearlyPrice: "399",
    period: "month",
    features: [
      "Watch on 4 screens at a time",
      "4K Ultra HD and HDR where available",
      "Immersive audio where supported",
      "All your favorite screens",
      "Up to 5 household profiles",
      "Offline viewing on supported devices",
      "Priority support",
    ],
    description: "The complete big-screen experience.",
    buttonText: "Explore the demo",
    href: "/explore",
    isPopular: false,
  },
];

export default function PricingPage() {
  return (
    <Pricing
      plans={demoPlans}
      title="A plan for every screen."
      description="From solo screenings to family movie nights, find the BharatFlix experience that fits. These plans and prices are illustrative concepts."
    />
  );
}
