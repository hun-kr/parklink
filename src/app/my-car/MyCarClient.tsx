'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, CarFront, ChevronLeft, ChevronRight, Clock3, Footprints, MapPin, Navigation, Share2 } from 'lucide-react';
import BottomTabBar from '@/components/layout/BottomTabBar';
import { useSafeBack } from '@/hooks/useSafeBack';
import LotBriefCard from '@/components/mycar/LotBriefCard';
import SlotPosition from '@/components/mycar/SlotPosition';
import ParkingMap from '@/components/parking/ParkingMap';
import BottomActions from '@/components/ui/BottomActions';
import PageLoading from '@/components/ui/PageLoading';
import PhotoPlaceholder from '@/components/ui/PhotoPlaceholder';
import { formatDate, formatTime } from '@/lib/format';
import { buildRoute, pointAt } from '@/lib/route';
import { myCarShareText, myCarShareUrl, shareOrCopy } from '@/lib/share';
import type { MapPoint, ZoneId } from '@/lib/types';
import { boundsOf, walkPathToSlot } from '@/mocks/lotFloorPlan';
import { useMyCarStore } from '@/store/useMyCarStore';
import { useLotSummary, useSlots } from '@/store/useParkingStore';
import { toast } from '@/store/useToastStore';

export interface SharedParking {
  lotId: string;
  slotId: string;
  zone: ZoneId;
  row: number;
  index: number;
  parkedAt: number | null;
}

/** 저장된 위치가 없을 때 */
function EmptyState() {
  return (
    <>
      <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-primary">
          <Car size={40} strokeWidth={1.8} />
        </span>
        <h1 className="mt-5 text-[22px] font-bold">저장된 주차 위치가 없어요</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          주차장 안내를 받아 주차를 완료하면
          <br />내 차 위치가 자동으로 저장됩니다.
        </p>
        <Link href="/" className="pressable mt-8 flex h-[52px] w-full items-center justify-center rounded-2xl bg-primary text-[16.5px] font-bold text-white">
          홈으로
        </Link>
      </main>
      <BottomTabBar />
    </>
  );
}

const WALK_MS = 4200;

