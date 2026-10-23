import type { Metadata } from "next";
import { MySpaceExperience } from "@/components/library/my-space-experience";
export const metadata: Metadata = { title: "My Space | BharatFlix", robots: { index: false } };
export default function MySpacePage() { return <MySpaceExperience />; }
