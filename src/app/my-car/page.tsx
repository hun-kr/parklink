'use client';

import Link from 'next/link';
import { Car, Navigation, Trash2 } from 'lucide-react';
import BottomTabBar from '@/components/layout/BottomTabBar';
import MyParkingCard from '@/components/parking/MyParkingCard';
import { ActionButton } from '@/components/ui/BottomActions';
import { useMyCarStore } from '@/store/useMyCarStore';

// 저장된 위치가 있을 때의 '내 차 찾기' 지도 화면은 7단계에서 구현한다.
export default function MyCarPage() {
  const { myParking, hydrated, clear } = useMyCarStore();

  return (
    <>
      {!hydrated ? (
        <main className="flex-1" />
      ) : myParking ? (
        <main className="flex-1 overflow-y-auto scrollbar-none px-5 pb-6 pt-8">
          <h1 className="text-[26px] font-bold">내 차 찾기</h1>
          <p className="mt-1.5 text-[15px] text-ink-muted">주차한 위치를 확인하고, 쉽게 찾아가세요.</p>
          <div className="mt-5">
            <MyParkingCard parking={myParking} />
          </div>
          <div className="mt-4 flex gap-3">
            <ActionButton label="길안내 다시보기" icon={Navigation} variant="secondary" href={`/navigate/${myParking.lotId}?zone=${myParking.zone}`} />
          </div>
          <button
            type="button"
            onClick={clear}
            className="mt-4 flex w-full items-center justify-center gap-1.5 py-3 text-sm font-medium text-ink-muted"
          >
            <Trash2 size={16} />
            출차 완료 (저장 위치 삭제)
          </button>
        </main>
      ) : (
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
      )}
      <BottomTabBar />
    </>
  );
}
