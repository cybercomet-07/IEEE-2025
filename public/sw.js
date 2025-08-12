const CACHE_NAME = 'citypulse-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
        issueId: data.issueId
      },
      actions: [
        {
          action: 'view',
          title: 'View Issue',
          icon: '/icons/icon-72x72.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/icon-72x72.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    // Open the issue detail page
    const issueId = event.notification.data.issueId;
    event.waitUntil(
      clients.openWindow(`/issue/${issueId}`)
    );
  }
});

// Background sync for offline issue reporting
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get offline issues from IndexedDB
    const offlineIssues = await getOfflineIssues();
    
    for (const issue of offlineIssues) {
      try {
        // Try to sync with server
        await syncIssue(issue);
        // Remove from offline storage if successful
        await removeOfflineIssue(issue.id);
      } catch (error) {
        console.error('Failed to sync issue:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for offline storage
async function getOfflineIssues() {
  // This would interact with IndexedDB to get stored offline issues
  return [];
}

async function syncIssue(issue) {
  // This would send the issue to the server
  return fetch('/api/issues', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(issue)
  });
}

async function removeOfflineIssue(issueId) {
  // This would remove the issue from IndexedDB
  return Promise.resolve();
}
