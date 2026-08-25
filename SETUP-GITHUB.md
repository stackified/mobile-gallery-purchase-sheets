# Auto-update over GitHub — ₹0 / month

You push. GitHub Actions publishes. Within a minute his phone shows
**"Update available"** with an **Update** button. He taps it, the new version
loads, and his clients, items and prices are untouched.

Free forever: GitHub Pages and Actions cost nothing on a public repo.
(Private repos get 2,000 Actions minutes/month free — this deploy uses about 20
seconds, so roughly 6,000 pushes a month either way.)

---

## One-time setup (~5 minutes)

### 1. Create the repo

On github.com → **New repository**
- Name: `mobile-gallery`
- **Public** (simplest; Pages on a private repo needs a paid plan)
- Do **not** add a README or .gitignore — this folder has what it needs

### 2. Push this folder

```bash
cd "C:/Users/Admin/Downloads/PROJ/Mobile Gallery"
git init
git add .
git commit -m "Mobile Gallery purchase sheet app"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/mobile-gallery.git
git push -u origin main
```

`.gitignore` already keeps the APK, the keystore and the old Excel files out.
**The keystore must never be pushed** — anyone with it can sign fake updates.

### 3. Turn on Pages

Repo → **Settings** → **Pages** → under **Source** pick **GitHub Actions**.
That's it — the workflow is already in `.github/workflows/deploy.yml`.

### 4. Watch the first deploy

Repo → **Actions** tab. The run takes ~20 seconds. When it goes green your app
is live at:

```
https://<YOUR-USERNAME>.github.io/mobile-gallery/
```

### 5. Put it on his phone

Open that URL in **Chrome on his phone** → **⋮** → **Add to Home screen** →
**Install**.

It gets the ledger icon, launches with no address bar, and works offline from
then on.

---

## From then on

```bash
# edit index.html, then:
git add index.html
git commit -m "bigger quantity column"
git push
```

Roughly 30 seconds later the phone (next time he opens the app, or within 30
minutes if it is already open) shows the banner. He taps **Update** and he is
on the new version.

**"Later"** dismisses it and stays quiet for that build — it will ask again on
the *next* release, never nag about the same one. This matters: he should never
have an update swap under him while he is filling a sheet at the mandi.

---

## How it works

The deploy stamps a build id — `20260825-1530-a1b2c3d` — into three places:

| File | Role |
|---|---|
| `index.html` | the running app knows which build it is |
| `sw.js` | the cache name changes, so the browser sees a genuinely new worker |
| `version.json` | generated fresh each deploy — the thing the app polls |

The app fetches `version.json` with `cache: no-store` on launch, whenever it
returns to the foreground, and every 30 minutes. Different id → banner.

Tapping **Update** clears the caches, unregisters the old service worker, and
reloads. It clears *caches*, never *storage* — his master data lives in
localStorage and is deliberately left alone.

Offline the check fails silently and the app opens from cache as normal.

---

## About the APK

The APK you already have carries its own copy of the app inside it, so it does
**not** auto-update — new versions need a fresh APK install.

If you would rather the APK auto-updated too, point it at the hosted URL:

```json
// MobileGalleryAPK/capacitor.config.json
{
  "appId": "services.protego.mobilegallery",
  "appName": "Mobile Gallery",
  "webDir": "www",
  "server": {
    "url": "https://<YOUR-USERNAME>.github.io/mobile-gallery/",
    "androidScheme": "https"
  }
}
```

then `npx cap sync android && bash build-apk.sh` and install once. After that
every push reaches it automatically, same banner and all.

**The trade-off:** that version needs internet on its *very first* launch to
fetch the app. After that the service worker has it cached and it is offline
again. The bundled APK you have now works offline from the very first second
but needs a manual reinstall to update.

### Which to give him

**The Add-to-Home-Screen route is the better one**, for two reasons: it
auto-updates, and printing goes through Chrome's print dialog rather than the
system WebView's — and Chrome's is the one that remembers the
"Headers and footers" setting. Since printing is the whole point of the app,
that matters more than having an icon that came from a file.

Keep the APK as the fallback for a phone where Add to Home Screen misbehaves.

---

## If something goes wrong

**Actions run failed** — open the run, read the red step. The stamp step fails
loudly on purpose if a placeholder was not replaced.

**Banner never appears** — check `https://<you>.github.io/mobile-gallery/version.json`
in a browser. If the build id there matches what the app reports, there is
genuinely nothing to update. Note the check is skipped entirely when the page
is opened from a `file://` path — it needs `http(s)`.

**Update seems to do nothing** — hard-reload once (Chrome ⋮ → reload). If the
service worker is wedged, Chrome → Settings → Site settings → find the site →
Clear & reset. Master data is in localStorage and survives a cache clear, but
export a backup first if you are unsure.

**404 at the Pages URL** — Settings → Pages → Source must be **GitHub Actions**,
not "Deploy from a branch".
