# BharatFlix — authentication, viewer data, and staff roles

**Status:** functional **local/persistent-Node-server prototype**, NOT production-ready identity infrastructure.

## Feature sources
- [Jellyfin's user-management model](https://jellyfin.org/docs/general/server/users/adding-managing-users/): user roles, personalized library, administration.
- [Aurora Jellyfin frontend](https://github.com/Get-Coral/aurora): Continue Watching, favorites, per-user sessions, cinematic browse flows. Studied for interaction patterns; no Aurora source directly copied.
- [Next.js async cookies API](https://nextjs.org/docs/app/api-reference/functions/cookies): secure cookie handling within Node.js route handlers.
- [Video.js 10](https://videojs.org/docs/framework/react/guides/skins): streaming-player interface, already integrated.

## Roles and privileges
| Role | Account creation | Browse/watch | Own watchlist and progress | Operator Studio | Manage account roles |
|---|---:|---:|---:|---:|---:|
| Viewer | Public self-registration | Yes | Yes | No | No |
| Admin | Promoted by super-admin | Yes | Yes | Yes (prototype-local CMS) | No |
| Super-admin | Explicit server bootstrap or super-admin promotion | Yes | Yes | Yes | Yes |

**No user can specify a role during signup.** `/admin` and `/admin/users` are checked on the server. Role-changing APIs verify the current session and require `superadmin`, with self-role changes rejected. The final active super-admin cannot remove their own super-admin status through the UI.

## Local setup (Windows PowerShell)

1. Install Node.js **22.16+** and `npm install`.
2. The server automatically creates `.local-data/bharatflix.sqlite` on first account operation (included in `.gitignore`). Data persists on a local disk or persistent Node host only.
3. Create your first super-admin once by setting ephemeral shell environment variables:

```powershell
$env:BHARATFLIX_BOOTSTRAP_EMAIL="owner@example.com"
$env:BHARATFLIX_BOOTSTRAP_PASSWORD="use-a-long-unique-password"
npm run bootstrap:superadmin
Remove-Item Env:\BHARATFLIX_BOOTSTRAP_PASSWORD
```

Then start `npm run dev`, visit `/account`, sign in, and open `/admin/users` to promote a registered colleague to `admin`. To store the DB on a mounted volume, set `BHARATFLIX_DATABASE_PATH` to a writable absolute filename.

## Storage and session properties
- Passwords: per-user random 16-byte salt + `crypto.scrypt`, never stored or logged in plaintext.
- Sessions: 32-byte random opaque token, SHA-256 digest stored server-side, 7-day expiry, `HttpOnly`, `SameSite=Lax`, Secure cookies in production.
- Stateful accounts, playlists/history, and role changes: local SQLite, always keyed by authenticated `user_id`.
- Auth mutation APIs require JSON, exact Origin matching, and `x-bharatflix-action: 1` to mitigate CSRF. Login locks for 15 minutes after five failed attempts, with a basic per-email request limit.
- No default admin credentials, secrets or SQLite database are checked in.

## Production TODO — do not deploy to anonymous public internet without review
This is intentionally built for a local client walkthrough or a single long-running Node server with a persistent volume; the built-in `node:sqlite` API on Node 22 is experimental. **Do not deploy SQLite onto ephemeral serverless file systems**, where users and sessions would be lost or corrupted across instances. Migrate to a managed DB and a mature identity provider/auth package, add email verification, password reset, MFA for staff, IP/edge abuse throttling, session rotation and revocation controls, comprehensive security monitoring, backups, and audited permissions. Public signup and role management should be disabled until security and compliance review.

## Integration note for CMS colleague
The current `/admin` editing interface still uses browser-local demo catalogue edits (`src/lib/demo-cms.ts`). The **authentication and role gate is real**, but this is **not yet a secure persistent, shared CMS**. Keep CMS API routes independently protected by an authenticated `admin` or `superadmin` check with action CSRF/origin verification, validate all data server-side, and never treat hiding frontend controls as authorization.
