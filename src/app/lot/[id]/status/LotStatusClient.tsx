'use client';

import { useState } from 'react';
import { MessageSquareText, Navigation, SquareParking } from 'lucide-react';
import AvailabilityCard from '@/components/lot/AvailabilityCard';
import LotHero from '@/components/lot/LotHero';
import OperationInfo from '@/components/lot/OperationInfo';
import { ZoneCardsStatus } from '@/components/lot/ZoneCards';
import ParkingMap from '@/components/parking/ParkingMap';
import BottomActions from '@/components/ui/BottomActions';
import Tabs from '@/components/ui/Tabs';
import { CONFIG } from '@/lib/config';
import type { ZoneId } from '@/lib/types';
import { useMyCarStore } from '@/store/useMyCarStore';
import { useLotSummary, useRecommendation, useSlots } from '@/store/useParkingStore';
import { toast } from '@/store/useToastStore';

export type StatusTab = 'status' | 'info' | 'review';

const TAB_ITEMS: { value: StatusTab; label: string }[] = [
  { value: 'status', label: '주차장 현황' },
  { value: 'info', label: '주차장 정보' },
  { value: 'review', label: '리뷰' },
];

/** 04 시안: 구역별 주차현황 */
export default function LotStatusClient({
  lotId,
  initialTab,
  initialZone,
}: {
  lotId: string;
  initialTab: StatusTab;
  initialZone: ZoneId | null;
}) {
  const lot = useLotSummary(lotId)!;
  const slots = useSlots(lotId);
  const recommendation = useRecommendation(CONFIG.demo.mainDestinationId);
  const myParking = useMyCarStore((s) => s.myParking);
  const [tab, setTab] = useState<StatusTab>(initialTab);
  const [focusZone, setFocusZone] = useState<ZoneId | null>(initialZone);

  const selectZone = (z: ZoneId | null) => {
    setFocusZone(z);
    if (z) setTab('status');
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto scrollbar-none">
        <LotHero lot={lot} size="sm" backHref={`/lot/${lotId}`} />
        <div className="relative -mt-6 rounded-t-[24px] bg-white pt-4">
          <div className="space-y-3 px-4">
            <AvailabilityCard lot={lot} />
            <ZoneCardsStatus zones={lot.zoneSummaries} active={focusZone} onSelect={selectZone} />
          </div>

          <Tabs tabs={TAB_ITEMS} value={tab} onChange={setTab} className="sticky top-0 z-20 mt-3" />

          {tab === 'status' && (
            <ParkingMap
              zones={lot.zoneSummaries}
              slots={slots}
              focusZone={focusZone}
              onZoneSelect={setFocusZone}
              highlightSlotId={myParking?.lotId === lotId ? myParking.slotId : null}
              className="h-[440px]"
            />
          )}
          {tab === 'info' && (
            <div className="px-4 py-5">
              <OperationInfo lot={lot} />
            </div>
          )}
          {tab === 'review' && (
            <div className="flex flex-col items-center px-8 py-14 text-center">
              <MessageSquareText size={36} className="text-ink-muted" strokeWidth={1.6} />
              <p className="mt-3 text-[16px] font-semibold">아직 등록된 리뷰가 없어요</p>
              <p className="mt-1 text-[13.5px] text-ink-muted">주차장을 이용한 뒤 첫 리뷰를 남겨 주세요.</p>
              <button
                type="button"
                onClick={() => toast('리뷰 작성은 데모 버전에서 준비 중이에요.')}
                className="mt-5 h-10 rounded-full bg-primary-light px-5 text-[14px] font-semibold text-primary"
              >
                리뷰 쓰기
              </button>
            </div>
          )}
        </div>
      </main>
      <BottomActions
        className="border-t border-line"
        secondary={{ label: '길안내', icon: Navigation, href: `/navigate/${lotId}` }}
        primary={{
          label: '추천 구역으로 안내받기',
          icon: SquareParking,
          size: 'sm',
          href: `/navigate/${lotId}?zone=${recommendation?.zoneId ?? 'B'}`,
        }}
      />
    </>
  );
}
