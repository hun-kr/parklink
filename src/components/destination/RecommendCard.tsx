'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Clock3, Footprints, MapPin, RotateCcw, Sparkles } from 'lucide-react';
import ZoneMiniMap from '@/components/parking/ZoneMiniMap';
import AiLiveBadge from '@/components/ui/AiLiveBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { formatDistance } from '@/lib/format';
import type { RankedLot, RankedZone, ZoneSummary } from '@/lib/types';
import { ZONE_COLOR } from '@/lib/zoneColors';

function Header({ isRecommended, onReset, status }: { isRecommended: boolean; onReset: () => void; status: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      {isRecommended ? (
        <span className="inline-flex h-7 items-center gap-1 rounded-full bg-primary-light px-2.5 text-[13px] font-bold text-primary">
          <Sparkles size={14} strokeWidth={2.4} />
          AI 추천
        </span>
      ) : (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-7 items-center gap-1 rounded-full bg-surface px-2.5 text-[13px] font-semibold text-ink-sub active:bg-line"
        >
          <RotateCcw size={13} strokeWidth={2.4} />
          추천으로 되돌리기
        </button>
      )}
      {status}
    </div>
  );
}

const cardMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2 },
};

/** 구역 추천 카드: "B구역 추천 · 14면 여유 · 목적지 도보 2분" + 미니 배치도 */
export function ZoneRecommendCard({
  target,
  isRecommended,
  reason,
  zones,
  onReset,
}: {
  target: RankedZone;
  isRecommended: boolean;
  reason: string;
  zones: ZoneSummary[];
  onReset: () => void;
}) {
  const color = ZONE_COLOR[target.zone.color];
  return (
    <div className="rounded-card border-[1.5px] border-primary/40 bg-white p-4 shadow-[0_4px_18px_rgba(30,94,235,0.10)]">
      <Header isRecommended={isRecommended} onReset={onReset} status={<StatusBadge status={target.zone.congestion} size="sm" />} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={target.zone.id} {...cardMotion}>
          <p className="mt-3 text-[24px] font-extrabold leading-tight tracking-[-0.02em]">
            <span className={color.text}>{target.zone.name}</span> {isRecommended ? '추천' : '선택'}
          </p>
          <p className="mt-1 text-[15px] font-semibold text-ink-sub">
            <span className="text-available">{target.zone.availableSpaces}면 여유</span>
            <span className="mx-1.5 text-line">|</span>
            목적지 도보 {target.walkMinutes}분
          </p>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-surface p-3">
            <div className="w-[150px] shrink-0">
              <ZoneMiniMap zones={zones} highlight={target.zone.id} />
            </div>
            <div className="min-w-0 space-y-2 text-[12.5px] leading-snug text-ink-sub">
              <p className="font-semibold text-ink">{isRecommended ? reason : '직접 선택한 구역이에요'}</p>
              <p className="flex items-start gap-1">
                <Footprints size={14} className="mt-px shrink-0 text-available" />
                <span>보행 출입구에서 제1공학관까지 연결돼요</span>
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** 주차장 추천 카드 (구역 데이터가 없는 목적지) */
export function LotRecommendCard({
  target,
  isRecommended,
  onReset,
}: {
  target: RankedLot;
  isRecommended: boolean;
  onReset: () => void;
}) {
  const { lot } = target;
  return (
    <div className="rounded-card border-[1.5px] border-primary/40 bg-white p-4 shadow-[0_4px_18px_rgba(30,94,235,0.10)]">
      <Header isRecommended={isRecommended} onReset={onReset} status={<StatusBadge status={lot.congestion} size="sm" />} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={lot.id} {...cardMotion}>
          <p className="mt-3 text-[22px] font-extrabold leading-tight tracking-[-0.02em]">
            <span className="text-primary">{lot.shortName}</span> {isRecommended ? '추천' : '선택'}
          </p>
          <p className="mt-1 text-[15px] font-semibold text-ink-sub">
            {lot.availableSpaces === null ? (
              <span className="text-ink-muted">여유면 정보없음</span>
            ) : (
              <span className={lot.congestion === 'busy' ? 'text-busy' : 'text-available'}>{lot.availableSpaces}면 여유</span>
            )}
            <span className="mx-1.5 text-line">|</span>
            목적지 도보 {target.walkMinutes}분
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] text-ink-sub">
            {lot.isRealtime ? <AiLiveBadge size="sm" /> : <span className="rounded-full bg-unknown-light px-2 py-1 font-semibold text-ink-muted">실시간 미제공</span>}
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-ink-muted" />
              현재 위치에서 {formatDistance(lot.distanceM)}
            </span>
            <span className="flex items-center gap-1">
              <Clock3 size={13} className="text-ink-muted" />
              {lot.amenities.open24h ? '24시간 운영' : lot.operation.hours}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function NoRecommendCard({ message }: { message: string }) {
  return (
    <div className={cn('rounded-card bg-surface p-5 text-center text-[14px] text-ink-sub')}>{message}</div>
  );
}
