#!/usr/bin/env bash
# Build for Cloudflare Pages.
#
# Cloudflare runs this on every push, then serves whatever lands in _site/.
# The job is to stamp one build id into three places so the running app can
# tell that a newer version exists:
#
#   index.html    -> APP_BUILD, the build the app itself is
#   sw.js         -> cache name, so the browser sees a genuinely new worker
#   version.json  -> what the app polls to compare against
set -euo pipefail

OUT=_site

# CF_PAGES_COMMIT_SHA is set by Cloudflare; fall back to git, then to a stamp,
# so the script also works when run by hand.
SHA="${CF_PAGES_COMMIT_SHA:-$(git rev-parse HEAD 2>/dev/null || echo nogit)}"
BUILD="$(date -u +%Y%m%d-%H%M)-${SHA:0:7}"

echo "Build id: $BUILD"

rm -rf "$OUT"
mkdir -p "$OUT"
cp -r index.html manifest.webmanifest sw.js icons _headers "$OUT"/

# stamp
sed -i "s/__BUILD_ID__/$BUILD/g" "$OUT/index.html" "$OUT/sw.js"

printf '{"build":"%s","deployed":"%s","commit":"%s"}\n' \
  "$BUILD" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$SHA" > "$OUT/version.json"

# fail loudly rather than shipping a build that can never self-update
for f in index.html sw.js; do
  if grep -q "__BUILD_ID__" "$OUT/$f"; then
    echo "ERROR: $f still contains the placeholder — stamping failed." >&2
    exit 1
  fi
done

echo "--- $OUT ---"
ls -la "$OUT"
echo "--- version.json ---"
cat "$OUT/version.json"
