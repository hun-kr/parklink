import { cn } from '@/lib/cn';

/** "● AI 실시간 제공" — 초록 점 + 연초록 배경 */
export default function AiLiveBadge({
  label = 'AI 실시간 제공',
  size = 'md',
  className,
}: {
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full bg-available-light font-semibold text-available',
        size === 'sm' ? 'h-6 gap-1 px-2 text-[11.5px]' : 'h-7 gap-1.5 px-3 text-[13px]',
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-available opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-available" />
      </span>
      {label}
    </span>
  );
}
