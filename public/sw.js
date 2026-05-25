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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const kakaoUrl = 'https://open.kakao.com/o/gtedhmbg';

  event.waitUntil(
    clients.openWindow(kakaoUrl).catch(() => {
      // openWindow 실패 시 모든 클라이언트에 메시지 전송
      return clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].postMessage({ type: 'OPEN_URL', url: kakaoUrl });
          return clientList[0].focus();
        }
      });
    })
  );
});
