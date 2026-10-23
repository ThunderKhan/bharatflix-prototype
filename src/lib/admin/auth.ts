import "server-only";
import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/account-service";
import type { PublicAccount } from "@/lib/account-security";

export type Operator = PublicAccount & { role: "admin" | "superadmin" };
/** Hartik's CMS uses the existing BharatFlix sessions, not a second login. */
export async function requireOperator(): Promise<Operator> {
  const user = await currentAccount();
  if (!user) redirect("/account?next=/admin/titles");
  if (user.role !== "admin" && user.role !== "superadmin") redirect("/my-space");
  return user as Operator;
}
export async function assertOperator(): Promise<Operator> {
  const user = await currentAccount();
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) throw new Error("Staff sign-in required");
  return user as Operator;
}
