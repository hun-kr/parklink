'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/cn';

/** 흰 배경 화면용 상단 바: 뒤로가기 + (선택) 오른쪽 액션 */
export default function TopBar({
  onBack,
  backHref,
  right,
  className,
}: {
  onBack?: () => void;
  /** 히스토리가 없을 때(직접 진입) 돌아갈 경로 */
  backHref?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (window.history.length > 1) router.back();
    else router.push(backHref ?? '/');
  };

  return (
    <div className={cn('flex h-14 shrink-0 items-center justify-between px-2', className)}>
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={handleBack}
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink active:bg-surface"
      >
        <ChevronLeft size={28} strokeWidth={2.2} />
      </button>
      <div className="flex items-center gap-2 pr-2">{right}</div>
    </div>
  );
}
