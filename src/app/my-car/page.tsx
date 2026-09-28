import Link from 'next/link';
import { Car } from 'lucide-react';
import BottomTabBar from '@/components/layout/BottomTabBar';

// 저장된 주차 위치가 있을 때의 '내 차 찾기' 화면은 7단계에서 구현한다.
export default function MyCarPage() {
  return (
    <>
      <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-primary">
          <Car size={40} strokeWidth={1.8} />
        </span>
        <h1 className="mt-5 text-[22px] font-bold">저장된 주차 위치가 없어요</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          주차장 안내를 받아 주차를 완료하면
          <br />내 차 위치가 자동으로 저장됩니다.
        </p>
        <Link
          href="/"
          className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-[17px] font-bold text-white"
        >
          주차장 찾기
        </Link>
      </main>
      <BottomTabBar />
    </>
  );
}
