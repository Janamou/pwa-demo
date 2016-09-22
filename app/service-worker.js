// Name of the cache.
var cacheName = "pwa-shell";
var contentCacheName = "pwa-content";

// Files to cache.
// TODO add images
// TODO think about something smarter for fonts
var files = [
    "/",
    "/index.html",
    "/css/icon.css",
    "/css/main.css",
    "/css/material.min.css",
    "/js/main.js",
    "/css/fonts/MaterialIcons-Regular.eot",
    "/css/fonts/MaterialIcons-Regular.woff2",
    "/css/fonts/MaterialIcons-Regular.woff",
    "/css/fonts/MaterialIcons-Regular.ttf",
    "/css/fonts/MaterialIcons-Regular.svg"
];

// Install event. Caches all the data for the App shell.
self.addEventListener("install", function (e) {
    console.log("ServiceWorker installed.");
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log("ServiceWorker adding all the App shell files to cache.");
            return cache.addAll(files);
        })
    );
});

// Activate event. Removes all data from the cache.
self.addEventListener("activate", function (e) {
    console.log("ServiceWorker activate.");
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName && key !== contentCacheName) {
                    console.log("ServiceWorker removing old data from the cache.", key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

var contentUrl = "https://api.github.com/search/repositories?q=pwa";

// Fetch event. Searches for the App shell data in the cache and retrieves
// them from the cache if available.
// It also caches the actual request to github search and uses it in case
// of connectivity issues.
self.addEventListener("fetch", function (e) {
    console.log("ServiceWorker fetch.");
    if (e.request.url.indexOf(contentUrl) >= 0) {
        e.respondWith(
            caches.open(contentCacheName).then(function (cache) {
                return fetch(e.request).then(function (response) {
                    console.log("ServiceWorker caching response.");
                    cache.put(e.request.url, response.clone());
                    return response;
                });
            })
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(function (response) {
                return response || fetch(e.request);
            })
        );
    }
});
