'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSafeBack } from '@/hooks/useSafeBack';
import { ChevronRight, Home, Map, MapPin, Navigation, ReceiptText } from 'lucide-react';
import CompareCards, { type CompareItem } from '@/components/destination/CompareCards';
import DestinationList, { type DestinationItem } from '@/components/destination/DestinationList';
import { LotRecommendCard, NoRecommendCard, ZoneRecommendCard } from '@/components/destination/RecommendCard';
import SearchHeader from '@/components/destination/SearchHeader';
import AiLiveBadge from '@/components/ui/AiLiveBadge';
import BottomActions from '@/components/ui/BottomActions';
import StatusBadge from '@/components/ui/StatusBadge';
import { useNow } from '@/hooks/useNow';
import { formatUpdatedAgo } from '@/lib/format';
import { zoneReason } from '@/lib/recommend';
import type { Congestion, DestinationPlan, RankedLot, RankedZone } from '@/lib/types';
import { ZONE_COLOR } from '@/lib/zoneColors';
import { distanceFromCurrent, getCurrentLocation, getDestination, getDestinations } from '@/services/parkingService';
import { useDestinationStore } from '@/store/useDestinationStore';
import { useDestinationPlan, useLotSummaries } from '@/store/useParkingStore';

const CONGESTION_BAR: Record<Congestion, string> = {
  available: 'bg-available',
  normal: 'bg-primary',
  busy: 'bg-busy',
  unknown: 'bg-unknown',
};

const normalize = (s: string) => s.replace(/\s/g, '').toLowerCase();

/** 추천 대상 결정: 사용자가 고른 대상이 여전히 선택 가능하면 그것, 아니면 추천 1위 */
function resolveTarget(plan: DestinationPlan, override: string | null) {
  if (plan.kind === 'zone') {
    const picked = plan.ranked.find((r) => r.zone.id === override && r.selectable);
    return { zone: picked ?? plan.recommended, isRecommended: !picked || picked === plan.recommended };
  }
  const picked = plan.ranked.find((r) => r.lot.id === override && r.selectable);
  return { lot: picked ?? plan.recommended, isRecommended: !picked || picked === plan.recommended };
}

function zoneCompareItems(ranked: RankedZone[], targetId: string | undefined): CompareItem[] {
  return ranked
    .filter((r) => r.zone.id !== targetId)
    .slice(0, 3)
    .map((r) => ({
      id: r.zone.id,
      title: r.zone.name,
      barClass: ZONE_COLOR[r.zone.color].bg,
      countText: `${r.zone.availableSpaces}면`,
      countClass: ZONE_COLOR[r.zone.color].text,
      totalText: `/ ${r.zone.totalSpaces}`,
      walkMinutes: r.walkMinutes,
      congestion: r.zone.congestion,
      disabled: !r.selectable,
      disabledLabel: r.zone.availableSpaces === 0 ? '만차' : '혼잡',
    }));
}

function lotCompareItems(ranked: RankedLot[], targetId: string | undefined): CompareItem[] {
  return ranked
    .filter((r) => r.lot.id !== targetId)
    .slice(0, 3)
    .map((r) => ({
      id: r.lot.id,
      title: r.lot.shortName.replace(' 주차장', ''),
      barClass: CONGESTION_BAR[r.lot.congestion],
      countText: r.lot.availableSpaces === null ? '-' : `${r.lot.availableSpaces}면`,
      countClass: r.lot.availableSpaces === null ? 'text-ink-muted' : 'text-ink',
      totalText: r.lot.availableSpaces === null ? '정보없음' : `/ ${r.lot.totalSpaces}`,
      walkMinutes: r.walkMinutes,
      congestion: r.lot.congestion,
      disabled: !r.selectable,
      disabledLabel: '혼잡',
    }));
}

