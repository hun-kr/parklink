'use client';

import { useState } from 'react';
import { useSafeBack } from '@/hooks/useSafeBack';
import { Building2, ChevronLeft, Heart, Share } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { LotSummary } from '@/lib/types';
import { toast } from '@/store/useToastStore';

const CIRCLE_BTN =
  'flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-[0_2px_10px_rgba(0,0,0,0.15)] active:scale-95 transition-transform';

/** 03/04 시안 상단: 대표 사진(없으면 placeholder) + 뒤로/찜/공유 + 제목·주소·배지 */
export default function LotHero({ lot, size, backHref = '/' }: { lot: LotSummary; size: 'lg' | 'sm'; backHref?: string }) {
  const goBack = useSafeBack(backHref);
  const [liked, setLiked] = useState(false);
  const photo = lot.photos[0];

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: lot.name, text: `${lot.name} 실시간 주차정보`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast('링크를 복사했어요.');
    } catch {
      /* 사용자가 공유를 취소한 경우 */
    }
  };

  return (
    <div className={cn('relative shrink-0 overflow-hidden', size === 'lg' ? 'h-[300px]' : 'h-[190px]')}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={lot.name} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#5B7596] via-[#3E5474] to-[#243247]">
          {size === 'lg' && <Building2 size={96} strokeWidth={1} className="-translate-y-6 text-white/15" />}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/60" />

      <div className="absolute inset-x-4 top-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="뒤로가기"
          className={CIRCLE_BTN}
          onClick={goBack}
        >
          <ChevronLeft size={26} strokeWidth={2.2} />
        </button>
        <div className="flex gap-2.5">
          <button
            type="button"
            aria-label={liked ? '찜 해제' : '찜하기'}
            aria-pressed={liked}
            className={CIRCLE_BTN}
            onClick={() => {
              setLiked(!liked);
              toast(liked ? '찜한 주차장에서 뺐어요.' : '찜한 주차장에 추가했어요.');
            }}
          >
            <Heart size={22} strokeWidth={2} className={liked ? 'fill-busy text-busy' : ''} />
          </button>
          <button type="button" aria-label="공유" className={CIRCLE_BTN} onClick={share}>
            <Share size={21} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className={cn('absolute inset-x-5', size === 'lg' ? 'bottom-10' : 'bottom-9')}>
        <h1 className={cn('font-bold leading-tight tracking-[-0.02em] text-white drop-shadow', size === 'lg' ? 'text-[24px]' : 'text-[22px]')}>
          {lot.name}
        </h1>
        <p className="mt-1 text-[14.5px] text-white/90 drop-shadow">{lot.address}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {lot.isRealtime && (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white px-3 text-[13px] font-semibold text-available">
              <span className="h-2 w-2 rounded-full bg-available" />
              AI 실시간 제공
            </span>
          )}
          {lot.tags.map((t) => (
            <span key={t} className="inline-flex h-7 items-center rounded-full bg-white/95 px-3 text-[13px] font-semibold text-ink">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
