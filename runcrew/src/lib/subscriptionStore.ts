// lib/subscriptionStore.ts
// 실제 서비스에서는 Supabase 또는 DB로 교체하세요

import { PushSubscription } from 'web-push';

export interface StoredSubscription {
  id: string;
  memberId: string;
  memberName: string;
  subscription: PushSubscription;
  createdAt: string;
}

// 개발용 인메모리 저장소 (실제 서비스에서는 DB로 교체)
const store: Map<string, StoredSubscription> = new Map();

export const subscriptionStore = {
  save(memberId: string, memberName: string, subscription: PushSubscription) {
    const id = `${memberId}-${Date.now()}`;
    store.set(memberId, { id, memberId, memberName, subscription, createdAt: new Date().toISOString() });
  },
  getAll(): StoredSubscription[] {
    return Array.from(store.values());
  },
  getByMember(memberId: string): StoredSubscription | undefined {
    return store.get(memberId);
  },
  remove(memberId: string) {
    store.delete(memberId);
  },
  count(): number {
    return store.size;
  }
};
