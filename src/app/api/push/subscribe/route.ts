// app/api/push/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { subscriptionStore } from '@/lib/subscriptionStore';

export async function POST(req: NextRequest) {
  try {
    const { subscription, memberId, memberName } = await req.json();

    if (!subscription || !memberId) {
      return NextResponse.json({ error: '구독 정보 또는 멤버 ID가 없어요' }, { status: 400 });
    }

    subscriptionStore.save(memberId, memberName || '크루원', subscription);

    return NextResponse.json({
      success: true,
      message: `${memberName || memberId}님의 알림 구독이 완료됐어요`,
      totalSubscribers: subscriptionStore.count()
    });
  } catch (err) {
    console.error('구독 저장 오류:', err);
    return NextResponse.json({ error: '서버 오류가 발생했어요' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { memberId } = await req.json();
    subscriptionStore.remove(memberId);
    return NextResponse.json({ success: true, message: '알림 구독이 해제됐어요' });
  } catch (err) {
    return NextResponse.json({ error: '서버 오류가 발생했어요' }, { status: 500 });
  }
}
