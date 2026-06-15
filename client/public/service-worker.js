const CACHE_NAME = 'cavally-livres-v2';
const RUNTIME_CACHE = 'cavally-livres-runtime-v3';
const ASSETS_CACHE = 'cavally-livres-assets-v3';
const IMAGES_CACHE = 'cavally-livres-images-v3';
const API_CACHE = 'cavally-livres-api-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation en cours...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache des assets statiques');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Erreur lors de la mise en cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation en cours...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![RUNTIME_CACHE, ASSETS_CACHE, IMAGES_CACHE, API_CACHE].includes(cacheName)) {
            console.log('[Service Worker] Suppression du cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers des domaines externes (sauf les CDN)
  if (url.origin !== self.location.origin && !url.hostname.includes('cdn')) {
    return;
  }

  // Stratégie: Cache first pour les images (avec limite de taille)
  if (isImageAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(IMAGES_CACHE).then((cache) => {
            // Limite le cache à 50MB pour les images
            cache.put(request, responseToCache);
            // Nettoyage automatique des anciens caches
            cleanupImageCache();
          });
          return response;
        });
      })
    );
  }
  // Stratégie: Cache first pour les assets statiques
  else if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(ASSETS_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
  }
  // Stratégie: Network first pour les requêtes API
  else if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            return new Response(
              JSON.stringify({
                error: 'Vous êtes hors ligne. Veuillez vérifier votre connexion.'
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'application/json'
                })
              }
            );
          });
        })
    );
  }
  // Stratégie: Stale while revalidate pour les autres requêtes
  else {
    event.respondWith(
      caches.match(request).then((response) => {
        const fetchPromise = fetch(request).then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
        return response || fetchPromise;
      })
    );
  }
});

// Fonction utilitaire pour déterminer si c'est une image
function isImageAsset(pathname) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
  return imageExtensions.some((ext) => pathname.endsWith(ext));
}

// Fonction utilitaire pour déterminer si c'est un asset statique
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.woff', '.woff2', '.ttf', '.eot'];
  return staticExtensions.some((ext) => pathname.endsWith(ext)) || pathname === '/';
}

// Nettoyage du cache des images si dépassement de la limite
async function cleanupImageCache() {
  const cache = await caches.open(IMAGES_CACHE);
  const keys = await cache.keys();
  
  // Limite à 100 images en cache
  if (keys.length > 100) {
    // Supprime les 10 premières (les plus anciennes)
    for (let i = 0; i < 10; i++) {
      cache.delete(keys[i]);
    }
  }
}

// Gestion des messages depuis le client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    caches.open(ASSETS_CACHE).then((cache) => {
      cache.addAll(urls).catch((err) => {
        console.warn('[Service Worker] Erreur lors de la mise en cache:', err);
      });
    });
  }
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    tag: 'cavally-livres-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Cavally Livres', options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Gestion des fermetures de notifications
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification fermée');
});
