import { cn } from '@/lib/cn';
import type { Congestion } from '@/lib/types';

const STYLE: Record<Congestion, { label: string; className: string }> = {
  available: { label: '여유', className: 'bg-available-light text-available' },
  normal: { label: '보통', className: 'bg-primary-light text-primary' },
  busy: { label: '혼잡', className: 'bg-busy-light text-busy' },
  unknown: { label: '정보없음', className: 'bg-unknown-light text-ink-muted' },
};

export const CONGESTION_LABEL: Record<Congestion, string> = {
  available: STYLE.available.label,
  normal: STYLE.normal.label,
  busy: STYLE.busy.label,
  unknown: STYLE.unknown.label,
};

export default function StatusBadge({
  status,
  size = 'md',
  className,
}: {
  status: Congestion;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const s = STYLE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold',
        size === 'sm' ? 'h-6 px-2.5 text-xs' : 'h-7 px-3 text-sm',
        s.className,
        className,
      )}
    >
      {s.label}
    </span>
  );
}
