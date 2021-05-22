/** @format */

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
		'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap'
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

workbox.precaching.precacheAndRoute([]);

workbox.skipWaiting();
workbox.clientsClaim();
