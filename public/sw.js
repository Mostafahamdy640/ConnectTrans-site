// ConnectTrans Service Worker - Cache Busting & Live Sync
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Network first: always fetch live from server to prevent stale cached UI
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

