import { Car } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatDateTime, formatSlotPosition } from '@/lib/format';
import type { MyParking } from '@/lib/types';

/** 내 주차 위치 요약 카드 */
export default function MyParkingCard({ parking }: { parking: MyParking }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
          <Car size={24} />
        </span>
        <div>
          <p className="text-sm text-ink-sub">내 주차 위치</p>
          <p className="mt-0.5 text-[22px] font-bold text-available">
            {formatSlotPosition(parking.zone, parking.row, parking.index)}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-[72px_1fr] gap-y-1.5 text-sm">
        <dt className="text-ink-muted">주차 시간</dt>
        <dd>{formatDateTime(parking.parkedAt)}</dd>
        <dt className="text-ink-muted">차량 번호</dt>
        <dd>{parking.plateNumber}</dd>
        <dt className="text-ink-muted">주차장</dt>
        <dd>{parking.lotName}</dd>
      </dl>
    </Card>
  );
}
