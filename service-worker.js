const CACHE_NAME = 'sampleflow-v8'; // Increment this from v6 to v7
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 1. Install & Force Activation
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use addAll with care: if one file fails, the whole install fails
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) 
  );
});

// 3. Network-First Strategy
// This is critical: It checks the internet for updates FIRST.
self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests (Supabase calls are usually POST/other)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
