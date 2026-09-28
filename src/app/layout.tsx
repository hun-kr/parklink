import type { Metadata, Viewport } from 'next';
import PhoneFrame from '@/components/layout/PhoneFrame';
import './globals.css';

export const metadata: Metadata = {
  title: 'ParkLink · AI 실시간 주차정보',
  description: 'AI Vision 기반 실시간 주차정보 서비스 파크링크 데모',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <PhoneFrame>{children}</PhoneFrame>
      </body>
    </html>
  );
}
