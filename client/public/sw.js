// Service Worker pour Cavaly Livres PWA
const CACHE_NAME = 'cavaly-livres-v1';
const RUNTIME_CACHE = 'cavaly-livres-runtime-v1';
const OFFLINE_URL = '/offline.html';

// Liste des fichiers à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation en cours...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache statique créé');
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn('[SW] Erreur lors de la mise en cache des assets statiques:', error);
        // Continuer même si certains assets ne peuvent pas être mis en cache
        return Promise.resolve();
      });
    })
  );
  
  // Force le Service Worker à devenir actif immédiatement
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation en cours...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprimer les anciens caches
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Suppression du cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Prendre le contrôle de tous les clients
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP(S)
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Stratégie pour les documents HTML
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre en cache les réponses réussies
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // En cas d'erreur réseau, retourner la page offline
          return caches.match(OFFLINE_URL).then((response) => {
            return response || new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }
  
  // Stratégie pour les assets (CSS, JS, images)
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request).then((response) => {
          // Mettre en cache les réponses réussies
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          // Retourner une réponse par défaut pour les images
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#999">Offline</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          return new Response('Resource unavailable', { status: 503 });
        });
      })
    );
    return;
  }
  
  // Stratégie par défaut: Network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((response) => {
          return response || new Response('Resource unavailable', { status: 503 });
        });
      })
  );
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    });
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(
      // Synchroniser les commandes en arrière-plan
      fetch('/api/sync-orders', { method: 'POST' })
        .then((response) => {
          if (response.ok) {
            console.log('[SW] Synchronisation des commandes réussie');
          }
        })
        .catch((error) => {
          console.error('[SW] Erreur de synchronisation:', error);
          // Retry la synchronisation
          throw error;
        })
    );
  }
});

// Notification push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Nouvelle notification de Cavaly Livres',
    icon: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663089638801/JchNQVPEyyYDQsQ28Z4FUv/cavaly-icon-192-SUMLWo6rzWbZ8MTzxSiBpi.webp',
    badge: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663089638801/JchNQVPEyyYDQsQ28Z4FUv/cavaly-icon-192-SUMLWo6rzWbZ8MTzxSiBpi.webp',
    tag: data.tag || 'cavaly-notification',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Cavaly Livres', options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Chercher si une fenêtre est déjà ouverte
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

console.log('[SW] Service Worker chargé');
