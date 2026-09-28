'use client';

import Link from 'next/link';
import { Bell, ChevronRight, CircleHelp, Heart, Car, Settings, User } from 'lucide-react';
import BottomTabBar from '@/components/layout/BottomTabBar';
import Card from '@/components/ui/Card';
import { toast } from '@/store/useToastStore';

const MENU = [
  { icon: Heart, label: '찜한 주차장' },
  { icon: Car, label: '내 차량 관리' },
  { icon: Bell, label: '알림 설정' },
  { icon: CircleHelp, label: '고객센터' },
  { icon: Settings, label: '설정' },
];

export default function MyPage() {
  return (
    <>
      <main className="flex-1 overflow-y-auto scrollbar-none px-5 pb-6 pt-8">
        <h1 className="text-[26px] font-bold">MY</h1>

        <Card className="mt-5 flex items-center gap-4 p-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
            <User size={28} />
          </span>
          <div className="flex-1">
            <p className="text-lg font-bold">파크링크 사용자</p>
            <p className="mt-0.5 text-sm text-ink-muted">등록 차량 123가 4567</p>
          </div>
        </Card>

        <Card tone="surface" className="mt-4 divide-y divide-line overflow-hidden">
          {MENU.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => toast('데모 버전에서는 준비 중인 기능입니다.')}
              className="flex w-full items-center gap-3 px-5 py-4 text-left text-[15px] font-medium active:bg-line"
            >
              <Icon size={20} className="text-ink-sub" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={18} className="text-ink-muted" />
            </button>
          ))}
        </Card>

        <Link
          href="/"
          className="pressable mt-6 flex h-14 items-center justify-center rounded-2xl bg-primary-light text-[16px] font-bold text-primary"
        >
          주차장 찾으러 가기
        </Link>

        <p className="mt-6 text-center text-xs text-ink-muted">ParkLink 데모 v0.1 · AI Vision 기반 실시간 주차정보</p>
      </main>
      <BottomTabBar />
    </>
  );
}
