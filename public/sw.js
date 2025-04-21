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

// Helper function to check if a request is cacheable
function isCacheableRequest(request) {
  const url = new URL(request.url);
  return ['http:', 'https:'].includes(url.protocol);
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(shellResources))
  );
});

self.addEventListener('fetch', event => {
  // Skip non-cacheable requests (like chrome-extension:// URLs)
  if (!isCacheableRequest(event.request)) {
    return;
  }

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
        if (response.status === 200 && isCacheableRequest(event.request)) {
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

// Fix for push notification looping bug
self.addEventListener('push', event => {
  // Check if there's any data in the push message
  if (!event.data) {
    console.log('Received push notification without data');
    return;
  }
  
  // Get notification data
  let data;
  try {
    // Try to parse as JSON first
    data = event.data.json();
  } catch (e) {
    console.log('Notification is not JSON, using text content instead');
    // If not JSON, use the text content directly
    const textContent = event.data.text();
    data = {
      title: 'Story App Notification',
      body: textContent,
      icon: '/icons/icon-192x192.png'
    };
  }
  
  // Store notification ID to prevent duplicates
  const notificationId = data.id || Date.now().toString();
  const notificationsShown = self._notificationsShown || new Set();
  
  // Check if this notification was already shown
  if (notificationsShown.has(notificationId)) {
    console.log('Duplicate notification prevented:', notificationId);
    return;
  }
  
  // Add to shown notifications set
  notificationsShown.add(notificationId);
  self._notificationsShown = notificationsShown;
  
  // Limit set size to prevent memory issues
  if (notificationsShown.size > 50) {
    const iterator = notificationsShown.values();
    notificationsShown.delete(iterator.next().value);
  }
  
  // Show the notification
  const options = {
    body: data.body || 'New update from Story App',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    data: {
      url: data.url || '/',
      id: notificationId
    },
    tag: notificationId // Use tag to prevent duplicate notifications
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Story App', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Open the app and navigate to the specified URL
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.matchAll({type: 'window'}).then(windowClients => {
        // Check if there is already a window open
        for (const client of windowClients) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});

// Handle messages from the client (for new story notifications)
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);
  
  if (!event.data) return;
  
  // Handle different types of notifications
  if (event.data.type === 'NEW_STORY') {
    const notificationId = `story-${Date.now()}`;
    const notificationOptions = {
      body: event.data.body || 'A new story has been added!',
      icon: event.data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: {
        url: event.data.url || '/#/stories',
        id: notificationId
      },
      tag: notificationId,
      actions: [
        {
          action: 'view',
          title: 'View Story'
        }
      ]
    };
    
    self.registration.showNotification(
      event.data.title || 'New Story Added', 
      notificationOptions
    );
    
    // Send notification to other clients
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        // Don't send to the client that triggered the notification
        if (client.id !== event.source?.id) {
          client.postMessage({
            type: 'STORY_ADDED',
            title: event.data.title,
            body: event.data.body
          });
        }
      });
    });
  }
  
  // Handle story deletion notifications
  else if (event.data.type === 'STORY_DELETED') {
    const notificationId = `delete-${Date.now()}`;
    const notificationOptions = {
      body: event.data.body || 'A story has been deleted',
      icon: event.data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: {
        url: event.data.url || '/#/stories',
        id: notificationId
      },
      tag: notificationId,
      // Use different vibration pattern for deletion
      vibrate: [100, 50, 100], 
      // Use a different color for deletion notification
      actions: [
        {
          action: 'view',
          title: 'View Stories'
        }
      ]
    };
    
    self.registration.showNotification(
      event.data.title || 'Story Deleted', 
      notificationOptions
    );
    
    // Send notification to other clients
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        // Don't send to the client that triggered the notification
        if (client.id !== event.source?.id) {
          client.postMessage({
            type: 'STORY_DELETED',
            title: event.data.title,
            body: event.data.body
          });
        }
      });
    });
  }
});