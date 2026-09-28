'use client';

import AiLiveBadge from '@/components/ui/AiLiveBadge';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { useNow } from '@/hooks/useNow';
import { formatUpdatedAgo } from '@/lib/format';
import type { LotSummary } from '@/lib/types';

const ZONE_TEXT = { green: 'text-zone-a', blue: 'text-zone-b', orange: 'text-zone-c', red: 'text-zone-d' } as const;

/** 현재 여유 주차면 + 구역별 여유면 (실시간) */
export default function LiveAvailability({ lot }: { lot: LotSummary }) {
  const now = useNow();

  return (
    <Card tone="surface" className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-[15px] font-semibold text-ink-sub">현재 여유 주차면</p>
        <StatusBadge status={lot.congestion} size="sm" />
      </div>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[44px] font-extrabold leading-none text-available">
          {lot.availableSpaces ?? '-'}
          <span className="text-[34px]">면</span>
        </span>
        <span className="text-xl text-ink-sub">/ {lot.totalSpaces}면</span>
      </p>
      {lot.isRealtime ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-sub">
          <span className="h-2 w-2 rounded-full bg-available" />
          {formatUpdatedAgo(lot.updatedAt, now)}
        </p>
      ) : (
        <p className="mt-2 text-sm text-ink-muted">실시간 정보를 제공하지 않는 주차장입니다.</p>
      )}

      {lot.zoneSummaries.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {lot.zoneSummaries.map((z) => (
            <div key={z.id} className="rounded-xl bg-white px-2 py-2.5 text-center">
              <p className="text-xs font-medium text-ink-sub">{z.name}</p>
              <p className={`mt-0.5 text-lg font-bold ${ZONE_TEXT[z.color]}`}>{z.availableSpaces}면</p>
              <p className="text-[11px] text-ink-muted">/ {z.totalSpaces}면</p>
              <StatusBadge status={z.congestion} size="sm" className="mt-1.5" />
            </div>
          ))}
        </div>
      )}
      {lot.isRealtime && lot.zoneSummaries.length > 0 && (
        <div className="mt-3">
          <AiLiveBadge />
        </div>
      )}
    </Card>
  );
}
