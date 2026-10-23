/** Boot the production Next.js server and assert real HTTP auth + per-user isolation. */
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

const temp = mkdtempSync(path.join(tmpdir(), "bharatflix-auth-smoke-"));
const database = path.join(temp, "users.sqlite");
const password = "Long-Demo-Password-For-Testing-2026";
const env = { ...process.env, BHARATFLIX_DATABASE_PATH:database, BHARATFLIX_BOOTSTRAP_EMAIL:"owner@test.invalid", BHARATFLIX_BOOTSTRAP_PASSWORD:password, NODE_ENV:"production" };
const provision = spawnSync(process.execPath,["scripts/bootstrap-superadmin.mjs"],{cwd:process.cwd(),env,encoding:"utf8"});
assert.equal(provision.status,0,`Bootstrap failed: ${provision.stderr}`);

async function freePort(){
  const server=net.createServer();await new Promise((resolve,reject)=>server.once("error",reject).listen(0,"127.0.0.1",resolve));
  const port=server.address().port;await new Promise(resolve=>server.close(resolve));return port;
}
const port=await freePort();
const base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--port",String(port)],{cwd:process.cwd(),env:{...env,PORT:String(port)},stdio:["ignore","pipe","pipe"]});
let output="";child.stdout.on("data",d=>output+=String(d).slice(-2000));child.stderr.on("data",d=>output+=String(d).slice(-2000));

async function api(endpoint,{method="GET",cookie,body,origin=base}={}){
 const headers={};if(cookie)headers.cookie=cookie;
 if(body){headers.origin=origin;headers["content-type"]="application/json";headers["x-bharatflix-action"]="1";}
 return fetch(base+endpoint,{method,redirect:"manual",headers,body:body?JSON.stringify(body):undefined});
}
async function json(res){return res.json();}
async function register(email,name){
 const res=await api("/api/auth/register",{method:"POST",body:{email,name,password}});
 assert.equal(res.status,201,`Registration failed ${res.status}: ${await res.text()}`);
 return {user:(await json(res)).user,cookie:res.headers.get("set-cookie")?.split(";")[0]};
}
try {
 let ready=false;
 for(let i=0;i<100;i++){
   if(child.exitCode!==null)throw new Error(`Server exited early: ${output.slice(-1000)}`);
   try{const res=await fetch(base+"/",{signal:AbortSignal.timeout(1000)});if(res.status===200){ready=true;break;}}catch{}
   await sleep(300);
 }
 assert.ok(ready,`Next.js server not ready: ${output.slice(-1000)}`);
 const first=await register("viewer1@test.invalid","First Viewer");
 assert.equal(first.user.role,"viewer");
 const second=await register("viewer2@test.invalid","Second Viewer");
 assert.equal(second.user.role,"viewer");
 const blocked=await api("/admin",{cookie:first.cookie});
 assert.ok([302,303,307,308].includes(blocked.status),`Viewer was allowed into /admin (${blocked.status})`);
 const forbidden=await api("/api/admin/users",{cookie:first.cookie});
 assert.equal(forbidden.status,403);
 const denied=await api("/api/library",{method:"POST",cookie:first.cookie,origin:"https://evil.invalid",body:{action:"toggle",slug:"sintel"}});
 assert.equal(denied.status,403);
 const add=await api("/api/library",{method:"POST",cookie:first.cookie,body:{action:"toggle",slug:"sintel"}});
 assert.equal(add.status,200,`Library save failed ${add.status}: ${await add.text()}`);
 const one=await json(await api("/api/library",{cookie:first.cookie}));
 const two=await json(await api("/api/library",{cookie:second.cookie}));
 assert.deepEqual(one.library.watchlist,["sintel"]);
 assert.deepEqual(two.library.watchlist,[],"Second viewer read someone else's watchlist");
 const login=await api("/api/auth/login",{method:"POST",body:{email:"owner@test.invalid",password}});
 assert.equal(login.status,200,`Super-admin login failed: ${await login.text()}`);
 const ownerCookie=login.headers.get("set-cookie")?.split(";")[0];
 const owner=await json(await api("/api/auth/me",{cookie:ownerCookie}));
 assert.equal(owner.user.role,"superadmin");
 const staff=await api("/api/admin/users",{method:"PATCH",cookie:ownerCookie,body:{userId:first.user.id,role:"admin"}});
 assert.equal(staff.status,200,`Promotion failed: ${await staff.text()}`);
 const upgraded=await json(await api("/api/auth/me",{cookie:first.cookie}));
 assert.equal(upgraded.user.role,"admin", "Existing sessions should use current server-side role");
 const adminPage=await api("/admin",{cookie:first.cookie});
 assert.equal(adminPage.status,200,"Admin cannot open operator studio");
 const stillForbidden=await api("/api/admin/users",{cookie:first.cookie});
 assert.equal(stillForbidden.status,403,"Admin must not manage account roles");
 const logout=await api("/api/auth/logout",{method:"POST",cookie:first.cookie,body:{}});
 assert.equal(logout.status,200);
 const revoked=await api("/api/auth/me",{cookie:first.cookie});
 assert.equal((await json(revoked)).user,null,"Logout must revoke the session");
 console.log("Auth HTTP smoke passed: sign-up, sessions, viewer/admin/superadmin RBAC, CSRF, per-user library isolation, and logout.");
}finally{
 child.kill("SIGTERM");
 await Promise.race([new Promise(resolve=>child.once("exit",resolve)),sleep(4000)]);
 rmSync(temp,{recursive:true,force:true});
}
