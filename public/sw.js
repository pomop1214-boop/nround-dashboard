// NEW ROUND 서비스 워커 — 백그라운드 푸시 알림 수신

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 푸시 알림 수신
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
    data: { url: 'https://open.kakao.com/o/gtedhmbg' },
    actions: [
      { action: 'view', title: '공지 확인하기' },
      { action: 'close', title: '닫기' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '[NEW ROUND] 새 공지', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || 'https://open.kakao.com/o/gtedhmbg';

  event.waitUntil(
    clients.openWindow(url)
  );
});
