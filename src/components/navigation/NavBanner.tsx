'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, CircleCheck, CornerUpLeft, CornerUpRight, Mic, MicOff, SquareParking, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { toast } from '@/store/useToastStore';

export type BannerIcon = 'right' | 'left' | 'straight' | 'arrive' | 'park' | 'done';

const ICON: Record<BannerIcon, LucideIcon> = {
  right: CornerUpRight,
  left: CornerUpLeft,
  straight: ArrowUp,
  arrive: SquareParking,
  park: SquareParking,
  done: CircleCheck,
};

export interface BannerContent {
  icon: BannerIcon;
  /** 큰 글씨: "200m" */
  title: string;
  /** "우측으로 이동하세요" */
  message: string;
  /** 다음 안내: "이후 80m" + "좌측으로 이동" */
  next?: { icon: BannerIcon; label: string; message: string };
}

/** 05 시안 상단 남색 안내 배너 */
export default function NavBanner({ content, tone = 'navy' }: { content: BannerContent; tone?: 'navy' | 'green' }) {
  const [voice, setVoice] = useState(true);
  const Icon = ICON[content.icon];
  const NextIcon = content.next ? ICON[content.next.icon] : null;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[22px] text-white shadow-[0_6px_20px_rgba(17,24,39,0.25)] transition-colors duration-500',
        tone === 'green' ? 'bg-available' : 'bg-navy',
      )}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* 아이콘이 빠르게 바뀌어도 꼬이지 않도록 등장 애니메이션만 사용 */}
        <motion.span
          key={content.icon}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <Icon size={54} strokeWidth={2.6} />
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="text-[34px] font-extrabold leading-none tracking-[-0.02em] tabular-nums">{content.title}</p>
          <p className="mt-1.5 truncate text-[16.5px] font-semibold text-white/90">{content.message}</p>
        </div>
        <button
          type="button"
          aria-label={voice ? '음성 안내 끄기' : '음성 안내 켜기'}
          onClick={() => {
            setVoice(!voice);
            toast(voice ? '음성 안내를 껐어요.' : '음성 안내를 켰어요.');
          }}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 border-white/35"
        >
          {voice ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
      </div>
      {content.next && NextIcon && (
        <div className={cn('flex items-center gap-2 px-5 py-2.5', tone === 'green' ? 'bg-black/10' : 'bg-white/[0.07]')}>
          <NextIcon size={22} strokeWidth={2.6} />
          <span className="text-[16px] font-bold">{content.next.label}</span>
          <span className="mx-1.5 h-4 w-px bg-white/25" />
          <span className="truncate text-[15px] text-white/75">{content.next.message}</span>
        </div>
      )}
    </div>
  );
}
