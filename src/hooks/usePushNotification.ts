'use client';

import { useState, useEffect } from 'react';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotification(memberId: string, memberName: string) {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PermissionState);
    navigator.serviceWorker.register('/sw.js').catch(console.error);

    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    });
  }, []);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator)) return;
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission as PermissionState);
      if (permission !== 'granted') { setIsLoading(false); return; }

      const reg = await navigator.serviceWorker.ready;

      // 기존 구독 해제 후 새로 구독
      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, memberId, memberName })
      });

      if (res.ok) setIsSubscribed(true);
    } catch (err) {
      console.error('구독 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      });

      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  return { permission, isSubscribed, isLoading, subscribe, unsubscribe };
}
