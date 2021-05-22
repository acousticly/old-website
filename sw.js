/** @format */
const SW_VERSION = '2021-05-22';
const CACHE_NAME = 'offline';
const OFFLINE_URL = './offline.html';
importScripts(
	'https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js'
);

workbox.setConfig({});

workbox.core.setCacheNameDetails({
	prefix: 'acoustic',
});

workbox.routing.registerRoute(
	// match only with assets on the assets domain
	new RegExp('https://acoustic.to/index.html'),
	workbox.strategies.cacheFirst({
		cacheName: 'acoustic-html',
		plugins: [
			new workbox.expiration.Plugin({
				// 28 days cache before expiration
				maxAgeSeconds: 24 * 60 * 60 * 28,
				purgeOnQuotaError: true,
			}),
		],
	})
);

workbox.routing.registerRoute(
	// match only with assets on the assets domain
	new RegExp('https://acoustic.to/.*.css'),
	workbox.strategies.cacheFirst({
		cacheName: 'acoustic-css',
		plugins: [
			new workbox.expiration.Plugin({
				// 28 days cache before expiration
				maxAgeSeconds: 24 * 60 * 60 * 28,
				purgeOnQuotaError: true,
			}),
		],
	})
);
workbox.routing.registerRoute(
	// match only with assets on the assets domain
	new RegExp('https://raw.githubusercontent.com/acousticly/cdn/main/*'),
	workbox.strategies.cacheFirst({
		cacheName: 'acoustic-assets',
		plugins: [
			new workbox.expiration.Plugin({
				// 28 days cache before expiration
				maxAgeSeconds: 24 * 60 * 60 * 28,
				purgeOnQuotaError: true,
			}),
		],
	})
);


workbox.routing.registerRoute(
	new RegExp(
		'https://raw.githubusercontent.com/acousticly/cdn/master/css2.css'
	),
	workbox.strategies.cacheFirst({
		cacheName: 'acoustic-font',
		plugins: [
			new workbox.expiration.Plugin({
				// 28 days cache before expiration
				maxAgeSeconds: 24 * 60 * 60 * 28,
				// Opt-in to automatic cleanup whenever a quota errors occurs anywhere in Workbox
				purgeOnQuotaError: true,
			}),
		],
	})
);
self.addEventListener('install', function (event) {
	console.log('[ServiceWorker] Install');

	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			// Setting {cache: 'reload'} in the new request will ensure that the response
			// isn't fulfilled from the HTTP cache; i.e., it will be from the network.
			await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
		})()
	);

	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	console.log('[ServiceWorker] Activate');
	event.waitUntil(
		(async () => {
			// Enable navigation preload if it's supported.
			// See https://developers.google.com/web/updates/2017/02/navigation-preload
			if ('navigationPreload' in self.registration) {
				await self.registration.navigationPreload.enable();
			}
		})()
	);

	// Tell the active service worker to take control of the page immediately.
	self.clients.claim();
});

self.addEventListener('fetch', function (event) {
	console.log('[Service Worker] Fetch', event.request.url);

	if (event.request.mode === 'navigate') {
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
						'[Service Worker] Fetch failed; returning offline page instead.',
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