/** 07 시안: 내 차 찾기 */
export default function MyCarClient({ shared }: { shared: SharedParking | null }) {
  const router = useRouter();
  const safeBack = useSafeBack('/');
  const { myParking, hydrated, clear } = useMyCarStore();

  // 공유 링크로 열었고 내 저장 위치와 다르면 공유받은 위치를 보여준다
  const isShared = !!shared && (!myParking || myParking.slotId !== shared.slotId || myParking.lotId !== shared.lotId);
  const parking = isShared
    ? { ...shared!, parkedAt: shared!.parkedAt, plateNumber: null as string | null }
    : myParking
      ? { ...myParking, plateNumber: myParking.plateNumber as string | null }
      : null;

  const lot = useLotSummary(parking?.lotId ?? '');
  const slots = useSlots(parking?.lotId ?? '');
  const [focusZone, setFocusZone] = useState<ZoneId | null>(null);
  const [refitKey, setRefitKey] = useState(0);
  const [walker, setWalker] = useState<MapPoint | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const zoneDef = lot?.zones?.find((z) => z.id === parking?.zone);
  const walkPath = useMemo(
    () => (zoneDef && parking ? walkPathToSlot(zoneDef, parking.row, parking.index) : undefined),
    [zoneDef, parking?.row, parking?.index], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const fitRect = useMemo(() => (walkPath ? boundsOf(walkPath, 40) : undefined), [walkPath]);

  // '길안내 다시보기': 보행 출입구 → 내 차까지 걷는 점 애니메이션
  const rafRef = useRef(0);
  const replayWalk = () => {
    if (!walkPath) return;
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFocusZone(null);
    setRefitKey((k) => k + 1);
    const route = buildRoute(walkPath);
    const start = performance.now();
    cancelAnimationFrame(rafRef.current);
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / WALK_MS);
      setWalker(pointAt(route, p * route.total).point);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setTimeout(() => setWalker(null), 900);
    };
    rafRef.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  if (!hydrated) return <PageLoading label="내 차 위치를 불러오는 중" />;
  if (!parking || !lot || !zoneDef) return <EmptyState />;

  const walkMin = zoneDef.walkMinutesTo['eng1-building'] ?? 2;
  const posShort = `${parking.zone}구역 ${parking.row}열 ${parking.index}번째 칸`;

  const share = async () => {
    const p = myParking && !isShared ? myParking : null;
    const data = p
      ? { title: '내 차 위치', text: myCarShareText(p), url: myCarShareUrl(window.location.origin, p) }
      : { title: '내 차 위치', text: `[ParkLink] 차량 위치\n${lot.name}\n${posShort}`, url: window.location.href };
    const r = await shareOrCopy(data);
    if (r === 'copied') toast('내 차 위치 링크를 복사했어요.');
    else if (r === 'failed') toast('공유하지 못했어요. 잠시 후 다시 시도해 주세요.');
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clear();
    toast('출차 처리했어요. 저장된 위치를 삭제했어요.');
    router.push('/');
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto scrollbar-none pb-5">
        <div className="px-4 pt-2">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={safeBack}
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-ink active:bg-surface"
          >
            <ChevronLeft size={28} strokeWidth={2.2} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] font-extrabold tracking-[-0.03em]">내 차 찾기</h1>
            {isShared && <span className="rounded-lg bg-primary-light px-2 py-1 text-[12px] font-semibold text-primary">공유받은 위치</span>}
          </div>
          <p className="mt-1 text-[15px] text-ink-sub">주차한 위치를 지도로 확인하고, 쉽게 찾아가세요.</p>
          <div className="mt-4">
            <LotBriefCard lot={lot} />
          </div>
        </div>

        <div ref={mapRef} className="mt-4">
          <ParkingMap
            zones={lot.zoneSummaries}
            slots={slots}
            focusZone={focusZone}
            onZoneSelect={setFocusZone}
            fitRect={fitRect}
            refitKey={refitKey}
            myCar={{ slotId: parking.slotId, title: '내 차 위치', subtitle: posShort }}
            walkPath={walkPath}
            walker={walker}
            showZoneLabels={false}
            className="h-[400px]"
          />
        </div>

        <div className="mt-3 space-y-3 px-4">
          <section className="relative rounded-[20px] border border-line bg-white shadow-card">
            <div className="flex items-center gap-3 px-4 pb-3 pt-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                <CarFront size={24} />
              </span>
              <div>
                <p className="text-[14px] text-ink-sub">내 주차 위치</p>
                <SlotPosition zone={parking.zone} row={parking.row} index={parking.index} className="text-[22px]" />
              </div>
            </div>
            <div className="grid grid-cols-[1.45fr_1fr_1.15fr] divide-x divide-line border-t border-line text-[13.5px] tracking-[-0.02em]">
              <div className="px-3 py-3">
                <p className="flex items-center gap-1.5 whitespace-nowrap text-ink-muted">
                  <Clock3 size={15} className="shrink-0 max-[380px]:hidden" />
                  주차 시간
                </p>
                {parking.parkedAt ? (
                  <p className="mt-1 font-medium leading-snug">
                    {formatDate(parking.parkedAt).split(' (')[0]}
                    <br />
                    ({formatDate(parking.parkedAt).split(' (')[1]} {formatTime(parking.parkedAt)}
                  </p>
                ) : (
                  <p className="mt-1 font-medium">-</p>
                )}
              </div>
              <div className="px-3 py-3">
                <p className="flex items-center gap-1.5 whitespace-nowrap text-ink-muted">
                  <Car size={15} className="shrink-0 max-[380px]:hidden" />
                  차량 번호
                </p>
                <p className="mt-1 whitespace-nowrap font-medium">{parking.plateNumber ?? '비공개'}</p>
              </div>
              <div className="min-w-0 px-3 py-3">
                <p className="flex items-center gap-1.5 whitespace-nowrap text-ink-muted">
                  <MapPin size={15} className="shrink-0 max-[380px]:hidden" />
                  주차장
                </p>
                <p className="mt-1 font-medium leading-snug">{lot.name}</p>
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={replayWalk}
            className="flex w-full items-center gap-3 rounded-[20px] border border-available/30 bg-available-light px-4 py-3.5 text-left"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-available text-white">
              <Footprints size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold text-available-dark">현재 위치에서 내 차까지 약 {walkMin}분 거리입니다.</span>
              <span className="mt-0.5 block text-[13px] text-ink-sub">지도를 따라 이동하시면 쉽게 찾을 수 있습니다.</span>
            </span>
            <ChevronRight size={20} className="shrink-0 text-available" />
          </button>

          <section className="pt-2">
            <button
              type="button"
              onClick={() => toast('주변 사진은 준비 중이에요.')}
              className="mb-2.5 flex w-full items-center justify-between"
            >
              <h2 className="text-[17px] font-bold">주변 사진으로 확인하기</h2>
              <ChevronRight size={20} className="text-ink-sub" />
            </button>
            <div className="grid grid-cols-[1.3fr_1fr] gap-2.5">
              <PhotoPlaceholder label={`${parking.zone}구역 진입로`} counter="1/3" className="h-[96px] rounded-2xl" iconSize={24} />
              <PhotoPlaceholder label={`${parking.row}열 방향`} counter="2/3" className="h-[96px] rounded-2xl" iconSize={24} />
            </div>
          </section>

          {!isShared && (
            <button type="button" onClick={handleClear} className="w-full py-3 text-center text-[13.5px] font-medium text-ink-muted">
              {confirmClear ? '한 번 더 누르면 저장된 위치가 삭제돼요' : '출차 완료 (저장 위치 삭제)'}
            </button>
          )}
        </div>
      </main>

      <BottomActions
        className="border-t border-line"
        secondary={{ label: '길안내 다시보기', icon: Navigation, onClick: replayWalk, size: 'sm' }}
        primary={{ label: '내 차 위치 공유', icon: Share2, variant: 'success', onClick: share, size: 'sm' }}
      />
    </>
  );
}
