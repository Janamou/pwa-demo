// Name of the cache.
var cacheName = "pwa-shell";
var contentCacheName = "pwa-content";

// Files to cache.
// TODO add images
var files = [
    "/",
    "/index.html",
    "/css/icon.css",
    "/css/main.css",
    "/css/material.indigo-pink.min.css",
    "/js/main.js"
];

// Install event. Caches all the data for the App shell.
self.addEventListener("install", function (e) {
    console.log("ServiceWorker installed.");
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log("Adding all the App shell files to cache.");
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
                    console.log("Removing old data from the cache.", key);
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
self.addEventListener("fetch", function (e) {
    console.log("ServiceWorker fetch.");
    if (e.request.url.indexOf(contentUrl) >= 0) {
        e.respondWith(
            caches.open(contentCacheName).then(function (cache) {
                return fetch(e.request).then(function (response) {
                    console.log("Caching response.");
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