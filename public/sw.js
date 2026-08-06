// Service Worker PWA LMS MTsN 2 Cilacap
const CACHE_NAME = "lms-mtsn2-cache-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/favicon.png",
  "/logomts.png",
];

// Install Event - Caching static shell safely
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching offline LMS shell");
      return Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("[ServiceWorker] Skipped caching missing item:", url, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[ServiceWorker] Clearing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network first with Cache Fallback for offline resilience
self.addEventListener("fetch", (event) => {
  // Only intercept GET requests with http/https scheme
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith("http:") && !event.request.url.startsWith("https:")) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache dynamic PDF and media assets if requested
        if (
          networkResponse.status === 200 &&
          (event.request.url.endsWith(".pdf") || event.request.url.includes("/assets/"))
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => {
        console.log("[ServiceWorker] Network failed; returning offline cache fallback for:", event.request.url);
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Fallback page
          return caches.match("/");
        });
      })
  );
});
