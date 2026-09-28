'use client';

import { Map, Navigation } from 'lucide-react';
import BottomTabBar from '@/components/layout/BottomTabBar';
import AiLiveBadge from '@/components/ui/AiLiveBadge';
import BottomActions from '@/components/ui/BottomActions';
import Card from '@/components/ui/Card';
import PhotoPlaceholder from '@/components/ui/PhotoPlaceholder';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from '@/store/useToastStore';

// 임시 홈: 1단계 공통 UI 확인용. 3단계에서 지도 홈으로 교체한다.
export default function HomePage() {
  return (
    <>
      <main className="flex-1 overflow-y-auto scrollbar-none px-5 pb-4 pt-8">
        <h1 className="text-[26px] font-bold">
          Park<span className="text-primary">Link</span>
        </h1>
        <p className="mt-1 text-sm text-ink-muted">공통 UI 미리보기 (지도 홈은 3단계에서 구현)</p>

        <Card className="mt-5 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold">성균관대학교 제1공학관 주차장</h2>
          </div>
          <p className="mt-1 text-sm text-ink-muted">경기도 수원시 장안구 서부로 2066</p>
          <div className="mt-3">
            <AiLiveBadge />
          </div>
          <PhotoPlaceholder className="mt-4 h-36 rounded-2xl" counter="1/5" />
        </Card>

        <Card tone="surface" className="mt-4 flex flex-wrap gap-2 p-4">
          <StatusBadge status="available" />
          <StatusBadge status="normal" />
          <StatusBadge status="busy" />
          <StatusBadge status="unknown" />
        </Card>

        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs font-bold text-white">
          <span className="rounded-lg bg-zone-a py-2">A구역</span>
          <span className="rounded-lg bg-zone-b py-2">B구역</span>
          <span className="rounded-lg bg-zone-c py-2">C구역</span>
          <span className="rounded-lg bg-zone-d py-2">D구역</span>
        </div>
      </main>
      <BottomActions
        secondary={{ label: '길안내', icon: Navigation, onClick: () => toast('길안내는 6단계에서 구현됩니다.') }}
        primary={{ label: '주차현황 보기', icon: Map, onClick: () => toast('주차현황은 5단계에서 구현됩니다.') }}
      />
      <BottomTabBar />
    </>
  );
}
