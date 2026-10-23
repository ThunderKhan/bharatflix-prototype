# BharatFlix Operator Studio — Client Demonstration

## Purpose
The Operator Studio shows the scope of a production OTT CMS, using an intentionally transparent browser-local model. It is available at `/admin` to authenticated admins and super-admins. `/admin/users` remains reserved for super-admins.

## Recommended 5-minute live demo
1. **Overview:** show actual catalogue title counts, published/draft distribution, homepage shelf count, and catalogue completeness. None of these are fabricated audience metrics.
2. **Content library:** search for a title, edit its synopsis, publish/unpublish, select multiple rows for a batch action, and export the filtered list to CSV.
3. **Homepage curation:** reorder a featured film or disable a rail (such as Animation & Family). Open the homepage in another tab in the **same browser** to show the immediate change.
4. **Release planner:** assign a date and campaign note to an existing title. Show it in the release queue. This is a planning record, not an automated publication job.
5. **Media operations:** distinguish actual source-linked film MP4s from sample footage. Create a poster/video/subtitle intake checklist and mark it reviewed. No files are uploaded.
6. **Rights checklist:** review attribution/source links for open films and put a fictional title on rights hold. A held title cannot be newly published from CMS edit or bulk publish.
7. **Catalogue insights:** display real language and genre distribution; explain future player analytics and revenue metrics require instrumented backend events.

## What works now
- Real viewer/admin/super-admin authentication and server-gated access to `/admin`.
- Local-browser CMS catalogue edit/create/publish operations, batch actions and CSV export.
- Local-browser editorial hero ordering and home shelf visibility, reflected in the corresponding storefront in the same browser.
- Browser-persisted release plans, asset intake checklists, internal rights review and activity log.
- A responsive operator UI and accessible controls/labels.

## Not yet connected
- Shared multi-editor CMS database and audit-log persistence.
- Real asset ingestion, transcoding, DRM, and subtitle packaging.
- Rights/license verification or contractual entitlement management.
- Automatic timed publication and multi-tenant approvals.
- Actual viewership, subscriber, retention, and revenue analytics.

**Security scope:** `/admin` access is protected by the server session and role check. The demonstration CMS records themselves are kept in localStorage, not a secure shared server database. Avoid storing actual unreleased assets or sensitive rights/contracts in browser storage. Do not present the simulated workflows as production services.
