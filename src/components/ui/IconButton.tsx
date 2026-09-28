import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/** 지도·헤더 위에 뜨는 흰색 원형/사각 아이콘 버튼 */
export default function IconButton({
  icon: Icon,
  label,
  onClick,
  shape = 'circle',
  size = 44,
  iconSize = 22,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  shape?: 'circle' | 'rounded';
  size?: number;
  iconSize?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{ width: size, height: size }}
      className={cn(
        'flex shrink-0 items-center justify-center bg-white text-ink shadow-float transition-transform active:scale-95',
        shape === 'circle' ? 'rounded-full' : 'rounded-xl',
        className,
      )}
    >
      <Icon size={iconSize} strokeWidth={2} />
    </button>
  );
}
