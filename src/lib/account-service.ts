import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { accountDb } from "@/lib/account-db";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { createDemoSession, isDemoMode, lookupDemoSession, verifyDemoLogin } from "@/lib/demo-auth";
import { digestToken, hashPassword, issueOpaqueSession, normalizeEmail, SESSION_COOKIE, SESSION_TTL_MS, validateName, validatePassword, verifyPassword, type AccountRole, type PublicAccount } from "@/lib/account-security";

type UserRow = { id: string; email: string; display_name: string; password_hash: string; role: AccountRole; disabled: number; failed_attempts: number; locked_until: number; created_at: number };
export function publicAccount(row: UserRow): PublicAccount { return { id: row.id, email: row.email, name: row.display_name, role: row.role }; }
export class AccountError extends Error { constructor(public status: number, message: string) { super(message); } }

export function registerViewer(details: { email: unknown; name: unknown; password: unknown }): PublicAccount {
  if (isDemoMode()) throw new AccountError(403, "New accounts are disabled in this public demo. Choose one of the three demo accounts.");
  const email = normalizeEmail(details.email);
  const name = validateName(details.name);
  if (!email || !name || !validatePassword(details.password)) throw new AccountError(400, "Enter a valid name, email and password of at least 12 characters.");
  const db = accountDb();
  if (db.prepare("SELECT id FROM users WHERE email=?").get(email)) throw new AccountError(409, "This email already has an account.");
  const user = { id: randomUUID(), email, display_name: name, role: "viewer" as const };
  try {
    db.prepare("INSERT INTO users (id,email,display_name,password_hash,role,created_at) VALUES (?,?,?,?,?,?)")
      .run(user.id, email, name, hashPassword(details.password), "viewer", Date.now());
  } catch { throw new AccountError(409, "Unable to create this account."); }
  return publicAccount(user as UserRow);
}

export function verifyLogin(emailInput: unknown, passwordInput: unknown): PublicAccount {
  if (isDemoMode()) {
    const user = verifyDemoLogin(emailInput, passwordInput);
    if (!user) throw new AccountError(401, "Invalid demo email or password.");
    return user;
  }
  const email = normalizeEmail(emailInput);
  if (!email || typeof passwordInput !== "string" || passwordInput.length > 128) throw new AccountError(401, "Invalid email or password.");
  const db = accountDb();
  const row = db.prepare("SELECT * FROM users WHERE email=?").get(email) as UserRow | undefined;
  // Consume comparable password work even for unknown users to reduce timing-based enumeration.
  const valid = row ? verifyPassword(passwordInput, row.password_hash) : verifyPassword(passwordInput, DUMMY_HASH);
  if (!row || !valid || row.disabled || row.locked_until > Date.now()) {
    if (row && !row.disabled && row.locked_until <= Date.now()) {
      const attempts = row.failed_attempts + 1;
      db.prepare("UPDATE users SET failed_attempts=?, locked_until=? WHERE id=?").run(attempts >= 5 ? 0 : attempts, attempts >= 5 ? Date.now() + 15 * 60_000 : 0, row.id);
    }
    throw new AccountError(401, "Invalid email or password, or the account is temporarily locked.");
  }
  db.prepare("UPDATE users SET failed_attempts=0,locked_until=0 WHERE id=?").run(row.id);
  return publicAccount(row);
}
const DUMMY_HASH = "scrypt$v1$00000000000000000000000000000000$" + "00".repeat(64);

export function createSession(userId: string): string {
  if (isDemoMode()) return createDemoSession(userId);
  const db = accountDb();
  db.prepare("DELETE FROM sessions WHERE expires_at<?").run(Date.now());
  const { token, hash } = issueOpaqueSession();
  db.prepare("INSERT INTO sessions (token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)")
    .run(hash, userId, Date.now() + SESSION_TTL_MS, Date.now());
  return token;
}
export function revokeSession(token: string | undefined): void {
  if (isDemoMode()) return; // A short-lived stateless demo token is invalidated in this browser by clearing its cookie.
  if (token) accountDb().prepare("DELETE FROM sessions WHERE token_hash=?").run(digestToken(token));
}
export function lookupSession(token: string | undefined): PublicAccount | null {
  if (isDemoMode()) return lookupDemoSession(token);
  if (!token || !/^[\w-]{35,100}$/.test(token)) return null;
  const row = accountDb().prepare(`SELECT users.* FROM users JOIN sessions ON sessions.user_id=users.id WHERE sessions.token_hash=? AND sessions.expires_at>? AND users.disabled=0`).get(digestToken(token),Date.now()) as UserRow | undefined;
  return row ? publicAccount(row) : null;
}
export async function currentAccount(): Promise<PublicAccount | null> {
  const jar = await cookies();
  return lookupSession(jar.get(SESSION_COOKIE)?.value);
}
export async function allowRoles(...roles: AccountRole[]): Promise<PublicAccount | null> {
  const account = await currentAccount();
  return account && roles.includes(account.role) ? account : null;
}
export function listAccounts() {
  if (isDemoMode()) return DEMO_ACCOUNTS.map((entry) => ({ id: entry.id, email: entry.email, display_name: entry.name, role: entry.role, disabled: 0, created_at: Date.UTC(2026, 9, 23) }));
  return accountDb().prepare("SELECT id,email,display_name,role,disabled,created_at FROM users ORDER BY created_at DESC").all() as { id:string; email:string; display_name:string; role: AccountRole; disabled:number; created_at:number }[];
}
export function assignRole(actor: PublicAccount, targetId: unknown, requested: unknown): void {
  if (actor.role !== "superadmin") throw new AccountError(403,"Forbidden");
  if (isDemoMode()) throw new AccountError(403, "Demo roles are fixed and cannot be changed.");
  if (typeof targetId !== "string" || !["viewer","admin","superadmin"].includes(String(requested))) throw new AccountError(400,"Invalid account or role.");
  if (actor.id === targetId) throw new AccountError(400,"You cannot change your own role.");
  const updated = accountDb().prepare("UPDATE users SET role=? WHERE id=?").run(requested as string,targetId);
  if (updated.changes === 0) throw new AccountError(404,"Account not found.");
}
export function applyRateLimit(identifier: string, limit: number, windowMs: number) {
  if (isDemoMode()) return; // Demo credentials are intentionally public; no local SQLite rate-limit store.
  const db = accountDb(); const now=Date.now();
  const row=db.prepare("SELECT count,reset_at FROM auth_rate_limits WHERE identifier=?").get(identifier) as {count:number;reset_at:number}|undefined;
  if (row && row.reset_at > now && row.count>=limit) throw new AccountError(429,"Too many attempts. Please try again later.");
  if (!row || row.reset_at <= now) db.prepare("INSERT INTO auth_rate_limits(identifier,count,reset_at) VALUES(?,1,?) ON CONFLICT(identifier) DO UPDATE SET count=1,reset_at=excluded.reset_at").run(identifier,now+windowMs);
  else db.prepare("UPDATE auth_rate_limits SET count=count+1 WHERE identifier=?").run(identifier);
}
