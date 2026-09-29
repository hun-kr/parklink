'use client';

import { LocateFixed, Minus, Navigation, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

const BTN = 'flex h-[44px] w-[44px] items-center justify-center bg-white text-ink active:bg-surface';

/** 오른쪽 지도 컨트롤: 현재 위치 / 확대·축소 / 길찾기 */
export default function MapControls({
  onLocate,
  onZoomIn,
  onZoomOut,
  onNavigate,
  showNavigate = true,
}: {
  onLocate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onNavigate?: () => void;
  showNavigate?: boolean;
}) {
  const shadow = 'shadow-[0_2px_10px_rgba(17,24,39,0.14)]';
  return (
    <div className="flex flex-col items-end gap-4">
      <button type="button" aria-label="현재 위치" onClick={onLocate} className={cn(BTN, 'rounded-[14px]', shadow)}>
        <LocateFixed size={22} strokeWidth={2.2} />
      </button>
      <div className={cn('flex flex-col overflow-hidden rounded-[14px]', shadow)}>
        <button type="button" aria-label="확대" onClick={onZoomIn} className={BTN}>
          <Plus size={22} strokeWidth={2.2} />
        </button>
        <span className="mx-2.5 h-px bg-line" />
        <button type="button" aria-label="축소" onClick={onZoomOut} className={BTN}>
          <Minus size={22} strokeWidth={2.2} />
        </button>
      </div>
      {showNavigate && onNavigate && (
        <button type="button" aria-label="길찾기" onClick={onNavigate} className={cn(BTN, 'rounded-[14px]', shadow)}>
          <Navigation size={22} className="fill-primary text-primary" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
