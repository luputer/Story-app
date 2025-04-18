const CACHE_NAME = 'story-app-cache-v1';
const SHELL_CACHE = 'story-app-shell-v1';
const CONTENT_CACHE = 'story-app-content-v1';

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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(shellResources))
  );
});

self.addEventListener('fetch', event => {
  const requestURL = new URL(event.request.url);

  // Handle shell resources
  if (shellResources.includes(requestURL.pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
    return;
  }

  // Handle API requests and dynamic content
  if (requestURL.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache successful responses
          if (response.status === 200) {
            caches.open(CONTENT_CACHE)
              .then(cache => cache.put(event.request, responseToCache));
          }
          
          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(event.request);
        })
    );
    return;
  }

  // Default strategy: network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CONTENT_CACHE)
            .then(cache => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [SHELL_CACHE, CONTENT_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});