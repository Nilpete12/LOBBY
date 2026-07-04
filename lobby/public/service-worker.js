const CACHE_NAME = 'lobby-static-v2';
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/favicon-192.png',
  '/favicon-512.png',
];
const PUBLIC_NAVIGATION_PATHS = new Set([
  '/',
  '/about',
  '/drive',
  '/privacypolicy',
  '/search',
  '/support',
  '/terms',
]);
const PROTECTED_PATH_PREFIXES = [
  '/account',
  '/admin',
  '/drive/dashboard',
  '/drive/earnings',
  '/drive/TripHistory',
  '/favourites',
  '/onboarding',
  '/sign-in',
  '/sign-up',
];
const STATIC_ASSET_PATTERN = /\.(?:css|js|mjs|png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf|otf)$/i;

function isProtectedPath(pathname) {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isCacheableNavigation(pathname) {
  return PUBLIC_NAVIGATION_PATHS.has(pathname) && !isProtectedPath(pathname);
}

function isCacheableStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') || STATIC_ASSET_PATTERN.test(url.pathname);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname === '/api' || url.pathname.startsWith('/api/') || isProtectedPath(url.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && isCacheableNavigation(url.pathname)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  if (!isCacheableStaticAsset(url)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });

      return cached || networkFetch;
    })
  );
});
