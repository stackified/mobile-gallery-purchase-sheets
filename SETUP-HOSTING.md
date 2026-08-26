# Hosting + auto-update — Cloudflare Pages

Private repo, ₹0/month, and the phone still gets **"Update available"** on every
push. This is the combination GitHub Pages cannot give you: its free plan
refuses to serve a private repo.

## Why Cloudflare and not Netlify

Both deploy from private GitHub repos for free. Cloudflare wins on the two
things that matter here:

- **Edge locations in India** — Mumbai, Delhi, Chennai, Bangalore, Hyderabad.
  Netlify's nearest is further away, so the app opens faster on a phone in Surat.
- **Unlimited bandwidth** on the free tier (Netlify caps at 100 GB/month).

Netlify's free tier would work fine too — this is a preference, not a
constraint.

---

## One-time setup (~4 minutes)

### 1. Create the Cloudflare account

<https://dash.cloudflare.com/sign-up> — free, no card.

### 2. Connect the repo

Dashboard → **Workers & Pages** → **Create**.

You will see two tabs: **Workers** and **Pages**. They both work, but they are
configured differently — pick one and follow the matching section below.

Authorise with the **`stackified`** GitHub account, since that is where the repo
lives. When GitHub asks which repositories, choose **Only select repositories**
and pick `mobile-gallery-purchase-sheets`. Cloudflare only needs read access.

---

### 3a. If you use the **Pages** tab  *(simpler — recommended)*

| Field | Value |
|---|---|
| Production branch | `main` |
| Framework preset | **None** |
| Build command | `bash build.sh` |
| Build output directory | `_site` |
| Root directory | *(blank)* |

No API token, no deploy command, nothing else. `wrangler.jsonc` is ignored.

---

### 3b. If you use the **Workers** tab

Cloudflare's newer default. The screen says *"Configure your Worker project"*
and asks for a **Deploy command** and an **API token**.

| Field | Value |
|---|---|
| Project name | `mobile-gallery-purchase-sheets` |
| Build command | `bash build.sh` |
| Deploy command | `npx wrangler deploy` |
| Path | `/` |
| API token | **Create new token** (accept the default permissions) |
| Variable name / value | *leave both blank* |

This path needs `wrangler.jsonc`, which is in the repo. It points Cloudflare at
`_site/` and serves it as a static-assets Worker — no server code.

**Without that file `npx wrangler deploy` fails**, which is the error you hit if
you tried this before pulling the latest commit.

The token it offers covers R2, D1, KV, Queues and more. A static site uses none
of them; it is just Cloudflare's standard Workers token. Harmless, but it is one
reason the Pages tab is the tidier choice.

### 4. Put it on his phone

Open that URL in **Chrome on his phone** → **⋮** → **Add to Home screen** →
**Install**.

Ledger icon, no address bar, works offline from then on.

---

## From then on

```bash
git add index.html
git commit -m "wider quantity column"
git push
```

Cloudflare builds in ~30 seconds. The app notices next time he opens it, or
within 30 minutes if already open, and offers **Update / Later**.

**Later** keeps quiet for that build and asks again on the *next* one — he
should never have the app change under him mid-sheet at the mandi.

---

## How the update actually lands

`build.sh` stamps one build id into three files:

| File | Purpose |
|---|---|
| `index.html` | `APP_BUILD` — the build the running app is |
| `sw.js` | cache name changes, so the browser sees a new worker |
| `version.json` | regenerated every deploy — what the app polls |

The app fetches `version.json` with `cache: no-store` on launch, on returning to
the foreground, and every 30 minutes. Different id → banner.

**`_headers` is what makes this reliable.** Cloudflare's edge would otherwise
cache `version.json` and the phone would keep reporting "up to date" for hours.
That file forces `no-store` on `version.json` and `sw.js`, revalidation on
`index.html`, and a one-year immutable cache on the icons.

The build script fails the deploy if a placeholder was not replaced, so a build
that could never self-update never goes live.

Tapping **Update** clears caches and reloads. It clears *caches*, never
*storage* — his clients, items and prices live in localStorage and are
deliberately untouched.

Offline, the check fails silently and the app opens from cache as normal.

---

## A custom domain, if you ever want one

Pages project → **Custom domains** → add e.g. `sheets.yourdomain.com`. Free,
and TLS is automatic. The `.pages.dev` URL keeps working either way.

---

## Note on the APK

The APK carries its own copy of the app, so it does **not** pick up these
updates — it needs a fresh install each time.

To make it auto-update too, point it at the hosted URL:

```json
// MobileGalleryAPK/capacitor.config.json
{
  "appId": "services.protego.mobilegallery",
  "appName": "Mobile Gallery",
  "webDir": "www",
  "server": {
    "url": "https://mobile-gallery-purchase-sheets.pages.dev/",
    "androidScheme": "https"
  }
}
```

then `npx cap sync android && bash build-apk.sh`, install once, and every push
reaches it from then on. The trade-off is that it needs internet on its very
first launch.

**Honestly, hand him the Add-to-Home-Screen version instead.** It auto-updates,
and printing goes through Chrome's print dialog rather than the system WebView's
— Chrome's is the one that remembers the "Headers and footers" setting. Printing
is the whole point of this app, so that matters more than the icon's origin.

---

## If something goes wrong

**Build failed** — open the deploy in Cloudflare and read the log. The stamp
guard prints exactly which file was not stamped.

**Banner never appears** — load `/version.json` in a browser and compare its
`build` to what the app reports. Same value means there genuinely is nothing to
update. The check is skipped entirely on a `file://` path; it needs `http(s)`.

**Update does nothing** — hard reload once. If the worker is wedged: Chrome →
Settings → Site settings → find the site → Clear & reset. Export a backup from
the app first if you are unsure.

**Old version still serving** — check `_headers` made it into `_site/`.
`build.sh` copies it; without it every cache rule above is inert.
