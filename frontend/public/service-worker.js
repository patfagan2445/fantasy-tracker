const CACHE_NAME = 'fantasy-tracker-v1';
const STATIC_ASSETS = ['/', '/index.html'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

self.addEventListener('push', event => {
  if (!event.data) return;

  let data;
  try { data = JSON.parse(event.data.text()); }
  catch { data = { title: '⚾ Player Alert', body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      data: data.data || {},
      actions: [
        { action: 'watch', title: '▶ Watch on MLB.tv' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const gamePk = event.notification.data?.gamePk;
  const url = gamePk
    ? 'https://www.mlb.com/tv/g' + gamePk
    : 'https://www.mlb.com/tv';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'OPEN_GAME', gamePk, url });
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
