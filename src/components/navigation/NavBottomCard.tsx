'use client';

import { X } from 'lucide-react';
import AiLiveBadge from '@/components/ui/AiLiveBadge';
import type { LotSummary } from '@/lib/types';

/** 05 시안 하단: 주차장 정보 + 도착 예정·남은 거리·도착 시각 + 안내 종료 */
export default function NavBottomCard({
  lot,
  minutes,
  distance,
  eta,
  targetLabel,
  onEnd,
}: {
  lot: LotSummary;
  minutes: string;
  distance: string;
  eta: string;
  targetLabel?: string;
  onEnd: () => void;
}) {
  return (
    <div className="relative z-20 shrink-0 rounded-t-[24px] bg-white px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-2.5 shadow-[0_-6px_24px_rgba(17,26,46,0.10)]">
      <div className="flex justify-center">
        <span className="h-1 w-10 rounded-full bg-[#D5DAE1]" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <h2 className="truncate text-[19px] font-bold tracking-[-0.02em]">{lot.name}</h2>
        {lot.isRealtime && <AiLiveBadge size="sm" />}
      </div>
      <p className="mt-0.5 text-[14px] text-ink-muted">{lot.address}</p>
      {targetLabel && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary-light px-2.5 py-1 text-[13px] font-semibold text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {targetLabel}
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 divide-x divide-line">
        <div className="pr-3">
          <p className="text-[30px] font-extrabold leading-none tracking-[-0.02em] text-available tabular-nums">{minutes}</p>
          <p className="mt-1.5 text-[13px] text-ink-muted">도착 예정</p>
        </div>
        <div className="px-4">
          <p className="text-[26px] font-bold leading-none tracking-[-0.02em] tabular-nums">{distance}</p>
          <p className="mt-2 text-[13px] text-ink-muted">남은 거리</p>
        </div>
        <div className="pl-4">
          <p className="whitespace-nowrap text-[22px] font-bold leading-none tracking-[-0.02em] tabular-nums">{eta}</p>
          <p className="mt-2.5 text-[13px] text-ink-muted">도착 예정</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onEnd}
        className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-line bg-surface text-[16.5px] font-semibold text-ink active:bg-line"
      >
        <X size={22} strokeWidth={2.2} />
        안내 종료
      </button>
    </div>
  );
}
