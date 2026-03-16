const CACHE_NAME = "dinarsight-v4";

const STATIC_ASSETS = [
  "/",
  "/style.css",
  "/app.js",
  "/manifest.json",

  // Icons
  "/icons/icon-192.png",
  "/icons/icon-512.png",

  // Audio files
  "/audio/welcome.mp3",
  "/audio/gallery.mp3",
  "/audio/camera.mp3",
  "/audio/error.mp3",
  "/audio/250.mp3",
  "/audio/500.mp3",
  "/audio/1000.mp3",
  "/audio/5000.mp3",
  "/audio/10000.mp3"
];

// 🔹 Install – cache static files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 🔹 Activate – clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 🔹 Fetch handler
self.addEventListener("fetch", event => {
  const url = event.request.url;

  // ❌ Never cache backend API calls
  if (url.includes("/predict")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});