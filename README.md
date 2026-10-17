# College

A personal, offline-capable web version of the iPhone College app with a cream, olive and terracotta theme. No account, paid AI service, API subscription, or analytics. Timetable reading uses an optional bundled OCR library.

The web interface follows the native Home, Spend, Income, History and Study tabs. Timetable, notices and the assistant open from the same quick access links. The browser cannot run the iPhone app’s background notice refresh; current notices open on the official college website.

## Included

- Spending and income entries, searchable history, and one-step undo.
- Calendar-week totals, net gain/loss, weekly budget, category totals.
- User-created subjects and chapters with saved completion and search.
- Personal timetable imported from the iPhone app.
- Direct answers from your records.
- JSON backup/export, validated import preview, duplicate-safe merge, and before-import restore.
- iPhone Home Screen manifest and offline service worker.

The repository contains only generic app code and app assets. Your financial records, personal timetable and backups must **never** be committed here. Records stay in IndexedDB on each device. There is no cross-device sync. Clearing site data, losing the device, changing the website origin or deleting the Home Screen app may make local records inaccessible. Keep exported backups in Files or another location you trust.

## GitHub Pages

1. Create a public repository (for GitHub Free) and put these files in its root, keeping their folders intact. Use `main` as the default branch.
2. Open repository **Settings → Pages**.
3. Select **Deploy from a branch → main → /(root)** and Save. Alternatively select GitHub Actions and use the included workflow.
4. Open the HTTPS Pages URL shown by GitHub, usually `https://USERNAME.github.io/REPOSITORY/`.
5. Keep the same URL once you start entering records: browser storage is tied to its origin and app path.

The app uses relative paths, so a repository subpath works without build configuration. A custom domain is optional. Nothing here requires paid hosting. Do not put passwords, API keys, personal records, or exported backup files in the repository.

## iPhone setup and migration

1. **Keep the existing iPhone app installed.** The web app cannot automatically read another app's private data.
2. In the updated iPhone College app, tap the export icon on Home, then **Export records to Files**.
3. Open the published web app in Safari, choose **Share → Add to Home Screen**, and enable **Open as Web App** if shown.
4. Open College from the Home Screen. Tap the backup icon → **Choose backup file**, select the saved JSON, review the counts, and choose **Merge records**.
5. Check your balance, chapter count, and timetable. Keep a copy of the export.

Import in the installed Home Screen version rather than a separate browser tab; their storage can differ. New web entries do not update the native app, and native edits do not automatically update the web app.

Imports keep existing entries, skip matching entry IDs, combine completed chapter states, merge timetable periods by day/time/title, and replace the weekly budget and week-start setting. Your before-import web state can be restored from Backup & settings. The timetable is intentionally empty on a fresh install: your personal schedule comes from your export or your own entries.

## Offline and notices

Open the site online once and let offline setup complete. The app shell is cached; changes to your records are saved locally. The official college notice board requires internet and opens externally. This static app cannot poll the college website while closed or send unattended new-notice alerts. Imported notices are snapshots.

When changing files, bump the version in `sw.js`. A new service worker downloads a complete new shell before activating. Old app caches for this app path are then removed; IndexedDB records are not touched.

## Local preview

Serve this folder using any local HTTP server, for example `python3 -m http.server 4173`. Open `http://localhost:4173`. Opening `index.html` directly with `file://` does not provide service workers or dependable module loading. A localhost preview is not the published iPhone URL.

## Optional customisation and empty first run

New installations start with no subjects, chapters, timetable, notices or financial entries. There is no built-in syllabus or Class 12 template. Users add their own subjects/chapters, enter or photograph their timetable, or explicitly import their own College backup.

Existing saved records are loaded without reset. Backup & settings → Study & timetable tools offers Keep current setup or Enable customisation. Neither option deletes saved records. Accounts and cloud sync are not enabled.

Timetable OCR runs on-device using bundled Tesseract.js 7.0.0, with no paid API or uploaded images. The reader downloads on first use and is cached as used. Printed English lists and standard grid orientations are supported; review/correction is required before saving. Add skips exact duplicates; replace covers the whole week and can be undone immediately.

## Timetable reader v2

Version 12 adds local adaptive image cleanup, modest-angle straightening, two full-image OCR passes, detected-grid/cell reading, stacked time headers, merged practical periods, stricter day recognition, and flagged noon/AM-PM handling. Crop margins, layout override, and cleanup controls are available before reading. Missing times remain blank for review rather than being fabricated. Reading still requires explicit review and retains duplicate/overlap validation. Tests include merged periods and angled/shadowed synthetic captures; unusual layouts and handwriting can still require corrections.


## Accounts (version 14)
Real Supabase email/password sign-in, signup, confirmation and password recovery.
Existing device records stay in their original IndexedDB state key; account records use account UUID namespaces. New accounts start empty. Settings offers explicit confirmed merging of guest records into an account. No automatic migration or upload.
Account writes require an internet connection and use a revision compare-and-swap to prevent overwriting another device's newer data. Offline cached account data is view-only. Use Load latest records after editing elsewhere. Guest mode remains offline and device-only. Sign out removes the local authentication session, not database records. Export backups remain available.
Database schema: ../college-account-setup/setup.sql (run once). The project publishable key is public; no service role or secret key belongs in this app.
Validation: actual unauthenticated read rejected, public email-auth settings checked, mocked two-user/save/conflict/offline tests and browser guest persistence checked. A real user's sign-in/verification/cloud write still requires end-to-end confirmation.


## Attendance (version 18)
Timetable records dated lecture/practical attendance: attended, absent, cancelled or unmarked. Overall and subject percentages count attended / (attended + absent); breaks and cancelled classes are excluded. Home shows a persistent, non-blocking reminder for today's unmarked lectures. At local midnight, unmarked lectures become absent when the app is open or next reopened. No background server task or push notification is involved. Tracking starts when this version is first opened; previous lectures are not retrospectively penalised.
Dated lecture snapshots retain history after recurring timetable edits. On reopening after a gap, intervening dates use the saved recurring timetable. Correct cancelled or changed lectures using the date picker. Automatic absences remain editable. Account data, device-only storage and backup imports/exports preserve attendance. Existing backups without attendance remain compatible.
Validated: date rollover, first-use boundary, break exclusion, percentages, cancellation, snapshots, duplicate imports, backup roundtrip, legacy backups, browser marking/persistence and reminder disappearance.
