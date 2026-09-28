import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ActionButtonProps {
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'success' | 'secondary';
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
  className,
}: ActionButtonProps) {
  const classes = cn(
    'flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl text-[17px] font-bold transition-colors',
    VARIANT[variant],
    className,
  );
  const content = (
    <>
      {Icon && <Icon size={22} strokeWidth={2.2} />}
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
