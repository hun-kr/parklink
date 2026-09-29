'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Layers, Navigation, Volume2, VolumeX } from 'lucide-react';
import MapView, { type MapMarker, type MapViewHandle } from '@/components/map/MapView';
import LotEntryView from '@/components/navigation/LotEntryView';
import NavBanner, { type BannerContent } from '@/components/navigation/NavBanner';
import NavBottomCard from '@/components/navigation/NavBottomCard';
import RerouteCard, { type RerouteOffer } from '@/components/navigation/RerouteCard';
import { CarMarker, DestinationMarker, TurnCallout } from '@/components/navigation/NavMarkers';
import { useNow } from '@/hooks/useNow';
import { noteReplace } from '@/hooks/useSafeBack';
import { cn } from '@/lib/cn';
import { CONFIG } from '@/lib/config';
import { formatDistance, formatSlotPosition, formatTime } from '@/lib/format';
import { rankZones } from '@/lib/recommend';
import { MANEUVER_TEXT, buildRoute, maneuvers, pointAt, remainingPoints, roundGuideMeters } from '@/lib/route';
import type { Slot, ZoneId } from '@/lib/types';
import { DEMO_SLOT_ID } from '@/mocks/lotLayout';
import { getLotSummary, getNavRoute, getSlots, releaseReservation, reserveSlot, rushZone } from '@/services/parkingService';
import { useMyCarStore } from '@/store/useMyCarStore';
import { useLotSummary, useRecommendation, useSlots } from '@/store/useParkingStore';
import { toast } from '@/store/useToastStore';

type Phase = 'driving' | 'entering' | 'parked' | 'arrived';

const MPU = CONFIG.map.metersPerUnit;
/** 주차장 입구 → 칸까지 거리(m). 입구 도착 전에도 남은 거리에 더해 표시가 끊기지 않게 한다 */
const ENTRY_METERS = 60;

const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

/** 안내 목표 칸: 지정 구역의 데모 칸(B-2-05) → 없으면 앞쪽 빈 칸 */
function pickTarget(slots: Slot[], zone: ZoneId | null): Slot | null {
  if (!zone) return null;
  const empty = slots.filter((s) => s.zone === zone && s.status === 'empty').sort((a, b) => a.row - b.row || a.index - b.index);
  return empty.find((s) => s.id === DEMO_SLOT_ID) ?? empty[0] ?? null;
}

