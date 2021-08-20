/** @format */

const SW_VERSION = "2021-05-22";
const CACHE_NAME = "offline";
const OFFLINE_URL = "./offline.html";
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js"
);

workbox.setConfig({});
workbox.core.setCacheNameDetails({ prefix: "acoustic" });
workbox.routing.registerRoute(
  new RegExp("https://acoustic.to/index.html"),
  workbox.strategies.cacheFirst({
    cacheName: "acoustic-html",
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 24 * 60 * 60 * 28,
        purgeOnQuotaError: !0,
      }),
    ],
  })
);
workbox.routing.registerRoute(
  new RegExp("https://acoustic.to/.*.css"),
  workbox.strategies.cacheFirst({
    cacheName: "acoustic-css",
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 24 * 60 * 60 * 28,
        purgeOnQuotaError: !0,
      }),
    ],
  })
);
workbox.routing.registerRoute(
  new RegExp("https://acoustic.to/assets/*"),
  workbox.strategies.cacheFirst({
    cacheName: "acoustic-assets",
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 24 * 60 * 60 * 28,
        purgeOnQuotaError: !0,
      }),
    ],
  })
);
workbox.routing.registerRoute(
  new RegExp("https://acoustic.to/assets/manifest.json"),
  workbox.strategies.cacheFirst({
    cacheName: "acoustic-manifest",
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 24 * 60 * 60 * 28,
        purgeOnQuotaError: !0,
      }),
    ],
  })
);
workbox.routing.registerRoute(
  new RegExp(
    "https://acoustic.to/cdn-cgi/scripts/*/cloudflare-static/rocket-loader.min.js"
  ),
  workbox.strategies.cacheFirst({
    cacheName: "acoustic-rocket-loader",
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 24 * 60 * 60 * 28,
        purgeOnQuotaError: !0,
      }),
    ],
  })
);
self.addEventListener("install", function (event) {
  console.log("[ServiceWorker] Install");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
    })()
  );
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate");
  event.waitUntil(
    (async () => {
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
  self.clients.claim();
});
self.addEventListener("fetch", function (event) {
  console.log("[Service Worker] Fetch", event.request.url);
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          console.log(
            "[Service Worker] Fetch failed; returning offline page instead.",
            error
          );
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  }
});
workbox.precaching.precacheAndRoute([]);
workbox.skipWaiting();
workbox.clientsClaim();
