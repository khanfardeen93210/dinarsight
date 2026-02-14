const CACHE_NAME = "dinarsight-v5"; // 🔄 updated version

const STATIC_ASSETS = [
  "/app",                        // your frontend route
  "/static/style.css",
  "/static/app.js",
  "/static/manifest.json",

  // Icons
  "/static/icons/icon-192.png",
  "/static/icons/icon-512.png",

  // Audio files
  "/static/audio/welcome.mp3",
  "/static/audio/camera.mp3",
  "/static/audio/error.mp3",
  "/static/audio/250.mp3",
  "/static/audio/500.mp3",
  "/static/audio/1000.mp3",
  "/static/audio/5000.mp3",
  "/static/audio/10000.mp3"
];

// 🔹 Install – cache static files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 🔹 Activate – remove old caches
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

// 🔹 Fetch Handler
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