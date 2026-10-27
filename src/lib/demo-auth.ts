import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import type { PublicAccount } from "@/lib/account-security";

const TOKEN_PREFIX = "bf-demo-v1";
const DEMO_TTL_MS = 12 * 60 * 60 * 1000;

export function isDemoMode(): boolean {
  return process.env.BHARATFLIX_DEMO_AUTH === "1" || process.env.VERCEL === "1";
}

function sessionSecret(): string {
  const secret = process.env.BHARATFLIX_DEMO_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("BHARATFLIX_DEMO_SESSION_SECRET must be configured for demo sessions.");
  }
  return secret;
}

function signature(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function equalText(first: string, second: string): boolean {
  const a = Buffer.from(first);
  const b = Buffer.from(second);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyDemoLogin(emailInput: unknown, passwordInput: unknown): PublicAccount | null {
  if (typeof emailInput !== "string" || typeof passwordInput !== "string") return null;
  const email = emailInput.trim().toLowerCase();
  const entry = DEMO_ACCOUNTS.find((candidate) => candidate.email === email);
  if (!entry || !equalText(passwordInput, entry.password)) return null;
  return { id: entry.id, email: entry.email, name: entry.name, role: entry.role };
}

export function createDemoSession(userId: string): string {
  if (!DEMO_ACCOUNTS.some((entry) => entry.id === userId)) throw new Error("Unknown demo account.");
  const expires = Date.now() + DEMO_TTL_MS;
  const payload = Buffer.from(userId + ":" + String(expires)).toString("base64url");
  return TOKEN_PREFIX + "." + payload + "." + signature(payload);
}

export function lookupDemoSession(token: string | undefined): PublicAccount | null {
  if (!token || token.length > 300) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== TOKEN_PREFIX) return null;
  const [, payload, provided] = parts;
  if (!/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]+$/.test(provided)) return null;
  if (!equalText(signature(payload), provided)) return null;
  const decoded = Buffer.from(payload, "base64url").toString("utf8");
  const match = /^([\w-]+):(\d{13})$/.exec(decoded);
  if (!match) return null;
  const expiry = Number(match[2]);
  if (expiry <= Date.now() || expiry > Date.now() + DEMO_TTL_MS) return null;
  const entry = DEMO_ACCOUNTS.find((candidate) => candidate.id === match[1]);
  return entry ? { id: entry.id, email: entry.email, name: entry.name, role: entry.role } : null;
}
