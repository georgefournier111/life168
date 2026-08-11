/* Copyright 2026 George M Fournier, MBA v8.1.26 */
/* Service worker: caches the app so it opens and works with no connection. */
var CACHE = "wlll168-v48";
/* The host serves clean URLs: /privacy and /support (the .html versions
   308-redirect here). Precache the clean paths so navigations never hit a
   redirect through the service worker. */
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./header-hero.jpg",
  "./butterfly.png",
  "./privacy",
  "./support"
];

/* Cache each file on its own. If one file is missing the install still
   succeeds, so the app is never left without a service worker. */
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(ASSETS.map(function (url) {
        return c.add(url)["catch"](function () { return null; });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Serve from cache first, fall back to the network, and keep a copy. */
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        /* A browser rejects a redirected response handed back from a service
           worker for a page navigation ("this site can't be reached"). If the
           network followed a redirect, rebuild a plain, non-redirected copy. */
        if (res && res.redirected) {
          return res.blob().then(function (body) {
            return new Response(body, {
              status: res.status, statusText: res.statusText, headers: res.headers
            });
          });
        }
        if (res && res.status === 200 && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      })["catch"](function () {
        return caches.match("./index.html");
      });
    })
  );
});
