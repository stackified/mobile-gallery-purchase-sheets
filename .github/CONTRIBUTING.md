# Contributing to Mobile Gallery Purchase Sheets

This is a client project: the code is owned by Mobile Gallery and is designed, built and
maintained by the [Stackified](https://github.com/stackified) team. The app is in daily use by
the client, so outside pull requests are not part of the normal workflow. Bug reports through
[issues](https://github.com/stackified/mobile-gallery-purchase-sheets/issues) are welcome, and
security problems should be reported privately (see [SECURITY.md](SECURITY.md)).

The notes below are for Stackified team members working on the app.

## Getting set up

The app is a single `index.html` file with inline CSS and JavaScript, no dependencies and no
package manager. There is nothing to install.

1. Clone the repository:
   ```bash
   git clone https://github.com/stackified/mobile-gallery-purchase-sheets.git
   cd mobile-gallery-purchase-sheets
   ```
2. Open `index.html` in a browser. It runs from a `file://` path as-is.
3. To test the service worker, offline mode and the update banner, build and serve over HTTP:
   ```bash
   bash build.sh
   python -m http.server 8000 --directory _site
   ```
   Then open `http://localhost:8000/`. `build.sh` copies the app into `_site/` and stamps a build
   id into `index.html`, `sw.js` and `version.json`. The update check is skipped on `file://`.

## Project structure

- `index.html` - the entire app: Purchase List, Price List and Master Data screens, print
  layout, local storage, backup/restore
- `sw.js` - service worker: offline cache and the network-only `version.json` update probe
- `manifest.webmanifest`, `icons/` - installable PWA metadata and launcher icons
- `version.json` - placeholder; regenerated with the real build id on every deploy
- `build.sh` - Cloudflare Pages build script (stamps the build id, fails if stamping fails)
- `_headers` - Cloudflare cache rules and security headers the update flow depends on
- `wrangler.jsonc` - Cloudflare Pages project config (`pages_build_output_dir: ./_site`)
- `MobileGallery-v*.apk` - signed Android builds (`v4` is the latest)
- `SETUP-HOSTING.md`, `BUILD-APK.md`, `APK-NOTES.md` - hosting, cloud APK build and local APK
  build notes
- `archive/excel/` - the superseded Excel workbook iterations, kept for reference only

## Branches and deployment

- `main` is the only long-lived branch. There is no GitHub Actions deploy workflow: Cloudflare
  Pages is connected to the repository and runs `bash build.sh` on every push to `main`, then
  serves `_site/` at https://mobile-gallery-purchase-sheets.pages.dev/.
- Installed copies (browser and the hosted-URL APKs) poll `version.json` and offer
  **Update / Later** when a new build is live. See [SETUP-HOSTING.md](../SETUP-HOSTING.md).
- The Android wrapper project (Capacitor) is not in this repository. Rebuilding an APK is covered
  in [APK-NOTES.md](../APK-NOTES.md) and [BUILD-APK.md](../BUILD-APK.md); remember to bump
  `versionCode` and to sign with the existing release key, or installed copies cannot update.

Because a push to `main` reaches the client's phone, do all work on a feature branch.

## Making changes

1. Create a branch from `main`: `git checkout -b fix/short-description`
2. Keep changes focused. One feature or fix per pull request.
3. Keep the single-file design: no external requests, CDNs, web fonts or analytics. The CSP in
   `_headers` blocks them, and the app must keep working from a `file://` path and offline.
4. Do not change the structure of the data saved in `localStorage` or of the backup JSON without
   a migration path. The client's master data lives only on the device and in their backups.
5. Check the printed sheet: it must still fit on exactly one A4 page.
6. Never commit real client, customer or price data (for example in test backups or
   screenshots). Use made-up names.

## Pull requests

1. Push your branch and open a pull request against `main`.
2. Fill in the pull request template: what changed, why, and how you tested it.
3. Link any related issue (for example, `Closes #12`).
4. CodeQL runs on every pull request to `main`; resolve any new alerts before merging.

For security issues, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.
