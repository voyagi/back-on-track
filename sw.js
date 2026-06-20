/*
 * sw.js — service worker for offline use.
 *
 * Cache-first for the app shell so the toolkit opens with no signal (key for the
 * "use it wherever and whenever" requirement and for people with patchy data).
 * Bump CACHE when you change any cached file so users get the update.
 */
var CACHE = "bot-v9";
var ASSETS = [
  ".",
  "index.html",
  "styles.css",
  "app.js",
  "content.js",
  "exercise-anim.js",
  "manifest.webmanifest",
  "icon.svg",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png",
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) {
          if (k !== CACHE) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).catch(function () {
        // Offline navigation falls back to the app shell (hash routing does the rest).
        if (req.mode === "navigate") return caches.match("index.html");
      });
    })
  );
});
