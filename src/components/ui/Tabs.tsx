'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

/** 04 시안 탭: 활성 탭 아래 남색 밑줄 */
export default function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn('flex border-b border-line bg-white', className)}>
      {tabs.map((t) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.value)}
            className={cn('relative h-12 flex-1 text-[16px]', on ? 'font-bold text-ink' : 'font-medium text-ink-muted')}
          >
            {t.label}
            {on && <motion.span layoutId="tab-underline" className="absolute inset-x-5 bottom-0 h-[3px] rounded-full bg-navy" />}
          </button>
        );
      })}
    </div>
  );
}
