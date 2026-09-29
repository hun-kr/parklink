import { cn } from '@/lib/cn';

/**
 * 파크링크 기본 심볼 (기획안 06 서비스 BI): 파랑 P(Park) + 초록 기둥(Link).
 * tone="white" 는 파란 바탕(앱 아이콘) 위에 쓰는 흰 P.
 */
export const SYMBOL_PATHS = {
  /** P 윗부분·볼 (가운데 구멍은 evenodd) */
  park: 'M12 12a4 4 0 0 1 4-4h22a16 16 0 0 1 0 32H12Z M26 18v12h12a6 6 0 0 0 0-12Z',
  /** 기둥: 볼 아래에서 곡선으로 이어져 내려온다 */
  link: 'M12 47c0-8.3 6.7-15 15-15h9v8h-7a3 3 0 0 0-3 3v10a7 7 0 0 1-14 0Z',
};

export default function BrandSymbol({
  size = 64,
  tone = 'primary',
  className,
}: {
  size?: number;
  tone?: 'primary' | 'white';
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cn('shrink-0', className)} aria-hidden>
      <path d={SYMBOL_PATHS.park} fillRule="evenodd" fill={tone === 'white' ? '#FFFFFF' : '#1E5EEB'} />
      <path d={SYMBOL_PATHS.link} fill="#2FAF56" />
    </svg>
  );
}

/** 워드마크: PARK(Blue) + LINK(Green) */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-extrabold tracking-[0.14em]', className)} aria-label="ParkLink">
      <span className="text-primary">PARK</span>
      <span className="text-available">LINK</span>
    </span>
  );
}
