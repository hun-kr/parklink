'use client';

import { motion } from 'framer-motion';
import StatusBadge from '@/components/ui/StatusBadge';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/cn';
import { formatUpdatedAgo } from '@/lib/format';
import type { Congestion, LotSummary } from '@/lib/types';

const TONE: Record<Congestion, { text: string; bar: string }> = {
  available: { text: 'text-available', bar: 'bg-available' },
  normal: { text: 'text-primary', bar: 'bg-primary' },
  busy: { text: 'text-busy', bar: 'bg-busy' },
  unknown: { text: 'text-ink-muted', bar: 'bg-unknown' },
};

/** 여유면 → 신호 막대 칸 수 (0~5) */
export function signalLevel(available: number | null) {
  if (available === null || available <= 0) return 0;
  if (available >= 60) return 5;
  if (available >= 35) return 4;
  if (available >= 25) return 3;
  if (available >= 5) return 2;
  return 1;
}

export function SignalBars({ level, congestion }: { level: number; congestion: Congestion }) {
  return (
    <div className="flex items-end gap-[5px]" aria-label={`여유 신호 ${level}/5`}>
      {[14, 22, 30, 38, 46].map((h, i) => (
        <span
          key={h}
          className={cn('w-[7px] rounded-full transition-colors duration-500', i < level ? TONE[congestion].bar : 'bg-[#DDE2E9]')}
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

/** 03/04 시안: 현재 여유 주차면 카드 */
export default function AvailabilityCard({ lot, className }: { lot: LotSummary; className?: string }) {
  const now = useNow();
  const tone = TONE[lot.congestion];

  return (
    <div className={cn('flex items-stretch justify-between rounded-[20px] border border-line bg-[#F8FAFC] p-5', className)}>
      <div>
        <p className="text-[15px] font-semibold text-ink-sub">현재 여유 주차면</p>
        <p className="mt-1 flex items-baseline gap-1.5">
          <motion.span
            key={lot.availableSpaces ?? 'none'}
            initial={{ opacity: 0.4, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('text-[46px] font-extrabold leading-none tracking-[-0.03em]', tone.text)}
          >
            {lot.availableSpaces ?? '-'}
            <span className="text-[36px]">면</span>
          </motion.span>
          <span className="text-[21px] text-ink-sub">/ {lot.totalSpaces}면</span>
        </p>
        {lot.isRealtime ? (
          <p className="mt-2.5 flex items-center gap-1.5 text-[14px] text-ink-sub">
            <span className="h-2 w-2 rounded-full bg-available" />
            {formatUpdatedAgo(lot.updatedAt, now)}
          </p>
        ) : (
          <p className="mt-2.5 text-[14px] text-ink-muted">
            {lot.availableSpaces === null ? '실시간 정보를 제공하지 않아요' : '운영사 제공 기준 정보'}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end justify-between">
        <StatusBadge status={lot.congestion} />
        <SignalBars level={signalLevel(lot.availableSpaces)} congestion={lot.congestion} />
      </div>
    </div>
  );
}
