import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ParkingLot } from '@/lib/types';

/** 03 시안: 운영 정보 표 */
export default function OperationInfo({ lot, moreHref }: { lot: ParkingLot; moreHref?: string }) {
  const { evSpaces, disabledSpaces, heightLimitM } = lot.amenities;
  const general = lot.totalSpaces - evSpaces - disabledSpaces;
  const rows: [string, string][] = [
    ['운영시간', lot.operation.hours],
    ['이용대상', lot.operation.target],
    ['주차면 수', `총 ${lot.totalSpaces}면 (일반 ${general}, 장애인 ${disabledSpaces}, 전기차 ${evSpaces})`],
    ['차량 제한', lot.operation.restriction],
  ];
  if (heightLimitM && !lot.operation.restriction.includes(`${heightLimitM}m`)) rows.push(['높이 제한', `${heightLimitM}m`]);

  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-[18px] font-bold">운영 정보</h2>
        {moreHref && (
          <Link href={moreHref} className="flex items-center text-[14px] text-ink-muted">
            더보기
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <dl className="grid grid-cols-[76px_1fr] gap-x-3 gap-y-2.5 rounded-2xl border border-line bg-[#F8FAFC] px-4 py-4 text-[14px] tracking-[-0.02em]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-ink-muted">{k}</dt>
            <dd className="text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
