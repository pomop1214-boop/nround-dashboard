import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { subscription, memberId, memberName } = await req.json();
    if (!subscription || !memberId) {
      return NextResponse.json({ error: '구독 정보가 없어요' }, { status: 400 });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        member_id: memberId,
        member_name: memberName || '크루원',
        subscription: subscription,
      }, { onConflict: 'member_id' });

    if (error) throw error;

    const { count } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: `${memberName || memberId}님 알림 구독 완료`,
      totalSubscribers: count
    });
  } catch (err) {
    console.error('구독 저장 오류:', err);
    return NextResponse.json({ error: '서버 오류가 발생했어요' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { memberId } = await req.json();
    await supabase.from('push_subscriptions').delete().eq('member_id', memberId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: '서버 오류가 발생했어요' }, { status: 500 });
  }
}
