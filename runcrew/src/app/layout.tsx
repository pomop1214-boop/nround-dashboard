import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '런크루 대시보드',
  description: '런크루 공지 알림 관리 시스템',
  manifest: '/manifest.json',
  themeColor: '#534AB7',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#534AB7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="런크루" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
