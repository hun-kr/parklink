'use client';

import { Navigation, Sparkles } from 'lucide-react';
import ScreenPlaceholder from '@/components/layout/ScreenPlaceholder';
import LiveAvailability from '@/components/parking/LiveAvailability';
import BottomActions from '@/components/ui/BottomActions';
import Card from '@/components/ui/Card';
import { CONFIG } from '@/lib/config';
import { useLotSummary, useRecommendation, useSlots } from '@/store/useParkingStore';

export default function LotStatusClient({ lotId }: { lotId: string }) {
  const lot = useLotSummary(lotId)!;
  const slots = useSlots(lotId);
  const recommendation = useRecommendation(CONFIG.demo.mainDestinationId);
  const count = (status: string) => slots.filter((s) => s.status === status).length;

  return (
    <ScreenPlaceholder
      title="구역별 주차현황"
      subtitle={lot.name}
      step="5단계"
      backHref={`/lot/${lotId}`}
      footer={
        <BottomActions
          secondary={{ label: '길안내', icon: Navigation, href: `/navigate/${lotId}` }}
          primary={{
            label: '추천 구역으로 안내받기',
            icon: Sparkles,
            href: `/navigate/${lotId}?zone=${recommendation?.zoneId ?? 'B'}`,
          }}
        />
      }
    >
      <LiveAvailability lot={lot} />
      <Card tone="surface" className="p-5 text-sm text-ink-sub">
        <p className="font-semibold text-ink">칸 단위 데이터 ({slots.length}칸)</p>
        <p className="mt-1">
          비어있음 {count('empty')} · 주차중 {count('occupied')} · 정보없음 {count('unknown')}
        </p>
        {recommendation && (
          <p className="mt-1">
            추천: {recommendation.zoneName} · {recommendation.availableSpaces}면 · 도보 {recommendation.walkMinutes}분
          </p>
        )}
      </Card>
    </ScreenPlaceholder>
  );
}
