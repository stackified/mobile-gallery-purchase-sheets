# Mobile Gallery — Purchase Sheets

A one-file web app for a fruit-and-vegetable wholesaler in Surat. He collects
orders from schools and canteens over WhatsApp through the evening, fills them
in here, and prints **one A4 sheet** to carry to the mandi at dawn — quantities
already written, so the only pen work at the market is a correction.

Built to replace an Excel workbook that kept breaking across machines.

---

## What it does

**Purchase List** — pick the clients going on this trip, add items, type each
client's quantity into the grid. Row totals are what he actually buys. Sort by
item name or by total. Prints to a single page, always.

**Price List** — pick a customer, add items, rates auto-fill from Master. Type
over a rate to quote that customer differently; the master price is untouched.

**Master Data** — full CRUD on clients, items, units and prices. Client codes
are auto-suggested from the name (`Sunrise School` → `SS`) and checked for
collisions.

Everything is stored on the device. Nothing is sent anywhere. The **Backup**
button exports a small JSON file — the only recovery path if the phone is lost.

---

## Design notes

**Single file, no dependencies.** `index.html` is ~100 KB with zero external
requests — no CDN, no fonts, no analytics. It runs from a `file://` path, from
a web server, or bundled in the APK, and behaves the same in all three.

**Fonts** come from stacks that ship on Windows, Android and iOS
(`Iowan Old Style`/`Georgia` for display, `Corbel`/`Gill Sans`/`Noto Sans` for
UI) so nothing needs downloading.

**Print is the product.** The sheet is measured and scaled so it always lands on
exactly one A4 page. It lays out *wider* than the page and zooms back down —
laying out at page width and zooming would shrink the width too and leave half
the paper blank. Because a wider layout also wraps less, height changes with
scale, so the fit is solved iteratively.

Both a single-column and a two-column split are built and measured; whichever
gives **larger text** is the one that prints. Portrait usually wins — 31 rows
need vertical room more than they need width.

**Type scale follows what he reads at 5am**: quantities and totals 15pt bold,
item names 12.5pt, client codes 13pt — and deliberately small for client full
names, units and serial numbers.

---

## Layout

```
index.html               the entire app
manifest.webmanifest     installable-app metadata
sw.js                    offline cache + update probe
version.json             build id, regenerated on every deploy
icons/                   launcher icons (192/512/maskable/apple/favicon)
build.sh                 stamps the build id, run by Cloudflare on each push
_headers                 CDN cache rules the update flow depends on

MobileGallery-v1.apk     signed Android build, app bundled inside
mobile-gallery-release.keystore   signing key — see warning below

SETUP-HOSTING.md          hosting + auto-update setup
BUILD-APK.md             cloud APK build (PWABuilder)
APK-NOTES.md             local APK build, install steps, keystore details
archive/excel/           the original Excel workbook, 14 iterations
```

---

## Running it

Open `index.html` in any browser. That is genuinely all.

For the phone, host it (see `SETUP-HOSTING.md`) and use
**Chrome → ⋮ → Add to Home screen**. It launches with no address bar and
works offline.

---

## Updating

Push to `main` → Cloudflare Pages builds and stamps a new build id → the app
notices within 30 minutes (or on next open) and offers **Update / Later**.
Tapping Update clears caches and reloads; master data is in localStorage and is
deliberately left alone.

Hosted on **Cloudflare Pages**, which serves private repos free — GitHub Pages
does not. Setup is in `SETUP-HOSTING.md`.

---

## Two warnings

**The keystore is in this repo.** `mobile-gallery-release.keystore` is the only
copy, and Android will refuse any update not signed with it — lose it and the
only way to ship a new version is to uninstall first, wiping his saved clients
and prices. That is why it is committed here rather than left on one laptop.

The consequence: **this repo must stay private.** If it is ever made public,
generate a new key and ship a fresh install. The store password is in
`APK-NOTES.md` for the same reason and with the same caveat.

**The APK does not auto-update.** It carries its own copy of the app inside it,
so new versions need a fresh install. `SETUP-HOSTING.md` has a three-line config
change to point it at the hosted URL instead, which makes it auto-update at the
cost of needing internet on first launch.

---

## Browser support

Chrome, Edge, Firefox, Safari — desktop and mobile. Android 5.1+ via the APK.
Print output verified in Chrome and OpenOffice.
