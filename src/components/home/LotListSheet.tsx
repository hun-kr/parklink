'use client';

import { ChevronRight } from 'lucide-react';
import BottomSheet from '@/components/ui/BottomSheet';
import StatusBadge from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { formatDistance } from '@/lib/format';
import type { Congestion, LotSummary } from '@/lib/types';

const CIRCLE: Record<Congestion, string> = {
  available: 'bg-available',
  normal: 'bg-primary',
  busy: 'bg-busy',
  unknown: 'bg-[#5F6672]',
};

/** 목록보기: 주변 주차장을 거리순으로 */
export default function LotListSheet({
  open,
  lots,
  onClose,
  onSelect,
}: {
  open: boolean;
  lots: LotSummary[];
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const sorted = [...lots].sort((a, b) => a.distanceM - b.distanceM);

  return (
    <BottomSheet open={open} onClose={onClose} backdrop className="max-h-[72%]">
      <div className="shrink-0 px-5 pb-2 pt-2">
        <p className="text-[19px] font-bold">
          주변 주차장 <span className="text-primary">{lots.length}곳</span>
        </p>
        <p className="mt-0.5 text-[13px] text-ink-muted">가까운 순</p>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto scrollbar-none px-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        {sorted.map((lot) => (
          <li key={lot.id}>
            <button
              type="button"
              onClick={() => onSelect(lot.id)}
              className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left active:bg-surface"
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white',
                  CIRCLE[lot.congestion],
                )}
              >
                P
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold">{lot.name}</span>
                <span className="mt-0.5 block text-[13px] text-ink-muted">
                  {lot.availableSpaces === null ? '정보없음' : `${lot.availableSpaces}면 / ${lot.totalSpaces}면`}
                  {' · '}
                  {formatDistance(lot.distanceM)}
                  {lot.isRealtime && <span className="whitespace-nowrap font-semibold text-available"> · 실시간</span>}
                </span>
              </span>
              <StatusBadge status={lot.congestion} size="sm" />
              <ChevronRight size={18} className="shrink-0 text-ink-muted" />
            </button>
          </li>
        ))}
        {sorted.length === 0 && (
          <li className="py-10 text-center text-sm text-ink-muted">조건에 맞는 주차장이 없어요. 필터를 해제해 보세요.</li>
        )}
      </ul>
    </BottomSheet>
  );
}
