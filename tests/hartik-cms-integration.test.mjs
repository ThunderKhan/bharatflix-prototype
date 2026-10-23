import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

test("Hartik's normalized CMS schema installs on SQLite and covers editorial entities",()=>{
  const db=new DatabaseSync(":memory:");
  db.exec(fs.readFileSync("src/lib/db/schema.sql","utf8"));
  for(const table of ["titles","genres","collections","seasons","episodes","streams","rows","audit_log","settings"]) {
    assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table)?.name,table);
  }
  db.close();
});
test("persistent studio uses existing account sessions and no seeded demo password",()=>{
  const auth=fs.readFileSync("src/lib/admin/auth.ts","utf8");
  const seed=fs.readFileSync("src/lib/db/seed.ts","utf8");
  assert.match(auth,/currentAccount\(\)/);
  assert.match(auth,/user.role !== "admin"/);
  assert.doesNotMatch(seed,/admin123|ensureOperator/);
});
test("new routes coexist with current admin dashboard and super-admin accounts",()=>{
  for(const path of ["src/app/admin/page.tsx","src/app/admin/users/page.tsx","src/app/admin/(dashboard)/titles/page.tsx","src/app/admin/(dashboard)/rows/page.tsx","src/components/admin/admin-experience.tsx"]) {
    assert.ok(fs.existsSync(path),path);
  }
});
