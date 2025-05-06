import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Cache names for different resource types
const CACHE_NAME = 'story-app-cache-v1';
const SHELL_CACHE = 'story-app-shell-v1';
const CONTENT_CACHE = 'story-app-content-v1';
const IMAGE_CACHE = 'story-app-images-v1';

// List of shell resources - essential app files
const shellResources = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts/index.js',
  '/scripts/app.js',
  '/scripts/routes/index.js',
  '/scripts/utils/index.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
];

// This will be populated by workbox-inject-manifest with list of precache assets
const manifest = self.__WB_MANIFEST || [];
console.log('Precaching the following resources:', manifest);
precacheAndRoute(manifest);

// Cache shell resources during installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      console.log('Caching shell resources');
      return cache.addAll(shellResources);
    })
  );
  // Activate immediately without waiting for tabs to close
  self.skipWaiting();
});

// Clean up old caches when activating
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  const cacheWhitelist = [SHELL_CACHE, CONTENT_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients/pages immediately
      return self.clients.claim();
    })
  );
});

// Google Fonts - Use CacheFirst because they don't change often
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      })
    ]
  })
);

// Font Awesome - Use CacheFirst because they don't change often
registerRoute(
  ({ url }) => url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome'),
  new CacheFirst({
    cacheName: 'fontawesome',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      })
    ]
  })
);

// Shell resources - Use CacheFirst for app shell
registerRoute(
  ({ request }) => {
    const url = new URL(request.url);
    return shellResources.includes(url.pathname) || 
           url.pathname === '/' || 
           url.pathname.endsWith('.html');
  },
  new CacheFirst({
    cacheName: SHELL_CACHE,
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })]
  })
);

// API requests - Use NetworkFirst to get fresh data but fall back to cache
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev' && !url.pathname.includes('/images/'),
  new NetworkFirst({
    cacheName: CONTENT_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 // 1 day
      })
    ],
    networkTimeoutSeconds: 10, // Fallback to cache if network takes too long
  })
);

// Dicoding API Images - Use CacheFirst for images
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev' && 
               (url.pathname.includes('/images/') || url.pathname.includes('/stories/')),
  new CacheFirst({
    cacheName: IMAGE_CACHE,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      })
    ]
  })
);

// Other images - Use CacheFirst for all other images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: IMAGE_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      })
    ]
  })
);

// JS and CSS assets - Use StaleWhileRevalidate to ensure they're up to date
registerRoute(
  ({ request }) => 
    request.destination === 'script' || 
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  })
);

// Navigation requests (SPA routes) - Use NetworkFirst with quick timeout
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: CONTENT_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] })
    ],
    networkTimeoutSeconds: 3, // Fallback to cache quickly if network is slow
  })
);

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Story App Notification',
      body: event.data.text(),
      icon: '/icons/icon-192x192.png'
    };
  }

  const options = {
    body: data.body || 'New update from Story App',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    data: {
      url: data.url || '/',
      id: data.id || Date.now().toString()
    },
    tag: data.id || Date.now().toString()
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Story App', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);
  event.notification.close();

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});