/** 05 시안: 길안내 (Mock 차량 이동) */
export default function NavigateClient({ lotId, zoneId }: { lotId: string; zoneId: ZoneId | null }) {
  const router = useRouter();
  const lot = useLotSummary(lotId)!;
  const slots = useSlots(lotId);
  const recommendation = useRecommendation(CONFIG.demo.mainDestinationId);
  const park = useMyCarStore((s) => s.park);
  const now = useNow();
  const mapRef = useRef<MapViewHandle>(null);

  // 목표 칸은 안내 시작 시점에 한 번 정하고, 안내 중에는 시뮬레이터가 채우지 못하게 예약
  const [target, setTarget] = useState<Slot | null>(() => {
    const zone = zoneId ?? (lot.zones && recommendation?.lotId === lotId ? recommendation.zoneId : null);
    return lot.zones ? pickTarget(getSlots(lotId), zone) : null;
  });
  useEffect(() => {
    if (!target) return;
    reserveSlot(target.id);
    return () => releaseReservation(target.id);
  }, [target]);

  const route = useMemo(() => buildRoute(getNavRoute(lotId)), [lotId]);
  const mans = useMemo(() => maneuvers(route), [route]);
  const [d, setD] = useState(0);
  const [phase, setPhase] = useState<Phase>('driving');
  const [entryLeft, setEntryLeft] = useState(1);
  const [follow, setFollow] = useState(true);
  const [sound, setSound] = useState(true);
  const followRef = useRef(follow);
  followRef.current = follow;
  const [offer, setOffer] = useState<RerouteOffer | null>(null);
  const rerouteFired = useRef(false);
  const targetRef = useRef(target);
  targetRef.current = target;

  /** S08: 목표 구역이 빠르게 차는 상황을 연출하고, 다른 구역을 제안한다 */
  const fireReroute = () => {
    rerouteFired.current = true;
    const current = targetRef.current;
    if (!current) return;
    const { before, after } = rushZone(lotId, current.zone, CONFIG.nav.rerouteLeave);
    if (after >= before) return;
    const summary = getLotSummary(lotId);
    const alt = summary && rankZones(summary.zoneSummaries, CONFIG.demo.mainDestinationId).find((r) => r.selectable && r.zone.id !== current.zone);
    if (!alt) return;
    setOffer({
      from: { zone: current.zone, before, after },
      to: { zone: alt.zone.id, available: alt.zone.availableSpaces, walkMinutes: alt.walkMinutes },
    });
  };

  const switchZone = () => {
    if (!offer) return;
    const next = pickTarget(getSlots(lotId), offer.to.zone);
    if (next) {
      setTarget(next);
      toast(`${offer.to.zone}구역으로 안내를 바꿨어요.`);
    }
    setOffer(null);
  };

  const car = pointAt(route, d);
  const entryMeters = target ? ENTRY_METERS : 0;

  // ---- 주행 애니메이션 ----
  useEffect(() => {
    if (phase !== 'driving') return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / CONFIG.nav.driveMs);
      const dist = easeInOut(p) * route.total;
      setD(dist);
      if (!rerouteFired.current && p >= CONFIG.nav.rerouteAtProgress) fireReroute();
      if (followRef.current && mapRef.current) {
        const { width, height } = mapRef.current.getSize();
        mapRef.current.jumpTo(pointAt(route, dist).point, {
          scale: CONFIG.nav.followScale,
          screenPoint: { x: width / 2, y: height * 0.72 },
        });
      }
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        // 답하지 않고 도착하면 기존 구역 유지
        setOffer(null);
        setPhase(targetRef.current ? 'entering' : 'arrived');
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, route]);

  // ---- 도착 처리 ----
  useEffect(() => {
    if (phase === 'parked') {
      const t = setTimeout(() => {
        noteReplace();
        router.replace('/parked');
      }, CONFIG.nav.doneMs);
      return () => clearTimeout(t);
    }
    if (phase === 'arrived') {
      toast(`${lot.shortName}에 도착했어요.`);
      const t = setTimeout(() => {
        noteReplace();
        router.replace(`/lot/${lotId}`);
      }, CONFIG.nav.doneMs);
      return () => clearTimeout(t);
    }
  }, [phase, router, lot.shortName, lotId]);

  const handleParked = () => {
    if (!target) return;
    park({
      lotId: lot.id,
      lotName: lot.name,
      address: lot.address,
      zone: target.zone,
      row: target.row,
      index: target.index,
      slotId: target.id,
    });
    setPhase('parked');
  };

  const endGuide = () => {
    if (target) releaseReservation(target.id);
    router.push('/');
  };

  // ---- 안내 문구 ----
  const targetText = target ? formatSlotPosition(target.zone, target.row, target.index) : null;
  let banner: BannerContent;
  if (phase === 'parked') {
    banner = { icon: 'done', title: '주차 완료', message: '내 차 위치를 저장했어요' };
  } else if (phase === 'entering' && target) {
    banner = {
      icon: 'park',
      title: `${target.zone}구역`,
      message: `${target.row}열 ${target.index}번째 칸으로 진입하세요`,
      next: { icon: 'straight', label: '주차장 내', message: '서행하세요' },
    };
  } else if (phase === 'arrived') {
    banner = { icon: 'arrive', title: '도착', message: `${lot.shortName}에 도착했어요` };
  } else {
    const idx = Math.max(0, mans.findIndex((m) => m.at > d + 0.5));
    const next = mans[idx];
    const after = mans[idx + 1];
    const meters = roundGuideMeters((next.at - d) * MPU);
    banner = {
      icon: next.type === 'arrive' ? 'arrive' : next.type,
      title: `${meters}m`,
      message: next.type === 'arrive' ? `${lot.shortName} 입구에 도착합니다` : `${MANEUVER_TEXT[next.type]}하세요`,
      next: after
        ? {
            icon: after.type === 'arrive' ? 'arrive' : after.type,
            label: `이후 ${roundGuideMeters((after.at - next.at) * MPU)}m`,
            message: after.type === 'arrive' ? '주차장 입구' : MANEUVER_TEXT[after.type],
          }
        : target
          ? { icon: 'park', label: `${target.zone}구역 진입`, message: `${target.row}열 · ${target.index}번째 칸` }
          : undefined,
    };
  }

  // ---- 남은 거리 · 시간 ----
  const remainingM =
    phase === 'parked' || phase === 'arrived'
      ? 0
      : phase === 'entering'
        ? entryLeft * ENTRY_METERS
        : (route.total - d) * MPU + entryMeters;
  const done = phase === 'parked' || phase === 'arrived';
  const minutesNum = done ? 0 : Math.max(1, Math.ceil(remainingM / CONFIG.nav.speedMetersPerMinute));
  const minutes = done ? '도착' : `${minutesNum}분`;
  const eta = now ? formatTime(now + minutesNum * 60_000) : '--:--';

  // ---- 지도 표시물 ----
  // 도착지 핀과 겹치는 마지막 회전 말풍선은 생략
  const upcoming = mans
    .filter((m) => m.type !== 'arrive' && m.at > d + 0.5 && route.total - m.at > 25)
    .slice(0, 2)
    // 두 번째 회전이 너무 가까우면(말풍선 겹침) 첫 번째만 표시
    .filter((m, i, arr) => i === 0 || m.at - arr[0].at > 70);
  const markers: MapMarker[] = [
    ...upcoming.map((m) => ({
      id: `turn-${m.at}`,
      position: m.point,
      zIndex: 20,
      element: <TurnCallout dir={m.type as 'left' | 'right'} meters={roundGuideMeters((m.at - d) * MPU)} />,
    })),
    {
      id: 'destination',
      position: route.points[route.points.length - 1],
      zIndex: 30,
      element: <DestinationMarker name={lot.shortName} />,
    },
    { id: 'car', position: car.point, zIndex: 40, element: <CarMarker heading={car.heading} /> },
  ];
  const polylines =
    phase === 'driving'
      ? [{ id: 'route', points: remainingPoints(route, d), color: '#1A63F0', width: 9, casing: '#FFFFFF', arrowSpacing: 38 }]
      : [];

  const [initialView] = useState(() => ({
    center: { x: route.points[0].x, y: route.points[0].y - 100 },
    scale: CONFIG.nav.followScale,
  }));

  const ctrl = 'flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-white text-ink shadow-[0_2px_10px_rgba(17,24,39,0.14)]';

  return (
    <>
      <div className="relative flex-1 overflow-clip">
        <MapView
          ref={mapRef}
          initialView={initialView}
          markers={markers}
          polylines={polylines}
          onUserInteract={() => setFollow(false)}
        />

        <AnimatePresence>
          {(phase === 'entering' || phase === 'parked') && target && lot.zoneSummaries.length > 0 && (
            <motion.div key="entry" className="absolute inset-x-0 bottom-0 top-[150px] z-10" exit={{ opacity: 0 }}>
              <LotEntryView
                zones={lot.zoneSummaries}
                slots={slots}
                target={target}
                durationMs={CONFIG.nav.enterMs}
                parked={phase === 'parked'}
                onProgress={setEntryLeft}
                onDone={handleParked}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {(phase === 'entering' || phase === 'parked') && <div className="absolute inset-x-0 top-0 z-10 h-[150px] bg-[#8DBF7F]" />}

        {/* 상단 안내 배너 */}
        <div className="absolute inset-x-3.5 top-3 z-20">
          <NavBanner content={banner} tone={phase === 'parked' ? 'green' : 'navy'} />
        </div>

        {/* 주차 완료 표시 */}
        <AnimatePresence>
          {phase === 'parked' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-x-0 bottom-6 z-20 flex justify-center"
            >
              <span className="rounded-full bg-available px-5 py-2.5 text-[15px] font-bold text-white shadow-float">
                주차 위치를 저장했어요 · 잠시 후 이동합니다
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* S08 AI 재추천 */}
        <AnimatePresence>
          {phase === 'driving' && offer && (
            <div className="absolute inset-x-3.5 bottom-4 z-30">
              <RerouteCard
                offer={offer}
                onKeep={() => {
                  setOffer(null);
                  toast(`${offer.from.zone}구역으로 계속 안내할게요.`);
                }}
                onSwitch={switchZone}
              />
            </div>
          )}
        </AnimatePresence>

        {/* 오른쪽 컨트롤 */}
        {phase === 'driving' && !offer && (
          <div className="absolute bottom-5 right-3.5 z-20 flex flex-col gap-3">
            <button type="button" aria-label="지도 레이어" className={ctrl} onClick={() => toast('위성 지도는 준비 중이에요.')}>
              <Layers size={22} />
            </button>
            <button
              type="button"
              aria-label={sound ? '안내음 끄기' : '안내음 켜기'}
              className={ctrl}
              onClick={() => {
                setSound(!sound);
                toast(sound ? '안내음을 껐어요.' : '안내음을 켰어요.');
              }}
            >
              {sound ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>
            <button
              type="button"
              aria-label="내 차 위치로"
              className={cn(ctrl, !follow && 'ring-2 ring-primary')}
              onClick={() => setFollow(true)}
            >
              <Navigation size={22} className="fill-primary text-primary" />
            </button>
          </div>
        )}
      </div>

      <NavBottomCard
        lot={lot}
        minutes={minutes}
        distance={formatDistance(remainingM)}
        eta={eta}
        targetLabel={targetText ? (phase === 'parked' ? `${targetText} 주차 완료` : `${targetText}으로 안내 중`) : undefined}
        onEnd={endGuide}
      />
    </>
  );
}
