/* Mobile Gallery — offline service worker.

   Strategy, chosen so the app is usable in the mandi with no signal but still
   picks up a new build within a minute of a push:

     version.json  → network only, never cached. This is the update probe.
     index.html    → network-first, fall back to cache. A reload after tapping
                     "Update" therefore fetches the new build; offline it still
                     opens instantly from cache.
     icons, etc.   → cache-first. They rarely change and are tiny.

   BUILD is stamped by CI on every deploy, so the byte content of this file
   changes each release and the browser reliably notices a new worker. */
const BUILD = "__BUILD_ID__";
const CACHE = "mobile-gallery-" + BUILD;

const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-180.png",
  "./icons/favicon-64.png",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      // add individually: addAll is atomic, so one 404 would cache nothing
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
  );
  /* No skipWaiting here on purpose — the page decides when to switch, so a
     new build can never swap under him while he is filling a sheet. */
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => {
  if(e.data === "SKIP_WAITING" || e.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;

  const url = new URL(req.url);
  if(url.origin !== location.origin) return;          // never touch cross-origin

  // the update probe must always hit the network
  if(url.pathname.endsWith("/version.json")){
    e.respondWith(fetch(req, { cache:"no-store" }).catch(() =>
      new Response('{"build":null}', { headers:{ "Content-Type":"application/json" } })));
    return;
  }

  // navigations and the app shell: network-first so an update actually lands
  const isShell = req.mode === "navigate" || url.pathname.endsWith("/index.html");
  if(isShell){
    e.respondWith(
      fetch(req)
        .then(res => {
          if(res && res.ok){
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put("./index.html", copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html").then(hit => hit || Response.error()))
    );
    return;
  }

  // everything else: cache-first
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if(res && res.ok && res.type === "basic"){
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
