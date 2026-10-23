import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BharatFlix | Stories worth staying for",
  description: "BharatFlix OTT platform concept — interactive client prototype with a fictional sample catalogue.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
