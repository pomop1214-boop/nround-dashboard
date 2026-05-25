// NEW ROUND 서비스 워커

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'nround-notice',
    renotify: true,
    requireInteraction: false,
    data: { url: data.url || 'https://open.kakao.com/o/gtedhmbg' },
    actions: [
      { action: 'view', title: '공지 확인하기' },
      { action: 'close', title: '닫기' }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(data.title || '[NEW ROUND] 새 공지', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const kakaoUrl = 'https://open.kakao.com/o/gtedhmbg';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 창이 있으면 거기서 열기
      for (const client of clientList) {
        if ('navigate' in client) {
          client.navigate(kakaoUrl);
          return client.focus();
        }
      }
      // 없으면 새 창으로 열기
      return clients.openWindow(kakaoUrl);
    })
  );
});
