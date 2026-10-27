"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Check, Clapperboard, Copy, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { safeNextPath } from "@/lib/safe-next-path";
import "./demo-accounts.css";

export function AccountExperience({ demoMode = false }: { demoMode?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const choose = (selectedEmail: string, selectedPassword: string) => {
    setMode("login");
    setEmail(selectedEmail);
    setPassword(selectedPassword);
    setError("");
    setCopied("Credentials filled. Select Sign in to continue.");
  };

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label + " copied.");
    } catch {
      setCopied("Clipboard unavailable. Select and copy the text shown.");
    }
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/" + (demoMode ? "login" : mode), {
        method: "POST",
        headers: { "content-type": "application/json", "x-bharatflix-action": "1" },
        credentials: "same-origin",
        body: JSON.stringify({ email, name, password }),
      });
      const data = await response.json() as { user?: { role: string }; error?: string };
      if (!response.ok) throw Error(data.error ?? "Sign in failed.");
      const role = data.user?.role ?? "viewer";
      let destination = next === "/my-space" ? (role === "viewer" ? "/my-space" : "/admin") : next;
      if (role === "viewer" && destination.startsWith("/admin")) destination = "/my-space";
      if (role === "admin" && ["/admin/users", "/admin/settings", "/admin/audit"].some((path) => destination.startsWith(path))) destination = "/admin";
      router.replace(destination);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-gradient" aria-hidden="true" />
      <Link href="/" className="auth-logo"><Clapperboard size={25} /> bharat<span>flix</span><b>.</b></Link>
      <main className={demoMode ? "auth-card auth-demo-layout" : "auth-card"}>
        <div className="auth-icon"><LockKeyhole size={23} /></div>
        <span className="section-eyebrow">{demoMode ? "PRESENTATION ACCESS" : "YOUR BHARATFLIX ACCOUNT"}</span>
        <h1>{demoMode ? "Step inside BharatFlix." : mode === "login" ? "Welcome back." : "Create your account."}</h1>
        <p>{demoMode ? "Choose a role to preview the viewer experience or the content management studio. All three demo credentials are shown below." : mode === "login" ? "Sign in to save films, resume playback and access your personal library." : "Your own watchlist and viewing history, synced to this demo server."}</p>

        {demoMode && (
          <section className="demo-account-section" aria-label="Available demonstration accounts">
            <div className="demo-account-grid">
              {DEMO_ACCOUNTS.map((entry) => (
                <article className="demo-account-option" key={entry.id}>
                  <div className="demo-account-title"><ShieldCheck size={17} aria-hidden="true" /><strong>{entry.label}</strong></div>
                  <p>{entry.description}</p>
                  <div className="demo-account-credential"><span>Email</span><div><code>{entry.email}</code><button type="button" onClick={() => void copy(entry.email, entry.label + " email")} aria-label={"Copy " + entry.label + " email"}><Copy size={16} /></button></div></div>
                  <div className="demo-account-credential"><span>Password</span><div><code>{entry.password}</code><button type="button" onClick={() => void copy(entry.password, entry.label + " password")} aria-label={"Copy " + entry.label + " password"}><Copy size={16} /></button></div></div>
                  <button className="demo-use-account" type="button" onClick={() => choose(entry.email, entry.password)}><Check size={15} /> Use this account</button>
                </article>
              ))}
            </div>
            <p className="demo-account-feedback" role="status" aria-live="polite">{copied}</p>
          </section>
        )}

        {!demoMode && (
          <div className="auth-tabs" role="group" aria-label="Authentication mode">
            <button type="button" aria-pressed={mode === "login"} onClick={() => { setMode("login"); setError(""); }}>Sign in</button>
            <button type="button" aria-pressed={mode === "register"} onClick={() => { setMode("register"); setError(""); }}>Create account</button>
          </div>
        )}

        <form className={demoMode ? "demo-login-form" : undefined} onSubmit={submit}>
          {!demoMode && mode === "register" && <label>Display name<input autoComplete="name" required minLength={2} maxLength={70} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>}
          <label>Email address<input type="email" required autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder={demoMode ? "Choose a demo account above" : "you@example.com"} /></label>
          <label>Password<div className="auth-password"><input required type={visible ? "text" : "password"} autoComplete={demoMode || mode === "login" ? "current-password" : "new-password"} minLength={!demoMode && mode === "register" ? 12 : undefined} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={demoMode ? "Copy the visible demo password" : "At least 12 characters"} /><button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible((value) => !value)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          {error && <div role="alert" className="auth-error">{error}</div>}
          <button className="auth-submit" disabled={busy} type="submit"><UserRound size={18} />{busy ? "Please wait…" : demoMode || mode === "login" ? "Sign in to demo" : "Create viewer account"}</button>
        </form>
        <p className="auth-note">{demoMode ? "Public showcase accounts only. Anyone with this link can use these credentials. No real members, payment information or production permissions are stored." : "New accounts are viewers. Only a super-admin can grant staff access. Credentials and sessions are stored on the local server."}</p>
      </main>
      <Link className="auth-back" href="/">← Back to BharatFlix</Link>
    </div>
  );
}
