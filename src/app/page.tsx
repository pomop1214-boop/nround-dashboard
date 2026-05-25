'use client';

import { useState } from 'react';
import { usePushNotification } from '@/hooks/usePushNotification';

const DEMO_MEMBER = { id: 'member-001', name: '운영진' };

export default function Dashboard() {
  const { permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotification(
    DEMO_MEMBER.id,
    DEMO_MEMBER.name
  );

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ msg: string; ok: boolean } | null>(null);
  const [sendType, setSendType] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [notices, setNotices] = useState([
    { id: 1, title: '5/18 올림픽공원 러닝 안내', body: '오전 7시 평화의문 앞 집결, 10km 예정', date: '5월 17일' },
    { id: 2, title: '6월 크루 티셔츠 공동구매', body: '사이즈 신청을 5/31까지 부탁드립니다', date: '5월 15일' },
  ]);
  const [scheduled, setScheduled] = useState<{ id: number; title: string; body: string; datetime: string }[]>([]);

  const sendNotice = async () => {
    if (!title || !body) return;
    if (sendType === 'schedule' && (!scheduleDate || !scheduleTime)) {
      setResult({ msg: '날짜와 시간을 입력해주세요', ok: false });
      return;
    }
    if (sendType === 'schedule') {
      const datetime = `${scheduleDate} ${scheduleTime}`;
      setScheduled(prev => [{ id: Date.now(), title, body, datetime }, ...prev]);
      setResult({ msg: `${datetime} 에 예약됐어요`, ok: true });
      setTitle(''); setBody(''); setScheduleDate(''); setScheduleTime('');
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body })
      });
      const data = await res.json();
      setResult({ msg: data.message, ok: data.success });
      if (data.success) {
        setNotices(prev => [{ id: Date.now(), title, body, date: '방금 전' }, ...prev]);
        setTitle(''); setBody('');
      }
    } catch {
      setResult({ msg: '발송 중 오류가 발생했어요', ok: false });
    } finally {
      setSending(false);
    }
  };

  const deleteNotice = (id: number) => {
    if (deleteConfirm === id) {
      setNotices(prev => prev.filter(n => n.id !== id));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const cancelSchedule = (id: number) => {
    setScheduled(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: 'Pretendard, -apple-system, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: '0.5px solid #e8e6e0', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#E8593C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🏃</div>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>N.ROUND 대시보드</span>
        </div>
        <div style={{ fontSize: 13, color: '#888' }}>운영진</div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 알림 구독 */}
        <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e8e6e0', padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.06em', marginBottom: 12 }}>웹 푸시 알림</div>
          {permission === 'unsupported' ? (
            <div style={{ background: '#faeeda', border: '0.5px solid #EF9F27', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#633806' }}>
              Chrome 또는 iOS 16.4+ Safari를 사용해주세요.
            </div>
          ) : permission === 'denied' ? (
            <div style={{ background: '#fcebeb', border: '0.5px solid #F09595', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#791F1F' }}>
              알림이 차단됐어요. 브라우저 설정에서 알림 권한을 허용해주세요.
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 3 }}>
                  {isSubscribed ? '✅ 푸시 알림 구독 중' : '푸시 알림 구독하기'}
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {isSubscribed ? '공지가 올라오면 이 기기로 알림이 와요' : '알림을 허용하면 공지를 바로 받을 수 있어요'}
                </div>
              </div>
              <button onClick={isSubscribed ? unsubscribe : subscribe} disabled={isLoading}
                style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: isSubscribed ? '#f1efea' : '#E8593C', color: isSubscribed ? '#5f5e5a' : '#fff', opacity: isLoading ? 0.6 : 1 }}>
                {isLoading ? '처리 중...' : isSubscribed ? '구독 해제' : '알림 허용하기'}
              </button>
            </div>
          )}
        </div>

        {/* 공지 작성 */}
        <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e8e6e0', padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.06em', marginBottom: 14 }}>공지 작성 및 발송</div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="공지 제목"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 14, marginBottom: 10, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="공지 내용을 입력하세요" rows={4}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }} />
          <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
            <button onClick={() => setSendType('now')}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${sendType === 'now' ? '#E8593C' : '#ddd'}`, background: sendType === 'now' ? '#FEF0ED' : '#fff', color: sendType === 'now' ? '#E8593C' : '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              ⚡ 즉시 발송
            </button>
            <button onClick={() => setSendType('schedule')}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${sendType === 'schedule' ? '#E8593C' : '#ddd'}`, background: sendType === 'schedule' ? '#FEF0ED' : '#fff', color: sendType === 'schedule' ? '#E8593C' : '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              🕐 예약 발송
            </button>
          </div>
          {sendType === 'schedule' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
              <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {result && <div style={{ fontSize: 13, color: result.ok ? '#27500A' : '#A32D2D' }}>{result.msg}</div>}
            <button onClick={sendNotice} disabled={!title || !body || sending}
              style={{ marginLeft: 'auto', padding: '9px 20px', borderRadius: 8, border: 'none', background: '#E8593C', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: (!title || !body || sending) ? 0.5 : 1 }}>
              {sending ? '발송 중...' : sendType === 'schedule' ? '예약 등록' : '전체 발송'}
            </button>
          </div>
        </div>

        {/* 예약된 공지 */}
        {scheduled.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e8e6e0', padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.06em', marginBottom: 14 }}>예약된 공지 ({scheduled.length})</div>
            {scheduled.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < scheduled.length - 1 ? '0.5px solid #f0eee8' : 'none', alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🕐</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{s.body}</div>
                  <div style={{ fontSize: 11, color: '#E8593C', marginTop: 4 }}>📅 {s.datetime} 발송 예정</div>
                </div>
                <button onClick={() => cancelSchedule(s.id)}
                  style={{ padding: '4px 10px', borderRadius: 6, border: '0.5px solid #ddd', background: '#fff', fontSize: 12, color: '#888', cursor: 'pointer' }}>취소</button>
              </div>
            ))}
          </div>
        )}

        {/* 공지 목록 */}
        <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e8e6e0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.06em' }}>최근 공지 ({notices.length})</div>
          </div>
          {notices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: '#bbb' }}>공지가 없어요</div>
          ) : (
            notices.map((n, i) => (
              <div key={n.id} style={{ padding: '12px 0', borderBottom: i < notices.length - 1 ? '0.5px solid #f0eee8' : 'none' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>📢</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</div>
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>{n.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: '#EAF3DE', color: '#27500A', whiteSpace: 'nowrap' }}>발송 완료</div>
                    <button
                      onClick={() => deleteNotice(n.id)}
                      style={{
                        padding: '3px 8px', borderRadius: 6, border: `0.5px solid ${deleteConfirm === n.id ? '#F09595' : '#ddd'}`,
                        background: deleteConfirm === n.id ? '#FCEBEB' : '#fff',
                        color: deleteConfirm === n.id ? '#791F1F' : '#aaa',
                        fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap'
                      }}>
                      {deleteConfirm === n.id ? '정말 삭제?' : '삭제'}
                    </button>
                    {deleteConfirm === n.id && (
                      <button onClick={() => setDeleteConfirm(null)}
                        style={{ padding: '3px 8px', borderRadius: 6, border: '0.5px solid #ddd', background: '#fff', color: '#aaa', fontSize: 11, cursor: 'pointer' }}>
                        취소
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
