import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";

export type AccountRole = "viewer" | "admin" | "superadmin";
export type PublicAccount = { id: string; email: string; name: string; role: AccountRole };
export const SESSION_COOKIE = "bharatflix_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
export function validatePassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 12 && value.length <= 128;
}
export function validateName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  return name.length >= 2 && name.length <= 70 ? name : null;
}
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$v1$${salt.toString("hex")}$${derived.toString("hex")}`;
}
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "scrypt" || parts[1] !== "v1") return false;
  try {
    const salt = Buffer.from(parts[2], "hex");
    const expected = Buffer.from(parts[3], "hex");
    if (salt.length !== 16 || expected.length !== 64) return false;
    const result = scryptSync(password, salt, expected.length, { N: 16384, r: 8, p: 1 });
    return timingSafeEqual(result, expected);
  } catch { return false; }
}
export function issueOpaqueSession(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: digestToken(token) };
}
export function digestToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
