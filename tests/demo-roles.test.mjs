import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
function load(file, mocks = {}, env = {}) {
  const result = ts.transpileModule(read(file), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
  const exports = {};
  vm.runInNewContext(result.outputText, {
    exports,
    Buffer,
    Date,
    Math,
    Number,
    String,
    process: { env },
    require(id) {
      if (id === "server-only") return {};
      if (id === "node:crypto") return crypto;
      if (id in mocks) return mocks[id];
      throw Error("Unexpected import: " + id);
    },
  }, { filename: file });
  return exports;
}
const accounts = load("src/lib/demo-accounts.ts");
const demo = load("src/lib/demo-auth.ts", { "@/lib/demo-accounts": accounts }, {
  BHARATFLIX_DEMO_AUTH: "1",
  BHARATFLIX_DEMO_SESSION_SECRET: "unit-test-only-not-a-real-session-secret-" + "x".repeat(40),
});

test("exactly three distinct public demo accounts: viewer, admin, superadmin", () => {
  assert.deepEqual(Array.from(accounts.DEMO_ACCOUNTS, (entry) => entry.role), ["viewer", "admin", "superadmin"]);
  assert.equal(new Set(accounts.DEMO_ACCOUNTS.map((entry) => entry.email)).size, 3);
  assert.equal(new Set(accounts.DEMO_ACCOUNTS.map((entry) => entry.password)).size, 3);
  for (const entry of accounts.DEMO_ACCOUNTS) {
    assert.ok(entry.password.length >= 12);
    assert.equal(demo.verifyDemoLogin(entry.email, entry.password).role, entry.role);
    assert.equal(demo.verifyDemoLogin(entry.email, entry.password + "!"), null);
  }
});

test("demo role sessions are signed, expire, and cannot be edited into another role", () => {
  for (const entry of accounts.DEMO_ACCOUNTS) {
    const token = demo.createDemoSession(entry.id);
    assert.equal(demo.lookupDemoSession(token).role, entry.role);
    assert.equal(demo.lookupDemoSession(token + "a"), null);
    assert.equal(demo.lookupDemoSession(token.replace("bf-demo-v1", "bf-demo-v0")), null);
  }
  assert.equal(demo.lookupDemoSession("forged"), null);
  assert.throws(() => demo.createDemoSession("invented-superadmin"));
});

test("demo sign-in is discoverable and registration is disabled", () => {
  const ui = read("src/components/account/account-experience.tsx");
  const server = read("src/lib/account-service.ts");
  assert.match(ui, /DEMO_ACCOUNTS\.map/);
  assert.match(ui, /Copy /);
  assert.match(ui, /Use this account/);
  assert.match(server, /if \(isDemoMode\(\)\) throw new AccountError\(403/);
  assert.match(server, /createDemoSession\(userId\)/);
  assert.match(read("src/app/api/auth/me/route.ts"), /demo:isDemoMode\(\)/);
});

test("admin and super-admin have distinct server-side authorization boundaries", () => {
  const auth = read("src/lib/admin/auth.ts");
  const actions = read("src/lib/admin/actions.ts");
  const shell = read("src/components/admin/studio-shell.tsx");
  assert.match(auth, /user\.role !== "admin" && user\.role !== "superadmin"/);
  assert.match(auth, /user\.role !== "superadmin"/);
  assert.match(actions, /const operator = await assertSuperadmin\(\)/);
  assert.match(read("src/app/admin\/(dashboard)\/settings/page.tsx"), /requireSuperadmin\(\)/);
  assert.match(read("src/app/admin\/(dashboard)\/audit/page.tsx"), /requireSuperadmin\(\)/);
  assert.match(read("src/app/admin/users/page.tsx"), /user\.role !== "superadmin"/);
  assert.match(shell, /superadminOnly/);
  assert.match(read("src/app/admin/page.tsx"), /user\.role === "viewer"/);
});

test("Vercel demo stores no persistent account or catalogue data on immutable source disks", () => {
  assert.match(read("src/lib/db/connection.ts"), /return ":memory:"/);
  assert.match(read("src/lib/viewer-library.ts"), /signedInDemo/);
  assert.match(read("src/app/api/library/route.ts"), /isDemoMode\(\)/);
  assert.match(read("next.config.ts"), /outputFileTracingIncludes/);
});
