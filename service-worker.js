/* Offline-first Service Worker (ClinicalToolsDEV)
   Strategy:
   - Precache app shell (install)
   - Stale-while-revalidate for same-origin GET requests
   - Offline fallback to cached app shell
*/

const CACHE_NAME = "hm-logger-cache-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];

// Install: precache core
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL);
      self.skipWaiting();
    })()
  );
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
          return Promise.resolve();
        })
      );
      self.clients.claim();
    })()
  );
});

// Fetch: cache-first for shell, stale-while-revalidate for same-origin GET
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Only handle same-origin (avoid breaking external resources)
  if (url.origin !== self.location.origin) return;

  // For navigation requests, serve app shell offline
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match("./index.html");
        try {
          const fresh = await fetch(req);
          // Update cache with fresh index (optional)
          cache.put("./index.html", fresh.clone());
          return fresh;
        } catch {
          return cached || new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // For static assets: stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);

      const fetchPromise = fetch(req)
        .then((res) => {
          // Cache successful responses
          if (res && res.status === 200) {
            cache.put(req, res.clone());
          }
          return res;
        })
        .catch(() => null);

      // Prefer cached immediately; update in background
      return cached || (await fetchPromise) || new Response("Offline", { status: 503 });
    })()
  );
});
