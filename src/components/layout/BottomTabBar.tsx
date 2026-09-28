'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useMyCarStore } from '@/store/useMyCarStore';

function ParkingTabIcon({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'flex h-[26px] w-[26px] items-center justify-center rounded-md text-[17px] font-extrabold leading-none',
        active ? 'bg-primary text-white' : 'border-2 border-current',
      )}
    >
      P
    </span>
  );
}

const TABS = [
  { href: '/', label: '주차장', match: (p: string) => p === '/' || p.startsWith('/lot') || p.startsWith('/destination') },
  { href: '/my-car', label: '내 주차', match: (p: string) => p.startsWith('/my-car') },
  { href: '/my', label: 'MY', match: (p: string) => p === '/my' },
] as const;

export default function BottomTabBar() {
  const pathname = usePathname();
  const hasCar = useMyCarStore((s) => s.hydrated && !!s.myParking);

  return (
    <nav className="flex shrink-0 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex h-[64px] flex-1 flex-col items-center justify-center gap-1 text-[12px] font-semibold',
              active ? 'text-primary' : 'text-ink-muted',
            )}
          >
            {tab.href === '/' ? (
              <ParkingTabIcon active={active} />
            ) : tab.href === '/my-car' ? (
              <span className="relative">
                <Car size={26} strokeWidth={1.8} />
                {hasCar && (
                  <span aria-label="저장된 주차 위치 있음" className="absolute -right-1 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-available" />
                )}
              </span>
            ) : (
              <User size={26} strokeWidth={1.8} />
            )}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
