import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { title, body, url = 'https://open.kakao.com/o/gtedhmbg' } = await req.json();
    if (!title || !body) {
      return NextResponse.json({ error: '제목과 내용을 입력해주세요' }, { status: 400 });
    }

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: false, message: '구독된 크루원이 없어요' });
    }

    const payload = JSON.stringify({ title: `[NEW ROUND] ${title}`, body, url });

    const results = await Promise.allSettled(
      subscriptions.map((row) =>
        webpush.sendNotification(row.subscription as any, payload)
          .then(() => ({ name: row.member_name, status: 'sent' }))
          .catch(() => ({ name: row.member_name, status: 'failed' }))
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled' && (r.value as any).status === 'sent').length;
    const failed = results.length - sent;

    return NextResponse.json({
      success: true,
      message: `${sent}명에게 발송했어요${failed > 0 ? ` (${failed}명 실패)` : ''}`,
      sent, failed, total: results.length
    });
  } catch (err) {
    console.error('푸시 발송 오류:', err);
    return NextResponse.json({ error: '발송 중 오류가 발생했어요' }, { status: 500 });
  }
}
