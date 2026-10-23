import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");

/** Loads a dependency-light TypeScript module the same way the phase tests do. */
function loadTs(relative) {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    reportDiagnostics: true,
  });
  assert.equal((output.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error).length, 0);
  const exports = {};
  vm.runInNewContext(output.outputText, {
    exports,
    require: (id) => {
      if (id === "node:crypto") return Object.assign(crypto, { default: crypto });
      throw new Error(`unexpected import: ${id}`);
    },
    Buffer,
  }, { filename: relative });
  return exports;
}

const { hashPassword, verifyPassword, signToken, verifyToken } = loadTs("src/lib/admin/crypto.ts");

test("passwords are salted, hashed and verified", () => {
  const hash = hashPassword("correct horse battery staple");
  assert.ok(hash.startsWith("scrypt$"));
  assert.notEqual(hash, hashPassword("correct horse battery staple"), "each hash gets a fresh salt");
  assert.equal(verifyPassword("correct horse battery staple", hash), true);
  assert.equal(verifyPassword("wrong password", hash), false);
  assert.equal(verifyPassword("anything", "not-a-hash"), false);
});

test("session tokens are signed and rejected when tampered with", () => {
  const secret = "test-secret";
  const payload = "op-1.1767225600000";
  const token = signToken(payload, secret);
  assert.equal(verifyToken(payload, token, secret), true);
  assert.equal(verifyToken("op-2.1767225600000", token, secret), false, "another operator's payload cannot reuse it");
  assert.equal(verifyToken(payload, `${token.slice(0, -1)}0`, secret), false, "a flipped signature bit fails");
  assert.equal(verifyToken(payload, token, "other-secret"), false, "a different secret cannot verify it");
});
