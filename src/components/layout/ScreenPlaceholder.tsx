import { Construction } from 'lucide-react';
import TopBar from './TopBar';

/** 아직 구현 전인 화면의 공통 틀. 뒤로가기 + 제목 + 구현 예정 단계 안내 */
export default function ScreenPlaceholder({
  title,
  subtitle,
  step,
  backHref,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  step: string;
  backHref?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <>
      <TopBar backHref={backHref} />
      <main className="flex-1 overflow-y-auto scrollbar-none px-5 pb-6">
        <h1 className="text-[26px] font-bold leading-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-ink-muted">{subtitle}</p>}
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-ink-muted">
          <Construction size={14} />
          화면 디자인은 {step}에서 구현 예정
        </p>
        <div className="mt-5 space-y-4">{children}</div>
      </main>
      {footer}
    </>
  );
}
