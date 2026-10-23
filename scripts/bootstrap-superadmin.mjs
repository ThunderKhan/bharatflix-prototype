/** One-time local provisioning. Never embeds or prints the password. */
import { DatabaseSync } from "node:sqlite";
import { randomUUID, randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const email=process.env.BHARATFLIX_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const password=process.env.BHARATFLIX_BOOTSTRAP_PASSWORD;
const name=process.env.BHARATFLIX_BOOTSTRAP_NAME?.trim()||"BharatFlix Owner";
if (!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!password||password.length<12||password.length>128){console.error("Set BHARATFLIX_BOOTSTRAP_EMAIL and BHARATFLIX_BOOTSTRAP_PASSWORD (12–128 chars) before running.");process.exit(1);}
const file=path.resolve(process.env.BHARATFLIX_DATABASE_PATH||".local-data/bharatflix.sqlite");
fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});
const db=new DatabaseSync(file);
db.exec(`PRAGMA journal_mode=WAL;CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,display_name TEXT NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('viewer','admin','superadmin')),disabled INTEGER NOT NULL DEFAULT 0,failed_attempts INTEGER NOT NULL DEFAULT 0,locked_until INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL);`);
const existing=db.prepare("SELECT id,role FROM users WHERE email=?").get(email);
if(existing){console.error("Account already exists; no changes made. Promote an existing account through the User Management UI using a super-admin.");process.exit(1);}
const salt=randomBytes(16);const hash=scryptSync(password,salt,64,{N:16384,r:8,p:1});
db.prepare("INSERT INTO users(id,email,display_name,password_hash,role,created_at) VALUES(?,?,?,?,?,?)").run(randomUUID(),email,name,`scrypt$v1$${salt.toString("hex")}$${hash.toString("hex")}`,"superadmin",Date.now());
console.log(`Super-admin created for ${email}. Credentials are not printed.`);
db.close();
