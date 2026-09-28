'use client';

import { useRouter } from 'next/navigation';
import { CircleCheck, Home, X } from 'lucide-react';
import ScreenPlaceholder from '@/components/layout/ScreenPlaceholder';
import BottomActions from '@/components/ui/BottomActions';
import Card from '@/components/ui/Card';
import { CONFIG } from '@/lib/config';
import { formatSlotPosition } from '@/lib/format';
import type { ZoneId } from '@/lib/types';
import { DEMO_SLOT_ID } from '@/mocks/lotLayout';
import { useMyCarStore } from '@/store/useMyCarStore';
import { useLotSummary, useRecommendation, useSlots } from '@/store/useParkingStore';

export default function NavigateClient({ lotId, zoneId }: { lotId: string; zoneId: ZoneId | null }) {
  const router = useRouter();
  const lot = useLotSummary(lotId)!;
  const slots = useSlots(lotId);
  const recommendation = useRecommendation(CONFIG.demo.mainDestinationId);
  const park = useMyCarStore((s) => s.park);

  // 목표 구역: 쿼리의 zone → 없으면 추천 구역
  const targetZone = zoneId ?? (recommendation?.lotId === lotId ? recommendation.zoneId : null);
  const emptyInZone = slots
    .filter((s) => s.zone === targetZone && s.status === 'empty')
    .sort((a, b) => a.row - b.row || a.index - b.index);
  const targetSlot = emptyInZone.find((s) => s.id === DEMO_SLOT_ID) ?? emptyInZone[0] ?? null;

  const handleParked = () => {
    if (!targetSlot) return;
    park({
      lotId: lot.id,
      lotName: lot.name,
      address: lot.address,
      zone: targetSlot.zone,
      row: targetSlot.row,
      index: targetSlot.index,
      slotId: targetSlot.id,
    });
    router.push('/parked');
  };

  return (
    <ScreenPlaceholder
      title="길안내"
      subtitle={lot.name}
      step="6단계"
      backHref={`/lot/${lotId}`}
      footer={
        <BottomActions
          secondary={{ label: '안내 종료', icon: X, href: `/lot/${lotId}` }}
          primary={
            targetSlot
              ? { label: '주차 완료', icon: CircleCheck, variant: 'success', onClick: handleParked }
              : { label: '홈으로', icon: Home, href: '/' }
          }
        />
      }
    >
      <Card tone="surface" className="p-5">
        <p className="text-sm font-semibold text-primary">안내 목표</p>
        <p className="mt-1 text-xl font-bold">
          {targetSlot ? formatSlotPosition(targetSlot.zone, targetSlot.row, targetSlot.index) : lot.shortName}
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Mock 차량 이동 애니메이션과 턴바이턴 안내는 6단계에서 구현됩니다. 지금은 &lsquo;주차 완료&rsquo;로 다음
          단계를 확인할 수 있어요.
        </p>
      </Card>
    </ScreenPlaceholder>
  );
}
