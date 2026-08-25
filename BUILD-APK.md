# Making the Android APK

The folder is already a complete, installable web app. Two steps: put it online,
then let PWABuilder compile the APK in the cloud. No Android Studio, no JDK,
nothing to install on your machine.

---

## Step 1 — Put the folder online (once, ~2 minutes)

The files must be served over **https://** — Android refuses to wrap a
`file://` page, and service workers only run over https.

1. Go to **https://app.netlify.com/drop**
2. Drag the whole **Mobile Gallery** folder onto the page
   (the folder, not just `index.html` — it needs `manifest.webmanifest`,
   `sw.js` and `icons/`)
3. You get a URL like `https://tiny-name-1234.netlify.app`
4. Open it on your phone and confirm the app loads

Free, no account needed for the first deploy. Sign in later if you want a
nicer subdomain or to re-deploy over the same URL.

> Any static host works — GitHub Pages, Cloudflare Pages, Vercel, Firebase
> Hosting. Netlify Drop is just the fastest with no signup.

---

## Step 2 — Generate the APK

1. Go to **https://www.pwabuilder.com**
2. Paste your Netlify URL, press **Start**
3. It scores the app — the manifest, icons and service worker are already in
   place, so it should pass
4. Choose **Android** → **Generate Package**
5. Options that matter:
   - **Package ID** — something like `services.protego.mobilegallery`
     (reverse-domain, permanent, cannot change after install)
   - **App name** — `Mobile Gallery`
   - **Signing key** — pick **"Create new"**. It gives you a
     `signing.keystore` file plus a password.
     **Save both somewhere safe** — without them you can never ship an
     update to the same app.
6. Download the zip. Inside:
   - `app-release-signed.apk` → this is what you install on the phone
   - `app-release-bundle.aab` → only needed for the Play Store
   - the keystore and its passwords

---

## Step 3 — Install on his phone

1. Send `app-release-signed.apk` over WhatsApp / USB / Google Drive
2. Tap it. Android will say *"unsafe app"* or *"install unknown apps"* —
   that is normal for anything not from the Play Store. Allow it for the app
   you're installing from (Files or WhatsApp), then confirm.
3. The app appears in the drawer with the ledger icon and runs with no
   address bar.

---

## Updating later

The APK is a **thin wrapper around the hosted site** (a Trusted Web Activity).
That means:

- **Change the app** → re-deploy to Netlify → **the phone picks it up on next
  open.** No new APK, nothing to reinstall.
- You only rebuild the APK if the name, icon or package ID changes.

When you re-deploy, bump `CACHE` in `sw.js` (e.g. `v5` → `v6`) so the phone
fetches the new build instead of the cached one.

---

## Removing the browser address bar without an APK

If the APK turns out to be more trouble than it's worth, this gets you 90% of
the way in 10 seconds:

1. Open the Netlify URL in Chrome on his phone
2. **⋮ menu → Add to Home screen → Install**

Because the manifest declares `display: standalone`, it launches with no
address bar, its own icon, and its own entry in the app switcher. It is
genuinely hard to tell from the APK.

---

## Which should you pick?

| | Add to Home Screen | APK |
|---|---|---|
| Setup effort | 10 seconds | ~15 minutes |
| Looks like an app | yes | yes |
| Works offline | yes | yes |
| Updates | automatic | automatic (hosted content) |
| Printing | Chrome's print dialog | Android WebView print dialog |
| Install warnings | none | "unknown app" warning |
| Can be shared as a file | no | yes |

**Printing is the deciding factor.** Chrome's print dialog is the better one —
it remembers the "Headers and footers" setting, has clearer paper/orientation
controls, and handles printer discovery better. Inside an APK you get the
system WebView print dialog, which is more basic.

Since printing is the whole point of this app, **Add to Home Screen is the
better choice** for daily use. Build the APK if you specifically want to hand
someone an installable file, or eventually put it on the Play Store.
