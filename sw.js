/*
 * Service worker for offline support.
 * It pre-caches core assets (HTML, JavaScript, manifest and icons) so that
 * the estimator can load and function without a network connection. During
 * fetch, it falls back to the network first then the cache if offline.
 */

const CACHE_NAME = 'estimate-app-v1';
// Files to cache for offline use. Paths are relative to the service worker location.
const FILES_TO_CACHE = [
  // Cache entry points so the app can load offline from either the default
  // index page or the original estimate page. Including both avoids 404s
  // depending on how the app is served.
  './index.html',
  './estimate.html',
  './manifest.json',
  './sw.js',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  // Pre-cache static resources during installation.
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener('activate', event => {
  // Remove old caches when a new service worker activates.
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Respond with network-first strategy. Attempt to fetch from the network.
  // If that fails (e.g. offline), return the cached response if available.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});