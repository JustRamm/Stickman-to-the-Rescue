// Enhanced Service Worker for PWA - v5
const CACHE_NAME = 'stickman-qpr-v9';
const urlsToCache = [
    '/',
    '/index.html',
    '/logo.svg',
    '/manifest.json'
];

const staticAssets = [
    '/stickman_assets/pointing_stickman.svg',
    '/stickman_assets/happy_stickman.svg',
    '/stickman_assets/sad_stickman.svg',
    '/stickman_assets/thinking_stickman.svg',
    '/stickman_assets/clock_stickman.svg',
    '/stickman_assets/empty_stickman.svg',
    '/stickman_assets/scholar_stickman.svg',
    '/stickman_assets/guy_distressed.svg',
    '/stickman_assets/cloud.svg',
    '/stickman_assets/stickman_phone.svg',
    '/stickman_assets/stickman_laptop.svg',
    '/stickman_assets/stickman_group.svg',
    '/stickman_assets/stickman_medic.svg'
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force activation
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened v4 cache');
                return cache.addAll([...urlsToCache, ...staticAssets]);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(), // Take control of all clients
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
        ])
    );
});

self.addEventListener('fetch', (event) => {
    // Only intercept HTTP/HTTPS requests
    if (!event.request.url.startsWith('http')) return;

    const url = new URL(event.request.url);

    // 1. Network-First for HTML (Entry points)
    // This ensures we always get the latest build hashes from the server
    if (url.pathname === '/' || url.pathname === '/index.html' || url.origin === self.location.origin && !url.pathname.includes('.')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const resClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // 2. Cache-First for everything else (Assets)
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                // If not in cache, fetch it
                return fetch(event.request).then(networkResponse => {
                    // Don't cache if not a successful response or external
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    return networkResponse;
                }).catch(() => {
                    // Optional: Return a fallback image/resource if network fails
                    return null;
                });
            })
    );
});
