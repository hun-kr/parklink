import { cn } from '@/lib/cn';

/** "B구역 · 2열 · 5번째 칸" — 구역·열은 초록, 칸은 진한 글씨 (06/07 시안) */
export default function SlotPosition({
  zone,
  row,
  index,
  className,
}: {
  zone: string;
  row: number;
  index: number;
  className?: string;
}) {
  return (
    <p className={cn('font-extrabold tracking-[-0.02em]', className)}>
      <span className="text-available">
        {zone}구역 · {row}열 ·
      </span>{' '}
      <span className="text-ink">{index}번째 칸</span>
    </p>
  );
}
