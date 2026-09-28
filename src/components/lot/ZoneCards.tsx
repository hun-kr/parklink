'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import type { ZoneId, ZoneSummary } from '@/lib/types';
import { ZONE_COLOR } from '@/lib/zoneColors';

/** 03 시안: 구역 카드 (누르면 현황 맵에서 해당 구역 확대) */
export function ZoneCardsDetail({ lotId, zones }: { lotId: string; zones: ZoneSummary[] }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {zones.map((z) => (
        <Link
          key={z.id}
          href={`/lot/${lotId}/status?zone=${z.id}`}
          className="flex flex-col rounded-2xl border border-line bg-[#F8FAFC] px-3 py-3 active:bg-surface"
        >
          <span className="text-[13px] font-medium text-ink-sub">{z.name}</span>
          <span className="mt-1 text-[22px] font-extrabold leading-none text-primary">{z.availableSpaces}면</span>
          <span className="mt-1 text-[12px] text-ink-muted">/ {z.totalSpaces}면</span>
        </Link>
      ))}
    </div>
  );
}

/** 04 시안: 구역 카드 (색 세로선 + 상태 배지, 누르면 평면도에서 해당 구역 확대) */
export function ZoneCardsStatus({
  zones,
  active,
  onSelect,
}: {
  zones: ZoneSummary[];
  active: ZoneId | null;
  onSelect: (id: ZoneId | null) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {zones.map((z) => {
        const c = ZONE_COLOR[z.color];
        const on = active === z.id;
        return (
          <button
            key={z.id}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(on ? null : z.id)}
            className={cn(
              'relative flex min-w-0 flex-col items-start rounded-2xl border bg-white py-2.5 pl-3.5 pr-1 text-left shadow-card transition-colors',
              on ? cn('border-2', c.border) : 'border-line',
            )}
          >
            <span className={cn('absolute bottom-3 left-1.5 top-3 w-[3px] rounded-full', c.bg)} />
            <span className="flex w-full items-center justify-between text-[14px] font-semibold text-ink">
              {z.id} 구역
              <ChevronRight size={14} className="text-ink-muted" />
            </span>
            <span className={cn('mt-1 text-[19px] font-extrabold leading-tight', c.text)}>{z.availableSpaces}면</span>
            <span className="text-[11px] text-ink-muted">/ {z.totalSpaces}면</span>
            <StatusBadge status={z.congestion} size="sm" className="mt-1.5 self-center" />
          </button>
        );
      })}
    </div>
  );
}
