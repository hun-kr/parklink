'use client';

import { Accessibility, LocateFixed, PlugZap, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { LotFilters } from '@/lib/filters';

const CHIP =
  'flex h-[34px] shrink-0 items-center gap-[3px] rounded-full border px-2 text-[12px] font-semibold tracking-[-0.02em] shadow-[0_1px_6px_rgba(17,24,39,0.10)] transition-colors';

function chipClass(active: boolean) {
  return cn(CHIP, active ? 'border-primary bg-primary-light text-primary' : 'border-[#E6E9EE] bg-white text-ink');
}

/** 필터칩: 현 지도에서 검색 / 실시간 정보만 / EV / 장애인 / 상세 필터 */
export default function FilterChips({
  filters,
  onToggle,
  onSearchHere,
  onMoreFilters,
}: {
  filters: LotFilters;
  onToggle: (key: keyof LotFilters) => void;
  onSearchHere: () => void;
  onMoreFilters: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto scrollbar-none py-1 pl-0.5">
        <button type="button" className={chipClass(false)} onClick={onSearchHere}>
          <LocateFixed size={15} className="text-primary" strokeWidth={2.4} />
          현 지도에서 검색
        </button>
        <button type="button" className={chipClass(filters.realtimeOnly)} onClick={() => onToggle('realtimeOnly')} aria-pressed={filters.realtimeOnly}>
          <span className="mx-[2px] h-2 w-2 rounded-full bg-available" />
          실시간 정보만
        </button>
        <button type="button" className={chipClass(filters.ev)} onClick={() => onToggle('ev')} aria-pressed={filters.ev}>
          <PlugZap size={14} strokeWidth={2.2} />
          EV
        </button>
        <button type="button" className={chipClass(filters.disabled)} onClick={() => onToggle('disabled')} aria-pressed={filters.disabled}>
          <Accessibility size={14} strokeWidth={2.2} />
          장애인
        </button>
      </div>
      <button
        type="button"
        aria-label="상세 필터"
        onClick={onMoreFilters}
        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-[#E6E9EE] bg-white text-ink shadow-[0_1px_6px_rgba(17,24,39,0.10)]"
      >
        <SlidersHorizontal size={17} strokeWidth={2.2} />
      </button>
    </div>
  );
}
