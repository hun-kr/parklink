'use client';

import { useState } from 'react';
import { Building2, Home, MapPin, Navigation } from 'lucide-react';
import ScreenPlaceholder from '@/components/layout/ScreenPlaceholder';
import BottomActions from '@/components/ui/BottomActions';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { CONFIG } from '@/lib/config';
import { getCurrentLocation, getDestinations } from '@/services/parkingService';
import { useRecommendation } from '@/store/useParkingStore';

export default function DestinationPage() {
  const destinations = getDestinations();
  const location = getCurrentLocation();
  const [selectedId, setSelectedId] = useState<string>(CONFIG.demo.mainDestinationId);
  const recommendation = useRecommendation(selectedId);
  const selected = destinations.find((d) => d.id === selectedId)!;

  return (
    <ScreenPlaceholder
      title="어디로 가시나요?"
      subtitle="목적지를 고르면 가장 가까운 여유 구역을 추천해 드려요."
      step="4단계"
      footer={
        <BottomActions
          secondary={{ label: '홈으로', icon: Home, href: '/' }}
          primary={
            recommendation
              ? {
                  label: '안내받기',
                  icon: Navigation,
                  href: `/navigate/${recommendation.lotId}?zone=${recommendation.zoneId}`,
                }
              : { label: '주차장 보기', icon: MapPin, href: `/lot/${selected.lotId}` }
          }
        />
      }
    >
      <Card tone="surface" className="flex items-center gap-3 p-4">
        <MapPin size={20} className="text-primary" />
        <div>
          <p className="text-xs text-ink-muted">현재 위치</p>
          <p className="text-[15px] font-semibold">{location.label}</p>
        </div>
      </Card>

      <div className="space-y-2">
        {destinations.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelectedId(d.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left',
              d.id === selectedId ? 'border-primary bg-primary-light' : 'border-line bg-white',
            )}
          >
            <Building2 size={20} className={d.id === selectedId ? 'text-primary' : 'text-ink-muted'} />
            <span className="flex-1 text-[15px] font-semibold">{d.name}</span>
            <span className="text-xs text-ink-muted">{d.category}</span>
          </button>
        ))}
      </div>

      {recommendation ? (
        <Card className="border-primary/30 p-5">
          <p className="text-sm font-semibold text-primary">추천 Zone</p>
          <p className="mt-1 text-[22px] font-bold">
            {recommendation.zoneName} · {recommendation.availableSpaces}면 · 목적지 도보 {recommendation.walkMinutes}분
          </p>
        </Card>
      ) : (
        <Card tone="surface" className="p-5 text-sm text-ink-sub">
          이 목적지는 구역 단위 추천을 제공하지 않아요. 주차장 정보를 확인해 주세요.
        </Card>
      )}
    </ScreenPlaceholder>
  );
}
