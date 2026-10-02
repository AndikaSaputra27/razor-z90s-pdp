/**
 * Razor Audio — Service Worker
 * Strategy: Cache First for assets, Network First for HTML pages
 */

const CACHE_NAME    = 'razor-audio-v1';
const CACHE_ASSETS  = 'razor-audio-assets-v1';

// Files to pre-cache on install
const PRECACHE_URLS = [
  '/razor-z90s-pdp/',
  '/razor-z90s-pdp/index.html',
  '/razor-z90s-pdp/products.html',
  '/razor-z90s-pdp/checkout.html',
  '/razor-z90s-pdp/style.css',
  '/razor-z90s-pdp/products.css',
  '/razor-z90s-pdp/checkout.css',
  '/razor-z90s-pdp/script.js',
  '/razor-z90s-pdp/shared.js',
  '/razor-z90s-pdp/products.js',
  '/razor-z90s-pdp/checkout.js',
  '/razor-z90s-pdp/manifest.json',
  '/razor-z90s-pdp/img/matte-black-front.svg',
  '/razor-z90s-pdp/img/matte-black-side.svg',
  '/razor-z90s-pdp/img/silver-aluminum-front.svg',
  '/razor-z90s-pdp/img/silver-aluminum-side.svg',
  '/razor-z90s-pdp/img/matte-blue-front.svg',
  '/razor-z90s-pdp/img/matte-blue-side.svg',
  '/razor-z90s-pdp/img/icon-192.png',
  '/razor-z90s-pdp/img/icon-512.png',
];

// Offline fallback page
const OFFLINE_URL = '/razor-z90s-pdp/offline.html';

/* ── INSTALL: pre-cache all assets ── */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('[SW] Pre-caching assets...');
      return cache.addAll(PRECACHE_URLS.map(function(url) {
        return new Request(url, { cache: 'reload' });
      })).catch(function(err) {
        console.warn('[SW] Pre-cache partial fail:', err);
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* ── ACTIVATE: clean old caches ── */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(key) { return key !== CACHE_NAME && key !== CACHE_ASSETS; })
          .map(function(key) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* ── FETCH: smart caching strategy ── */
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Skip non-GET and cross-origin requests
  if (event.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  // HTML pages → Network First (fresh content, fallback to cache)
  if (event.request.headers.get('accept') &&
      event.request.headers.get('accept').indexOf('text/html') !== -1) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          if (response && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(function() {
          return caches.match(event.request).then(function(cached) {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Static assets (CSS, JS, SVG, images) → Cache First
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;

      return fetch(event.request).then(function(response) {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        var clone = response.clone();
        caches.open(CACHE_ASSETS).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function() {
        // Return empty SVG placeholder for images
        if (event.request.url.match(/\.(svg|png|jpg|jpeg|webp)$/)) {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1a1a1a"/><text x="50" y="55" text-anchor="middle" fill="#444" font-size="12">Offline</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      });
    })
  );
});

/* ── BACKGROUND SYNC: retry failed cart saves ── */
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-cart') {
    console.log('[SW] Background sync: cart');
  }
});

/* ── PUSH NOTIFICATIONS (stub) ── */
self.addEventListener('push', function(event) {
  var data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Razor Audio', {
      body:    data.body    || 'Ada update untuk kamu!',
      icon:    '/razor-z90s-pdp/img/icon-192.png',
      badge:   '/razor-z90s-pdp/img/icon-72.png',
      vibrate: [100, 50, 100],
      data:    { url: data.url || '/razor-z90s-pdp/' },
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/razor-z90s-pdp/')
  );
});
