import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
function load(src, mocks={}) {
 const parsed=ts.transpileModule(read(src),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
 assert.equal(parsed.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
 const exports={};
 vm.runInNewContext(parsed.outputText,{exports,require:id=>mocks[id]??createRequire(import.meta.url)(id),Buffer,Date,Set,String,Object,Math,Number,process},{filename:src});
 return exports;
}
const sec=load('src/lib/account-security.ts');
const redirects=load('src/lib/safe-next-path.ts');

test('user registrations cannot inject privileged role and require strong input',()=>{
 assert.equal(sec.normalizeEmail(' Owner@Example.COM '),'owner@example.com');
 assert.equal(sec.normalizeEmail('evil@example.com\nX:a'),null);
 assert.equal(sec.validatePassword('short'),false);
 assert.equal(sec.validatePassword('long-password-42'),true);
 assert.equal(sec.validateName('  Example   User  '),'Example User');
 const route=read('src/app/api/auth/register/route.ts');
 assert.match(route,/registerViewer\(/);
 const srv=read('src/lib/account-service.ts');
 assert.match(srv,/role: "viewer"/);
 assert.match(srv,/actor\.role !== "superadmin"/);
});
test('scrypt hashing uses unique salted digests and verifies correct password',()=>{
 const a=sec.hashPassword('a-safe-password-123');
 const b=sec.hashPassword('a-safe-password-123');
 assert.notEqual(a,b);
 assert.equal(sec.verifyPassword('a-safe-password-123',a),true);
 assert.equal(sec.verifyPassword('different-password',a),false);
 assert.equal(sec.verifyPassword('anything','broken-hash'),false);
});
test('session token is opaque and cannot be reverse-looked up without digest',()=>{
 const x=sec.issueOpaqueSession();
 assert.equal(x.token.length>=40,true);
 assert.notEqual(x.token,x.hash);
 assert.equal(sec.digestToken(x.token),x.hash);
});
test('login return paths prohibit offsite and protocol-relative redirects',()=>{
 assert.equal(redirects.safeNextPath('//evil.example'),'/my-space');
 assert.equal(redirects.safeNextPath('https://evil.example'),'/my-space');
 assert.equal(redirects.safeNextPath('/admin/users'),'/admin/users');
 assert.equal(redirects.safeNextPath('/\\evil'),'/my-space');
});
test('admin page and user API gate access with actual sessions and role checks',()=>{
 assert.match(read('src/app/admin/(dashboard)/layout.tsx'),/requireOperator\(\)/);
 assert.match(read('src/app/admin/users/page.tsx'),/user\.role\s*!==\s*"superadmin"/);
 assert.match(read('src/app/api/admin/users/route.ts'),/allowRoles\("superadmin"\)/);
 assert.match(read('src/lib/account-http.ts'),/x-bharatflix-action/);
 assert.match(read('src/lib/account-http.ts'),/origin === expected/);
});
test('separate per-user watchlist and viewing history use user-id keyed persistent tables',()=>{
 const db=read('src/lib/account-db.ts');
 assert.match(db,/PRIMARY KEY\(user_id,slug\)/);
 assert.match(db,/PRIMARY KEY\(user_id,media_id\)/);
 assert.match(read('src/app/api/library/route.ts'),/currentAccount\(\)/);
});
