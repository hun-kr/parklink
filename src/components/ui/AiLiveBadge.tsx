import { cn } from '@/lib/cn';

/** "● AI 실시간 제공" — 초록 점 + 연초록 배경 */
export default function AiLiveBadge({
  label = 'AI 실시간 제공',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-available-light px-3 text-[13px] font-semibold text-available',
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
