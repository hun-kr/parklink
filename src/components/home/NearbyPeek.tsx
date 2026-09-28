'use client';

import { ChevronUp } from 'lucide-react';

/** 하단 미리보기 시트: "주변 주차장 N곳" */
export default function NearbyPeek({ count, onOpen }: { count: number; onOpen: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className="rounded-t-[24px] bg-white px-5 pb-4 pt-2.5 shadow-[0_-4px_18px_rgba(17,26,46,0.08)]"
    >
      <div className="flex justify-center">
        <span className="h-1 w-10 rounded-full bg-[#D5DAE1]" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[19px] font-bold">
            주변 주차장 <span className="text-primary">{count}곳</span>
          </p>
          <p className="mt-1 truncate text-[13.5px] text-ink-muted">지도를 이동하면 주변 주차장이 업데이트됩니다.</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-primary">
          <ChevronUp size={24} strokeWidth={2.4} />
        </span>
      </div>
    </div>
  );
}
