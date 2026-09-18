/* Copyright 2026 George M Fournier, MBA v8.1.26 */
/* Service worker: caches the app so it opens and works with no connection,
   and delivers the 30/60/90 day reminders even when the app is closed. */
var CACHE = "wlll168-v61";
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
  "./hero-1.jpg",
  "./hero-2.jpg",
  "./hero-3.jpg",
  "./hero-4.jpg",
  "./hero-5.jpg",
  "./hero-6.jpg",
  "./hero-7.jpg",
  "./hero-8.jpg",
  "./hero-9.jpg",
  "./hero-10.jpg",
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

/* ---------------------------------------------------------------------------
   Reminders while the app is closed.

   A service worker cannot read localStorage, so the page mirrors the three
   milestone dates into IndexedDB (db "life168", store "reminders", record
   "schedule"). Periodic Background Sync wakes this worker roughly once a day,
   it compares those dates against today, and shows any that have come due.

   Chrome on Android only, and only for an installed app. Everywhere else this
   code simply never runs and the calendar file stays the reliable path.
--------------------------------------------------------------------------- */
var IDB_NAME = "life168";
var IDB_STORE = "reminders";
var SCHEDULE_KEY = "schedule";
var SYNC_TAG = "life168-milestones";

function idbOpen() {
  return new Promise(function (resolve, reject) {
    var req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = function () {
      var db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

function idbRead() {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(IDB_STORE, "readonly");
      var r = tx.objectStore(IDB_STORE).get(SCHEDULE_KEY);
      r.onsuccess = function () { resolve(r.result || null); };
      r.onerror = function () { reject(r.error); };
    });
  });
}

function idbWrite(value) {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(value, SCHEDULE_KEY);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error); };
    });
  });
}

function pad2(n) { return String(n).padStart(2, "0"); }
function todayIso() {
  var d = new Date();
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

function noteBody(days) {
  return days === 90
    ? "Time for your 90 day review. Open Life 168 and compare your maps."
    : "Your " + days + " day check in is due. Open Life 168 and review your plan.";
}

/* Show any milestone that is due and has not been shown yet. */
function runDueReminders() {
  return idbRead().then(function (sched) {
    if (!sched || !sched.optIn || !sched.dates) return;
    var today = todayIso();
    var fired = sched.fired || {};
    var shown = [];
    var pending = Object.keys(sched.dates).filter(function (days) {
      return !fired[days] && sched.dates[days] && sched.dates[days] <= today;
    });
    if (!pending.length) return;
    return Promise.all(pending.map(function (days) {
      shown.push(days);
      return self.registration.showNotification("Life 168", {
        body: noteBody(Number(days)),
        icon: "icon-192.png",
        badge: "icon-192.png",
        tag: "life168-" + days,
        data: { days: Number(days), url: "./#part6" }
      });
    })).then(function () {
      shown.forEach(function (days) { fired[days] = true; });
      sched.fired = fired;
      return idbWrite(sched);
    });
  })["catch"](function () { /* nothing we can do from a background wake up */ });
}

self.addEventListener("periodicsync", function (e) {
  if (e.tag !== SYNC_TAG) return;
  e.waitUntil(runDueReminders());
});

/* A one-off sync is a useful backstop: some browsers fire this on reconnect
   even when they will not schedule periodic work. */
self.addEventListener("sync", function (e) {
  if (e.tag !== SYNC_TAG) return;
  e.waitUntil(runDueReminders());
});

/* Tapping a reminder should land on the action plan, reusing an open tab. */
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var target = (e.notification.data && e.notification.data.url) || "./#part6";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url.indexOf(self.registration.scope) === 0) {
          if ("navigate" in c) { return c.navigate(target).then(function (w) { return w && w.focus(); }); }
          return c.focus();
        }
      }
      return self.clients.openWindow(target);
    })["catch"](function () { return self.clients.openWindow(target); })
  );
});