export default function DestinationPage() {
  const safeBack = useSafeBack('/');
  const { destinationId, targetOverride, selectDestination, setTargetOverride } = useDestinationStore();
  const plan = useDestinationPlan(destinationId);
  const lots = useLotSummaries();
  const now = useNow();
  const location = getCurrentLocation();

  const [query, setQuery] = useState(() => (destinationId ? (getDestination(destinationId)?.name ?? '') : ''));
  const [editing, setEditing] = useState(!destinationId);
  const [autoFocus] = useState(!destinationId);

  const items: DestinationItem[] = useMemo(() => {
    const q = normalize(editing ? query : '');
    return getDestinations()
      .filter((d) => !q || normalize(d.name).includes(q) || normalize(d.category).includes(q))
      .map((d) => ({
        destination: d,
        distanceM: distanceFromCurrent(d.position),
        lot: lots.find((l) => l.id === d.lotId),
      }));
  }, [query, editing, lots]);

  const select = (id: string) => {
    const d = getDestination(id);
    if (!d) return;
    selectDestination(id);
    setQuery(d.name);
    setEditing(false);
    (document.activeElement as HTMLElement | null)?.blur();
  };

  const reset = () => {
    selectDestination(null);
    setQuery('');
    setEditing(true);
  };

  const handleBack = () => {
    if (destinationId && !editing) return reset();
    safeBack();
  };

  const showPlan = !!plan && !editing;
  const target = plan ? resolveTarget(plan, targetOverride) : null;

  // ---- 하단 버튼 ----
  let footer: React.ReactNode = null;
  if (showPlan && plan && target) {
    if (plan.kind === 'zone') {
      footer = (
        <BottomActions
          secondary={{ label: '주차현황 보기', icon: Map, href: `/lot/${plan.lot.id}/status` }}
          primary={
            target.zone
              ? { label: '안내받기', icon: Navigation, href: `/navigate/${plan.lot.id}?zone=${target.zone.zone.id}` }
              : { label: '홈으로', icon: Home, href: '/' }
          }
        />
      );
    } else {
      const lotId = target.lot?.lot.id ?? plan.destination.lotId;
      footer = (
        <BottomActions
          secondary={{ label: '상세정보 보기', icon: ReceiptText, href: `/lot/${lotId}` }}
          primary={
            target.lot
              ? { label: '안내받기', icon: Navigation, href: `/navigate/${lotId}` }
              : { label: '홈으로', icon: Home, href: '/' }
          }
        />
      );
    }
  }

  return (
    <>
      <SearchHeader
        value={query}
        autoFocus={autoFocus}
        onChange={(v) => {
          setQuery(v);
          setEditing(true);
        }}
        onFocus={() => setEditing(true)}
        onSubmit={() => items[0] && select(items[0].destination.id)}
        onBack={handleBack}
        onClear={reset}
      />

      <main className="flex-1 overflow-y-auto scrollbar-none px-4 pb-6 pt-1">
        {!showPlan && (
          <>
            <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A73FF]/15">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white bg-[#1A73FF] shadow" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-available">
                  <span className="h-1.5 w-1.5 rounded-full bg-available" />
                  현재 위치 확인됨
                </p>
                <p className="truncate text-[15px] font-semibold">{location.label}</p>
              </div>
            </div>

            <p className="mb-2.5 mt-6 px-1 text-[15px] font-bold">
              {editing && query ? `검색 결과 ${items.length}` : '추천 목적지'}
            </p>
            {items.length > 0 ? (
              <DestinationList items={items} query={editing ? query.trim() : ''} onSelect={select} />
            ) : (
              <div className="rounded-card bg-surface px-5 py-8 text-center">
                <MapPin size={28} className="mx-auto text-ink-muted" />
                <p className="mt-2 text-[15px] font-semibold">&lsquo;{query}&rsquo; 검색 결과가 없어요</p>
                <p className="mt-1 text-[13px] text-ink-muted">캠퍼스 건물 이름으로 검색해 보세요. (예: 제1공학관)</p>
                <button type="button" onClick={reset} className="mt-4 text-[14px] font-semibold text-primary">
                  추천 목적지 보기
                </button>
              </div>
            )}
          </>
        )}

        {showPlan && plan && target && plan.kind === 'zone' && (
          <div className="space-y-4">
            <Link href={`/lot/${plan.lot.id}`} className="pressable flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[15.5px] font-bold">{plan.lot.shortName}</p>
                  <AiLiveBadge size="sm" />
                </div>
                <p className="mt-1 text-[13px] text-ink-sub">
                  여유 <span className="font-bold text-available">{plan.lot.availableSpaces}면</span> / {plan.lot.totalSpaces}면
                  <span className="mx-1.5 text-line">|</span>
                  {formatUpdatedAgo(plan.lot.updatedAt, now)}
                </p>
              </div>
              <StatusBadge status={plan.lot.congestion} size="sm" />
              <ChevronRight size={18} className="shrink-0 text-ink-muted" />
            </Link>

            {target.zone ? (
              <ZoneRecommendCard
                target={target.zone}
                isRecommended={target.isRecommended}
                reason={zoneReason(target.zone, plan.ranked)}
                zones={plan.lot.zoneSummaries}
                onReset={() => setTargetOverride(null)}
              />
            ) : (
              <NoRecommendCard message="지금은 모든 구역이 혼잡해요. 잠시 후 다시 확인해 주세요." />
            )}

            <section>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <p className="text-[15px] font-bold">다른 구역 비교</p>
                <p className="text-[12px] text-ink-muted">눌러서 안내 구역 변경</p>
              </div>
              <CompareCards items={zoneCompareItems(plan.ranked, target.zone?.zone.id)} onSelect={setTargetOverride} />
            </section>
          </div>
        )}

        {showPlan && plan && target && plan.kind === 'lot' && (
          <div className="space-y-4">
            <p className="px-1 text-[13.5px] text-ink-sub">
              <span className="font-bold text-ink">{plan.destination.name}</span> 근처 주차장을 도보 거리와 여유면으로 비교했어요.
            </p>
            {target.lot ? (
              <LotRecommendCard target={target.lot} isRecommended={target.isRecommended} onReset={() => setTargetOverride(null)} />
            ) : (
              <NoRecommendCard message="근처에 여유 있는 주차장이 없어요." />
            )}
            <section>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <p className="text-[15px] font-bold">주변 주차장 비교</p>
                <p className="text-[12px] text-ink-muted">눌러서 안내 주차장 변경</p>
              </div>
              <CompareCards items={lotCompareItems(plan.ranked, target.lot?.lot.id)} onSelect={setTargetOverride} />
            </section>
          </div>
        )}
      </main>

      {footer}
    </>
  );
}
