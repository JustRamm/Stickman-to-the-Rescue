// Simple Service Worker for PWA
const CACHE_NAME = 'stickman-qpr-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/logo.svg',
    '/stickman_assets/pointing_stickman.svg',
    '/stickman_assets/happy_stickman.svg',
    '/stickman_assets/sad_stickman.svg',
    '/stickman_assets/thinking_stickman.svg',
    '/stickman_assets/clock_stickman.svg',
    '/stickman_assets/empty_stickman.svg',
    '/stickman_assets/scholar_stickman.svg',
    '/stickman_assets/guy_distressed.svg',
    '/stickman_assets/cloud.svg'
];

self.addEventListener('install', (event) => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
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
