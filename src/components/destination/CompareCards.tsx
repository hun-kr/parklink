'use client';

import { motion } from 'framer-motion';
import StatusBadge from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import type { Congestion } from '@/lib/types';

export interface CompareItem {
  id: string;
  title: string;
  /** 왼쪽 세로선 색 (tailwind bg-*) */
  barClass: string;
  countText: string;
  countClass: string;
  totalText?: string;
  walkMinutes: number;
  congestion: Congestion;
  disabled: boolean;
  /** 선택 불가 사유 (만차 / 혼잡) */
  disabledLabel?: string;
}

/** 다른 후보 비교 (작은 카드 가로 배치, 04 시안 구역 카드 스타일) */
export default function CompareCards({ items, onSelect }: { items: CompareItem[]; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it) => (
        <motion.button
          key={it.id}
          layout
          type="button"
          disabled={it.disabled}
          onClick={() => onSelect(it.id)}
          aria-label={`${it.title} ${it.countText} 도보 ${it.walkMinutes}분${it.disabled ? ' 선택 불가' : ''}`}
          className={cn(
            'relative flex min-w-0 flex-col items-start overflow-hidden rounded-2xl border border-line bg-white py-3 pl-4 pr-2 text-left shadow-card transition-colors active:bg-surface',
            it.disabled && 'opacity-50',
          )}
        >
          <span className={cn('absolute bottom-3 left-2 top-3 w-[3px] rounded-full', it.barClass)} />
          <span className="w-full truncate text-[13px] font-semibold text-ink-sub">{it.title}</span>
          <span className="mt-1 flex items-baseline gap-0.5 whitespace-nowrap">
            <span className={cn('text-[18px] font-extrabold', it.countClass)}>{it.countText}</span>
            {it.totalText && <span className="text-[11px] text-ink-muted">{it.totalText}</span>}
          </span>
          <span className="mt-0.5 text-[12px] text-ink-muted">도보 {it.walkMinutes}분</span>
          <span className="mt-2">
            {it.disabled ? (
              <span className="inline-flex h-6 items-center rounded-lg bg-busy-light px-2 text-xs font-semibold text-busy">{it.disabledLabel ?? '선택 불가'}</span>
            ) : (
              <StatusBadge status={it.congestion} size="sm" />
            )}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
