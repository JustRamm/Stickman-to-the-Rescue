// Improved Service Worker for PWA
const CACHE_NAME = 'stickman-qpr-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/logo.svg',
    '/manifest.json'
];

// Offline assets (stickman animations etc.)
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
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll([...urlsToCache, ...staticAssets]);
            })
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Network-First strategy for index.html and root to prevent stale build hashes
    if (url.pathname === '/' || url.pathname === '/index.html') {
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

    // Default Cache-First strategy for static assets
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
