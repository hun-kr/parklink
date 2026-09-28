import { Accessibility, Car, Clock3, PlugZap } from 'lucide-react';
import PhotoPlaceholder from '@/components/ui/PhotoPlaceholder';
import type { ParkingLot } from '@/lib/types';

/** 06/07 시안: 주차장 요약 카드 (이름·주소·사진, 선택적으로 편의 정보) */
export default function LotBriefCard({ lot, withAmenities = false }: { lot: ParkingLot; withAmenities?: boolean }) {
  const items = [
    { icon: Clock3, label: lot.amenities.open24h ? '24시간 운영' : '시간제 운영' },
    { icon: Car, label: lot.amenities.visitorAllowed ? '방문차량 가능' : '방문차량 불가' },
    { icon: PlugZap, label: `전기차 ${lot.amenities.evSpaces}면` },
    { icon: Accessibility, label: `장애인 ${lot.amenities.disabledSpaces}면` },
  ];
  return (
    <div className="rounded-[20px] border border-line bg-[#F8FAFC] p-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-bold leading-snug tracking-[-0.02em]">{lot.name}</p>
          <p className="mt-1 truncate text-[14px] text-ink-muted">{lot.address}</p>
        </div>
        <PhotoPlaceholder src={lot.photos[0]} alt={lot.name} className="h-[58px] w-[100px] shrink-0 rounded-xl" iconSize={20} />
      </div>
      {withAmenities && (
        <div className="mt-4 grid grid-cols-4">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-sub shadow-card">
                <Icon size={20} strokeWidth={1.9} />
              </span>
              <span className="mt-1.5 whitespace-nowrap text-[12px] text-ink-sub">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
