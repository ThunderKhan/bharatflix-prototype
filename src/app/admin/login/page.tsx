import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clapperboard, ShieldCheck } from "lucide-react";
import { currentUser } from "@/lib/admin/auth";
import { login } from "@/lib/admin/actions";

export const metadata: Metadata = { title: "Sign in | BharatFlix Studio", robots: { index: false, follow: false } };

export default async function StudioLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentUser()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="studio-login">
      <form className="studio-login-card" action={login}>
        <Link href="/" className="studio-login-brand"><Clapperboard size={26} /> BharatFlix <span>Studio</span></Link>
        <p>Sign in to manage the catalogue, artwork, streams and homepage rows.</p>
        {error ? <p className="studio-error" role="alert">{error}</p> : null}
        <label>Email
          <input name="email" type="email" autoComplete="username" required placeholder="you@studio.test" />
        </label>
        <label>Password
          <input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
        </label>
        <button className="studio-primary" type="submit">Sign in</button>
        <small className="studio-login-hint"><ShieldCheck size={13} /> Local demo login — admin@bharatflix.local / admin123</small>
      </form>
    </main>
  );
}
