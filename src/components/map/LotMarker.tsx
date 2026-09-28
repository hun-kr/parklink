'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import type { Congestion, LotSummary } from '@/lib/types';

export type LotMarkerVariant = 'full' | 'compact' | 'selected';

/** 마커 색: 여유 초록 / 보통 파랑 / 혼잡 빨강 / 정보없음 회색 */
const TONE: Record<Congestion, { circle: string; text: string; border: string; bg: string; tail: string }> = {
  available: { circle: 'bg-available', text: 'text-available', border: 'border-available', bg: 'bg-white', tail: 'border-available bg-white' },
  normal: { circle: 'bg-primary', text: 'text-primary', border: 'border-primary', bg: 'bg-white', tail: 'border-primary bg-white' },
  busy: { circle: 'bg-busy', text: 'text-busy', border: 'border-busy', bg: 'bg-[#FFF6F6]', tail: 'border-busy bg-[#FFF6F6]' },
  unknown: { circle: 'bg-[#5F6672]', text: 'text-ink', border: 'border-[#E3E6EB]', bg: 'bg-white', tail: 'border-[#E3E6EB] bg-white' },
};

/** 말풍선 꼬리 중심이 왼쪽에서 떨어진 거리(px). 이 지점이 지도 좌표에 놓인다. */
const TAIL_X = 24;
const TAIL_SIZE = 12;

function Tail({ className, left = TAIL_X }: { className: string; left?: number }) {
  return (
    <span
      className={cn('absolute rotate-45 border-b-[1.5px] border-r-[1.5px]', className)}
      style={{ width: TAIL_SIZE, height: TAIL_SIZE, left: left - TAIL_SIZE / 2, bottom: -TAIL_SIZE / 2 + 0.5 }}
    />
  );
}

function PCircle({ className, size = 28 }: { className: string; size?: number }) {
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-full font-extrabold text-white', className)}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      P
    </span>
  );
}

/** 숫자가 바뀌면 살짝 튀어 오르는 애니메이션 */
function LiveNumber({ value, className }: { value: string; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.25 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className={cn('inline-block origin-left', className)}
    >
      {value}
    </motion.span>
  );
}

function nameLines(name: string) {
  const prefix = '성균관대학교 ';
  return name.startsWith(prefix) ? [prefix.trim(), name.slice(prefix.length)] : [name];
}

export default function LotMarker({
  lot,
  variant,
  onClick,
}: {
  lot: LotSummary;
  variant: LotMarkerVariant;
  onClick?: () => void;
}) {
  const tone = TONE[lot.congestion];
  const unknown = lot.availableSpaces === null;
  const count = unknown ? '-' : `${lot.availableSpaces}면`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  if (variant === 'selected') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={`${lot.name} 선택됨`}
        className="relative block text-left"
        style={{ transform: `translate(-${TAIL_X - 2}px, calc(-100% - ${TAIL_SIZE / 2 + 2}px))` }}
      >
        <motion.span
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative flex origin-bottom-left flex-col items-end drop-shadow-[0_4px_10px_rgba(10,91,217,0.3)]"
        >
          <span className="relative flex items-center gap-2 rounded-[12px] bg-primary py-2 pl-2 pr-3.5">
            <PCircle className="!bg-white !text-primary" size={30} />
            <span className="whitespace-nowrap text-[13.5px] font-bold leading-[1.3] text-white">
              {nameLines(lot.name).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </span>
            <Tail className="border-primary bg-primary" left={TAIL_X - 2} />
          </span>
          <span className="-mt-px mr-0 whitespace-nowrap rounded-b-[10px] border-[1.5px] border-t-0 border-primary bg-white px-2.5 py-1 text-[12px] font-medium text-ink-sub">
            <LiveNumber value={count} className={cn('text-[13px] font-extrabold', tone.text)} /> / {lot.totalSpaces}면
            {lot.isRealtime && <span className="font-semibold text-primary"> · 실시간</span>}
          </span>
        </motion.span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={`${lot.name} ${unknown ? '정보없음' : count}`}
        className={cn(
          'relative flex items-center gap-1.5 rounded-[12px] border-[1.5px] border-white bg-white p-1.5 shadow-float',
          !unknown && 'pr-2.5',
        )}
        style={{ transform: `translate(-${unknown ? 17 : TAIL_X - 4}px, calc(-100% - ${TAIL_SIZE / 2}px))` }}
      >
        <PCircle className={tone.circle} size={26} />
        {!unknown && <LiveNumber value={count} className="text-[15px] font-bold text-ink" />}
        <Tail className="border-white bg-white" left={unknown ? 17 : TAIL_X - 4} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${lot.name} ${unknown ? '정보없음' : count}`}
      className={cn(
        'relative flex items-center gap-1.5 rounded-[12px] border-[1.5px] py-[5px] pl-1.5 pr-2.5 text-left shadow-float',
        tone.border,
        tone.bg,
      )}
      style={{ transform: `translate(-${TAIL_X}px, calc(-100% - ${TAIL_SIZE / 2}px))` }}
    >
      <PCircle className={tone.circle} size={26} />
      <span className="flex flex-col leading-[1.2]">
        <LiveNumber value={count} className={cn('text-[16px] font-extrabold', tone.text)} />
        <span className={cn('whitespace-nowrap text-[11px] font-medium', lot.congestion === 'busy' ? 'text-busy' : 'text-ink-sub')}>
          {unknown ? (
            '정보없음'
          ) : (
            <>
              / {lot.totalSpaces}면
              {lot.congestion === 'busy' ? (
                <span className="font-semibold"> · 혼잡</span>
              ) : (
                lot.isRealtime && <span className={cn('font-semibold', tone.text)}> · 실시간</span>
              )}
            </>
          )}
        </span>
      </span>
      <Tail className={tone.tail} />
    </button>
  );
}
