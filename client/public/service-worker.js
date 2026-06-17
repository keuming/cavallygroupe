// Service Worker désactivé - vide tous les caches et se désinstalle
const CACHE_VERSION = 'cavally-v-reset-2026';
self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister())
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});
