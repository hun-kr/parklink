'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, Copy, MapPin, SquareArrowOutUpRight } from 'lucide-react';
import MapView, { type MapMarker } from '@/components/map/MapView';
import type { LotSummary } from '@/lib/types';
import { FOCUS_SCALE } from '@/mocks/mapFeatures';
import { getDestinations } from '@/services/parkingService';
import { useMapUiStore } from '@/store/useMapUiStore';
import { toast } from '@/store/useToastStore';

const PREVIEW_SCALE = 1.3;

/** 03 시안: 주소 + 복사 + 미니 지도 + '지도에서 보기' */
export default function AddressCard({ lot }: { lot: LotSummary }) {
  const router = useRouter();
  const { selectLot, saveView } = useMapUiStore();
  const building = getDestinations().find((d) => d.lotId === lot.id && lot.zones);

  const openOnMap = () => {
    selectLot(lot.id);
    // 홈 지도에서 02 시안과 같은 위치(바텀시트 위)로 보이도록
    saveView({ center: { x: lot.position.x + 33, y: lot.position.y + 122 }, scale: FOCUS_SCALE });
    router.push('/');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(lot.address);
      toast('주소를 복사했어요.');
    } catch {
      toast(lot.address);
    }
  };

  const markers: MapMarker[] = building
    ? [
        {
          id: 'building',
          position: building.position,
          element: (
            <span
              className="block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[12.5px] font-semibold text-ink-sub"
              style={{ textShadow: '0 0 3px #fff, 0 0 3px #fff' }}
            >
              {building.name}
            </span>
          ),
        },
      ]
    : [];

  return (
    <div className="rounded-2xl border border-line bg-white p-3.5 shadow-card">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <MapPin size={19} className="fill-primary text-white" strokeWidth={2} />
        </span>
        <p className="min-w-0 flex-1 truncate text-[14px] font-medium tracking-[-0.02em]">{lot.address}</p>
        <button type="button" aria-label="주소 복사" onClick={copy} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-sub active:bg-surface">
          <Copy size={18} />
        </button>
        <button type="button" aria-label="지도에서 보기" onClick={openOnMap} className="flex h-8 w-6 items-center justify-center text-ink-sub">
          <ChevronRight size={20} />
        </button>
      </div>

      <button type="button" onClick={openOnMap} className="relative mt-3 block h-[118px] w-full overflow-clip rounded-xl bg-[#F1F2EE] text-left" aria-label="지도에서 보기">
        {/* 미리보기 지도: 조작 없이 보기만 한다 */}
        <div className="pointer-events-none absolute inset-0">
          <MapView initialView={{ center: lot.position, scale: PREVIEW_SCALE }} markers={markers} />
        </div>
        <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border-[1.5px] border-primary bg-white py-1 pl-1 pr-3 shadow-float">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[13px] font-extrabold text-white">P</span>
          <span className="text-[12.5px] font-bold text-primary">{lot.shortName}</span>
        </span>
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[12.5px] font-semibold text-ink shadow-float">
          <SquareArrowOutUpRight size={14} />
          지도에서 보기
        </span>
      </button>
    </div>
  );
}
