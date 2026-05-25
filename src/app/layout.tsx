import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NEW ROUND 대시보드',
  description: 'NEW ROUND 크루 공지 알림 시스템',
  manifest: '/manifest.json',
  openGraph: {
    title: 'NEW ROUND 대시보드',
    description: 'NEW ROUND 크루 공지 알림 시스템',
    siteName: 'NEW ROUND',
    images: [{ url: '/icon-512.png' }],
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E8593C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NEW ROUND" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
