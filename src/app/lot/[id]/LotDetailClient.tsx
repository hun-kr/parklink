'use client';

import { useRouter } from 'next/navigation';
import { Map, MapPinned, Navigation } from 'lucide-react';
import AddressCard from '@/components/lot/AddressCard';
import AvailabilityCard from '@/components/lot/AvailabilityCard';
import LotHero from '@/components/lot/LotHero';
import OperationInfo from '@/components/lot/OperationInfo';
import { ZoneCardsDetail } from '@/components/lot/ZoneCards';
import BottomActions from '@/components/ui/BottomActions';
import { useMapUiStore } from '@/store/useMapUiStore';
import { useLotSummary } from '@/store/useParkingStore';

/** 03 시안: 주차장 상세 */
export default function LotDetailClient({ lotId }: { lotId: string }) {
  const router = useRouter();
  const lot = useLotSummary(lotId)!;
  const selectLot = useMapUiStore((s) => s.selectLot);

  return (
    <>
      <main className="flex-1 overflow-y-auto scrollbar-none">
        <LotHero lot={lot} size="lg" />
        <div className="relative -mt-6 space-y-3 rounded-t-[24px] bg-white px-4 pb-6 pt-4">
          <AvailabilityCard lot={lot} />
          {lot.zoneSummaries.length > 0 && <ZoneCardsDetail lotId={lot.id} zones={lot.zoneSummaries} />}
          <AddressCard lot={lot} />
          <div className="pt-3">
            <OperationInfo lot={lot} moreHref={lot.zones ? `/lot/${lot.id}/status?tab=info` : undefined} />
          </div>
        </div>
      </main>
      <BottomActions
        className="border-t border-line"
        secondary={{ label: '길안내', icon: Navigation, href: `/navigate/${lot.id}` }}
        primary={
          lot.zones
            ? { label: '주차현황 보기', icon: Map, href: `/lot/${lot.id}/status` }
            : {
                label: '지도에서 보기',
                icon: MapPinned,
                onClick: () => {
                  selectLot(lot.id);
                  router.push('/');
                },
              }
        }
      />
    </>
  );
}
