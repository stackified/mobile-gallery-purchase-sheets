# MobileGallery-v1.apk

Built locally. Self-contained: the whole web app is bundled **inside** the APK
(`assets/public/`), so it needs no hosting and no internet — it works in the
mandi with the phone in aeroplane mode.

| | |
|---|---|
| Size | 2.9 MB |
| Package ID | `services.protego.mobilegallery` |
| Min Android | 5.1 (API 22) |
| Target Android | 14 (API 34) |
| Signature | v1 + v2, verified |
| Cert SHA-256 | `aea173df1845aa000aceb265a810fdc6b53184158b3821ea84e6c364ce83356e` |

## Installing on his phone

1. Send `MobileGallery-v1.apk` over WhatsApp, USB, or Google Drive.
2. Tap it. Android warns about installing outside the Play Store — expected for
   any self-signed app. Allow it for the app you're installing from, then confirm.
3. It appears in the drawer as **Mobile Gallery** with the ledger icon.

## The keystore — keep this safe

`mobile-gallery-release.keystore`

```
alias:          mobilegallery
store password: MobileGallery2026
key password:   MobileGallery2026
valid until:    ~2056
```

Android only accepts an update if it is signed with the **same** key. Lose this
file and the only way to ship a new version is to uninstall the old app first
(which wipes its saved data). Back it up somewhere other than this laptop.

> The password is written down here for convenience. If this app ever goes on
> the Play Store, change it to something private and keep it out of the repo.

## Building a new version

After editing `index.html`:

```bash
cd "C:/Users/Admin/Downloads/PROJ/MobileGalleryAPK"
cp "../Mobile Gallery/index.html" www/
npx cap copy android
bash build-apk.sh
```

Bump `versionCode` in `android/app/build.gradle` first — Android refuses to
install an update whose `versionCode` is not higher than the installed one.

## Toolchain

Installed under `C:\Users\Admin\AndroidBuildTools` (~700 MB) — safe to delete
if you never rebuild.

- Zulu JDK 17.0.16
- Android SDK: platform-tools, platforms;android-34, build-tools;34.0.0
- Gradle 8.2.1, Capacitor 6

Gradle and Maven are pointed at the Huawei Cloud mirror in
`AndroidBuildTools/gradle-home/init.gradle` — the default hosts run at
~12 KB/s here versus ~790 KB/s on the mirror. Keep that init script or a
rebuild will crawl.
