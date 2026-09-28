import { cn } from '@/lib/cn';

/** 화면 로딩 표시: 파크링크 P 로고 + 점 3개 */
export default function PageLoading({ label = '불러오는 중', className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn('flex flex-1 flex-col items-center justify-center gap-4', className)}>
      <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-primary text-[28px] font-extrabold text-white shadow-[0_8px_20px_rgba(10,91,217,0.3)]">
        P
      </span>
      <span className="flex items-center gap-1.5 text-[14px] font-medium text-ink-muted">
        {label}
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </span>
      </span>
    </div>
  );
}
