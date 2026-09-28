'use client';

import { Map, Navigation } from 'lucide-react';
import ScreenPlaceholder from '@/components/layout/ScreenPlaceholder';
import LiveAvailability from '@/components/parking/LiveAvailability';
import BottomActions from '@/components/ui/BottomActions';
import { useLotSummary } from '@/store/useParkingStore';

export default function LotDetailClient({ lotId }: { lotId: string }) {
  const lot = useLotSummary(lotId)!;

  return (
    <ScreenPlaceholder
      title={lot.name}
      subtitle={lot.address}
      step="5단계"
      backHref="/"
      footer={
        <BottomActions
          secondary={{ label: '길안내', icon: Navigation, href: `/navigate/${lot.id}` }}
          primary={
            lot.zones
              ? { label: '주차현황 보기', icon: Map, href: `/lot/${lot.id}/status` }
              : { label: '홈으로', icon: Map, href: '/' }
          }
        />
      }
    >
      <LiveAvailability lot={lot} />
    </ScreenPlaceholder>
  );
}
