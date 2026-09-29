'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { ZoneId } from '@/lib/types';

export interface RerouteOffer {
  from: { zone: ZoneId; before: number; after: number };
  to: { zone: ZoneId; available: number; walkMinutes: number };
}

/**
 * S08 AI 재추천: 목표 구역이 빠르게 차면 다른 구역을 제안한다.
 * 제안일 뿐이며 운전 중에도 누르기 쉽게 버튼 두 개만 둔다.
 */
export default function RerouteCard({
  offer,
  onKeep,
  onSwitch,
}: {
  offer: RerouteOffer;
  onKeep: () => void;
  onSwitch: () => void;
}) {
  const { from, to } = offer;
  return (
    <motion.div
      role="alertdialog"
      aria-label="AI 재추천"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      className="rounded-[20px] bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.18)]"
    >
      <p className="flex items-center gap-2 text-[12.5px] text-ink-muted">
        <span className="inline-flex items-center gap-1 rounded-md bg-primary-light px-1.5 py-0.5 font-bold text-primary">
          <Sparkles size={12} className="fill-primary" />
          AI
        </span>
        방금 · 경로 재추천
      </p>
      <h3 className="mt-2 text-[17px] font-bold tracking-[-0.02em]">
        {from.zone}구역이 빠르게 차고 있어요{' '}
        <span className="inline-flex items-center gap-0.5 text-zone-c">
          {from.before}면
          <ArrowRight size={15} strokeWidth={2.6} />
          {from.after}면
        </span>
      </h3>
      <p className="mt-1 text-[14px] text-ink-sub">
        {to.zone}구역({to.available}면, 도보 {to.walkMinutes}분)으로 안내할까요?
      </p>
      <div className="mt-3.5 flex gap-2">
        <button type="button" onClick={onKeep} className="h-12 flex-1 rounded-2xl bg-surface text-[15px] font-bold text-ink">
          {from.zone}구역 유지
        </button>
        <button type="button" onClick={onSwitch} className="h-12 flex-1 rounded-2xl bg-primary text-[15px] font-bold text-white">
          {to.zone}구역으로 변경
        </button>
      </div>
    </motion.div>
  );
}
