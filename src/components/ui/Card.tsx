import { cn } from '@/lib/cn';

/** 흰 배경 + 큰 라운드 + 옅은 그림자. tone="surface" 는 연회색 박스 */
export default function Card({
  children,
  tone = 'white',
  className,
}: {
  children: React.ReactNode;
  tone?: 'white' | 'surface';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-card',
        tone === 'white' ? 'border border-line bg-white shadow-card' : 'bg-surface',
        className,
      )}
    >
      {children}
    </div>
  );
}
