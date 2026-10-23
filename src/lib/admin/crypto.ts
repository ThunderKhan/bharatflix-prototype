import crypto from "node:crypto";

/**
 * Password hashing and session-token signing.
 *
 * Deliberately free of database and framework imports so it can be unit tested
 * on its own. scrypt with a per-password salt for stored credentials, HMAC-SHA256
 * for session tokens.
 */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = String(stored).split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const candidate = crypto.scryptSync(password, salt, 64);
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

export function signToken(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/** Constant-time comparison of a token against the signature it should carry. */
export function verifyToken(payload: string, token: string, secret: string): boolean {
  const expected = Buffer.from(signToken(payload, secret));
  const actual = Buffer.from(String(token));
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
