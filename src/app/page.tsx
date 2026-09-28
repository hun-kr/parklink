'use client';

import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';
import BottomTabBar from '@/components/layout/BottomTabBar';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDistance } from '@/lib/format';
import { useLotSummaries } from '@/store/useParkingStore';

// 임시 홈(목록형): 3단계에서 지도 홈 + 바텀시트로 교체한다.
export default function HomePage() {
  const lots = useLotSummaries();

  return (
    <>
      <main className="flex-1 overflow-y-auto scrollbar-none px-5 pb-6 pt-6">
        <Link
          href="/destination"
          className="flex h-14 items-center gap-3 rounded-full border border-line bg-white px-5 text-[16px] text-ink-muted shadow-float"
        >
          <Search size={22} className="text-primary" strokeWidth={2.4} />
          목적지 또는 장소를 검색하세요
        </Link>

        <h1 className="mt-6 text-xl font-bold">
          주변 주차장 <span className="text-primary">{lots.length}곳</span>
        </h1>
        <p className="mt-1 text-sm text-ink-muted">지도 화면은 3단계에서 구현 예정 (지금은 목록 보기)</p>

        <div className="mt-4 space-y-3">
          {lots.map((lot) => (
            <Link key={lot.id} href={`/lot/${lot.id}`} className="block">
              <Card className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-white">
                  P
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">{lot.shortName}</p>
                  <p className="mt-0.5 text-[13px] text-ink-muted">
                    {lot.availableSpaces === null ? '정보없음' : `${lot.availableSpaces}면 / ${lot.totalSpaces}면`}
                    {' · '}
                    {formatDistance(lot.distanceM)}
                    {lot.isRealtime && <span className="whitespace-nowrap font-semibold text-available"> · 실시간</span>}
                  </p>
                </div>
                <StatusBadge status={lot.congestion} size="sm" />
                <ChevronRight size={18} className="text-ink-muted" />
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <BottomTabBar />
    </>
  );
}
