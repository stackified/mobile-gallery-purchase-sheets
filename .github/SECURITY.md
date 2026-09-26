# Security Policy

## Supported versions

This is an offline-first business tool built for Mobile Gallery. Only the latest version on the
`main` branch (what Cloudflare Pages serves) and the latest signed APK are maintained.

| Version | Supported |
|---------|:---------:|
| Latest (`main`) | Yes |
| Older commits and older APKs | No |

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Instead, use GitHub's private reporting:

1. Go to the [Security tab](https://github.com/stackified/mobile-gallery-purchase-sheets/security).
2. Click **Report a vulnerability**.
3. Describe the issue, steps to reproduce, and potential impact.

You can expect an acknowledgement within a few days. Thank you for helping keep the project safe.

## Notes on this project

The app is a single static HTML file with inline JavaScript, served from Cloudflare Pages and
also packaged as an Android APK. There is no backend, no database, no user accounts, no payments
and no third-party scripts or APIs. The only network request the app makes is a same-origin fetch
of `version.json` to check for updates.

All business data (clients, items, units and prices) is stored in the browser's `localStorage`
on the device and never leaves it, except through the **Backup** export, which saves a JSON file
chosen by the user. The main input surface is therefore what the user types and backup files
they import. Reports about script injection through entered or imported data, or anything that
could corrupt or leak the locally stored data, are the most useful.

`_headers` applies a strict Content-Security-Policy (`default-src 'self'`, no external
connections), `X-Frame-Options`, `nosniff` and a `no-referrer` policy on the hosted site.
The JavaScript, including the scripts inside `index.html`, is scanned by CodeQL on every push
and pull request to `main`.
