import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/connection";
import { verifyToken, signToken } from "./crypto";

/** Studio sessions: a signed, expiring cookie checked on every admin request. */

const COOKIE = "bharatflix:studio";
const SESSION_DAYS = 7;

export type Operator = { id: string; email: string; name: string; role: "admin" | "editor" };

function sessionSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const file = path.join(process.cwd(), "data", ".session-secret");
  try {
    return fs.readFileSync(file, "utf8").trim();
  } catch {
    const value = crypto.randomBytes(32).toString("hex");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, value, { mode: 0o600 });
    return value;
  }
}

export async function createSession(operatorId: string): Promise<void> {
  const expires = Date.now() + SESSION_DAYS * 86_400_000;
  const payload = `${operatorId}.${expires}`;
  (await cookies()).set(COOKIE, `${payload}.${signToken(payload, sessionSecret())}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function currentUser(): Promise<Operator | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [operatorId, expires, token] = raw.split(".");
  if (!operatorId || !expires || !token) return null;
  if (!verifyToken(`${operatorId}.${expires}`, token, sessionSecret())) return null;
  if (Number(expires) < Date.now()) return null;
  const row = getDb()
    .prepare("SELECT id, email, name, role FROM users WHERE id = ?")
    .get(operatorId) as Operator | undefined;
  return row ?? null;
}

/** Page guard: bounces signed-out visitors to the login screen. */
export async function requireOperator(): Promise<Operator> {
  const operator = await currentUser();
  if (!operator) redirect("/admin/login");
  return operator;
}

/** Action guard: mutations must come from a signed-in operator. */
export async function assertOperator(): Promise<Operator> {
  const operator = await currentUser();
  if (!operator) throw new Error("Sign-in required.");
  return operator;
}
