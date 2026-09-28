'use client';

import { useState } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import { Building2, GraduationCap, TrainFront, Trees } from 'lucide-react';
import { cn } from '@/lib/cn';
import { LABELS, type LabelKind } from '@/mocks/mapFeatures';

const HALO = '0 0 2px #fff, 0 0 2px #fff, 0 0 3px #fff, 0 0 4px #fff';

const TEXT_STYLE: Record<LabelKind, string> = {
  school: 'text-[12.5px] font-semibold text-[#4B5563]',
  building: 'text-[12px] font-semibold text-[#5B6474]',
  park: 'text-[12.5px] font-semibold text-[#2F8F4E]',
  station: 'text-[13px] font-bold text-[#1F2937]',
  water: 'text-[13px] font-semibold text-[#4E86BD]',
  area: 'text-[14px] font-semibold tracking-wide text-[#A3AAB6]',
  campus: 'text-[12px] font-bold text-[#4E7A45]',
};

function LabelIcon({ kind }: { kind: LabelKind }) {
  if (kind === 'water' || kind === 'area' || kind === 'campus') return null;
  const Icon = kind === 'school' ? GraduationCap : kind === 'park' ? Trees : kind === 'station' ? TrainFront : Building2;
  const bg = kind === 'park' ? 'bg-[#3BA55C]' : kind === 'station' ? 'bg-[#0B3E91]' : 'bg-[#9AA3B2]';
  return (
    <span className={cn('mb-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full ring-2 ring-white', bg)}>
      <Icon size={11} className="text-white" strokeWidth={2.4} />
    </span>
  );
}

/** 지명 라벨: 월드 좌표에 놓이지만 확대해도 글자 크기는 유지 */
export default function MapLabels({ scale, inverse }: { scale: MotionValue<number>; inverse: MotionValue<number> }) {
  const [current, setCurrent] = useState(scale.get());
  // 배율 구간이 바뀔 때만 다시 그린다
  useMotionValueEvent(scale, 'change', (s) => {
    const bucket = Math.round(s * 20) / 20;
    if (bucket !== Math.round(current * 20) / 20) setCurrent(s);
  });
  const opacity = useTransform(scale, [0.3, 0.4], [0, 1]);

  return (
    <>
      {LABELS.filter(
        (l) => (l.minScale === undefined || current >= l.minScale) && (l.maxScale === undefined || current < l.maxScale),
      ).map((l) => (
        <div key={l.id} className="pointer-events-none absolute" style={{ left: l.position.x, top: l.position.y }}>
          <motion.div style={{ scale: inverse, opacity, originX: 0, originY: 0 }}>
            <div
              className={cn(
                'flex -translate-x-1/2 -translate-y-1/2 flex-col items-center whitespace-pre text-center leading-tight',
                TEXT_STYLE[l.kind],
              )}
              style={{ textShadow: HALO }}
            >
              <LabelIcon kind={l.kind} />
              {l.text}
            </div>
          </motion.div>
        </div>
      ))}
    </>
  );
}
