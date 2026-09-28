import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ActionButtonProps {
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'success' | 'secondary';
  /** sm: 긴 라벨용 작은 글자 */
  size?: 'md' | 'sm';
  className?: string;
}

const VARIANT = {
  primary: 'bg-primary text-white active:bg-primary-dark',
  success: 'bg-available text-white active:bg-available-dark',
  secondary: 'bg-primary-light text-primary active:bg-[#DCE8FD]',
};

export function ActionButton({
  label,
  icon: Icon,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
}: ActionButtonProps) {
  const classes = cn(
    'pressable flex h-[52px] min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-bold tracking-[-0.02em]',
    size === 'sm' ? 'text-[15px] max-[380px]:text-[14px]' : 'text-[16.5px]',
    VARIANT[variant],
    className,
  );
  const content = (
    <>
      {Icon && <Icon size={size === 'sm' ? 20 : 22} strokeWidth={2.2} className={cn('shrink-0', size === 'sm' && 'max-[380px]:hidden')} />}
      {label}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} onClick={onClick}>
      {content}
    </button>
  );
}

/** 하단 2버튼 구조: 왼쪽 연한 파랑 보조 / 오른쪽 진한 파랑·초록 주요 */
export default function BottomActions({
  secondary,
  primary,
  className,
}: {
  secondary?: Omit<ActionButtonProps, 'variant'>;
  primary: ActionButtonProps;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 gap-3 bg-white px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3',
        className,
      )}
    >
      {secondary && <ActionButton {...secondary} variant="secondary" />}
      <ActionButton {...primary} variant={primary.variant ?? 'primary'} />
    </div>
  );
}
