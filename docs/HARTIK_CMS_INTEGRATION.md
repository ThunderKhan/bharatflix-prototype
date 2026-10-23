# Hartik CMS integration: persistent catalogue editor

Original author: [@hardik0924](https://github.com/hardik0924), [PR #14](https://github.com/ThunderKhan/bharatflix-prototype/pull/14).
Integrated selectively into `main` with the existing Operator Studio preserved.

## Where to go

- `/admin` — current seven-workspace client demo, including overview, browser-local publishing, curation, media operations, releases, rights and insights.
- `/admin/titles` — Hartik's **SQLite-persistent** catalogue staging/editor: create, edit, publish, unpublish, delete and search titles.
- `/admin/titles/[id]` — genres, artwork, seasons/episodes and stream sources.
- `/admin/rows` — database-persistent row configuration.
- `/admin/settings` — database-persistent site settings (not yet applied to storefront).
- `/admin/audit` — staff-attributed database change log.
- `/admin/users` — existing, independent super-admin account/role management.

### Conflicts and safety decisions

- The preexisting `/admin` Operator Studio and `/admin/users` were **not replaced**. It is still the presentation-ready dashboard.
- All new persistent CMS routes and server actions use the existing server-enforced viewer/admin/superadmin roles. **No second operator login or default admin123 credential.**
- This module uses a separate ignored file, `.local-data/bharatflix-cms.sqlite`. Account sessions remain in `.local-data/bharatflix.sqlite`. Persistent storage must be backed up.
- SQLite table structure, normalized genres/collections, editor components and audit actions were adapted from Hartik's contribution, preserving attribution.
- Existing licensed remote poster URLs (Wikimedia, Unsplash, YouTube thumbnails) remain permitted in the editor.

### Important remaining work

**Staging vs storefront:** The persistent editor presently saves to SQLite, but the public OTT storefront still reads the existing fixture/browser-local demo catalogue. Don't present SQLite title publishing or row changes as already live for viewers; syncing the two data paths needs a deliberate tested rollout. The same is true of settings.

The persistent studio does not implement real video uploads or CDN transcoding. Its stream rows are metadata.
The imported schema retains an unused legacy studio `users` table, but does not create a default account; BharatFlix authentication lives in the existing account database.

### Local commands

```powershell
npm install
npm run db:status
npm run db:inspect
npm run dev
```

`npm run db:seed` refreshes from JSON. `npm run db:reset` **DELETES** the local catalogue database and all editorial changes; take a backup first.

Production deployment needs a persistent writable disk, secure backups, controlled stream URL allowlists, and a plan for CMS-to-storefront migration.
