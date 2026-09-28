/**
 * 데이터 접근 단일 창구.
 * 지금은 목데이터 + 시뮬레이터로 동작하지만, 추후 실제 Vision API / WebSocket 으로
 * 이 파일의 구현만 교체하면 되도록 화면은 반드시 이 서비스를 통해 데이터를 얻는다.
 */
import { CONFIG } from '@/lib/config';
import { createRng } from '@/lib/random';
import { recommendZone } from '@/lib/recommend';
import { createBaseline, simulateStep, startTicker } from '@/lib/simulator';
import { getCongestion, summarizeZones, sumAvailable } from '@/lib/status';
import type {
  Destination,
  LotSummary,
  ParkingLot,
  RealtimeSnapshot,
  Recommendation,
  Slot,
} from '@/lib/types';
import { CURRENT_LOCATION, DESTINATIONS } from '@/mocks/destinations';
import { DEMO_SLOT_ID, generateSlots } from '@/mocks/lotLayout';
import { ALL_LOTS, INITIAL_LOT_AVAILABLE } from '@/mocks/lots';

type Listener = (snapshot: RealtimeSnapshot) => void;

function createInitialSnapshot(): RealtimeSnapshot {
  const slots: Record<string, Slot[]> = {};
  for (const lot of ALL_LOTS) {
    if (lot.zones) slots[lot.id] = generateSlots(lot.zones, CONFIG.simulation.seed);
  }
  return { lotAvailable: { ...INITIAL_LOT_AVAILABLE }, slots, updatedAt: {} };
}

// ---- 내부 상태 (Mock 서버 역할) ----
let snapshot: RealtimeSnapshot = createInitialSnapshot();
const baseline = createBaseline(ALL_LOTS, snapshot);
const listeners = new Set<Listener>();
/** 시뮬레이터가 건드리지 않는 칸: 데모 안내 목표 칸 + 내 차가 주차된 칸 */
const lockedSlotIds = new Set<string>([DEMO_SLOT_ID]);
const rng = createRng(Date.now() >>> 0);
let stopTicker: (() => void) | null = null;

function emit(next: RealtimeSnapshot) {
  snapshot = next;
  listeners.forEach((l) => l(snapshot));
}

function startSimulation() {
  if (stopTicker) return;
  // 처음 연결 시 '10초 전 업데이트' 상태로 시작
  const startedAt = Date.now() - 10_000;
  const updatedAt: Record<string, number> = {};
  for (const lot of ALL_LOTS) if (lot.isRealtime) updatedAt[lot.id] = snapshot.updatedAt[lot.id] ?? startedAt;
  emit({ ...snapshot, updatedAt });

  stopTicker = startTicker(() => {
    emit(simulateStep(snapshot, { lots: ALL_LOTS, baseline, lockedSlotIds, rng, now: Date.now() }));
  }, rng);
}

function stopSimulation() {
  stopTicker?.();
  stopTicker = null;
}

// ---- 조회 (정적 정보) ----

export function getLots(): ParkingLot[] {
  return ALL_LOTS;
}

export function getLot(lotId: string): ParkingLot | undefined {
  return ALL_LOTS.find((l) => l.id === lotId);
}

export function getDestinations(): Destination[] {
  return DESTINATIONS;
}

export function getDestination(destinationId: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === destinationId);
}

export function getCurrentLocation() {
  return CURRENT_LOCATION;
}

// ---- 실시간 ----

export function getSnapshot(): RealtimeSnapshot {
  return snapshot;
}

/** 실시간 업데이트 구독. 첫 구독자가 생기면 시뮬레이터 시작, 모두 해제되면 정지. */
export function subscribeRealtime(listener: Listener): () => void {
  listeners.add(listener);
  startSimulation();
  listener(snapshot);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stopSimulation();
  };
}

/** 스냅샷 → 주차장 요약. 칸 데이터가 있으면 전체 여유면 = 구역별 여유면 합계. */
export function buildLotSummary(lot: ParkingLot, snap: RealtimeSnapshot): LotSummary {
  const slots = snap.slots[lot.id];
  const updatedAt = snap.updatedAt[lot.id] ?? null;

  if (lot.zones && slots) {
    const zoneSummaries = summarizeZones(lot.zones, slots);
    const availableSpaces = sumAvailable(zoneSummaries);
    return {
      ...lot,
      availableSpaces,
      congestion: getCongestion(availableSpaces, lot.totalSpaces),
      zoneSummaries,
      updatedAt,
    };
  }

  const availableSpaces = snap.lotAvailable[lot.id] ?? null;
  return {
    ...lot,
    availableSpaces,
    congestion: getCongestion(availableSpaces, lot.totalSpaces),
    zoneSummaries: [],
    updatedAt: lot.isRealtime ? updatedAt : null,
  };
}

export function getLotSummaries(snap: RealtimeSnapshot = snapshot): LotSummary[] {
  return ALL_LOTS.map((lot) => buildLotSummary(lot, snap));
}

export function getLotSummary(lotId: string, snap: RealtimeSnapshot = snapshot): LotSummary | undefined {
  const lot = getLot(lotId);
  return lot ? buildLotSummary(lot, snap) : undefined;
}

export function getSlots(lotId: string, snap: RealtimeSnapshot = snapshot): Slot[] {
  return snap.slots[lotId] ?? [];
}

/** 목적지 기준 추천 구역 */
export function getRecommendation(
  destinationId: string,
  snap: RealtimeSnapshot = snapshot,
): Recommendation | null {
  const dest = getDestination(destinationId);
  if (!dest) return null;
  const summary = getLotSummary(dest.lotId, snap);
  if (!summary || summary.zoneSummaries.length === 0) return null;
  return recommendZone(dest.lotId, destinationId, summary.zoneSummaries, getSlots(dest.lotId, snap), DEMO_SLOT_ID);
}

// ---- 변경 ----

/** 주차 완료: 해당 칸을 '주차중'으로 고정한다 */
export function parkAt(lotId: string, slotId: string) {
  const slots = snapshot.slots[lotId];
  if (!slots) return;
  lockedSlotIds.add(slotId);
  emit({
    ...snapshot,
    slots: {
      ...snapshot.slots,
      [lotId]: slots.map((s) => (s.id === slotId ? { ...s, status: 'occupied' } : s)),
    },
    updatedAt: { ...snapshot.updatedAt, [lotId]: Date.now() },
  });
}

/**
 * 출차(내 주차 위치 삭제).
 * 데모 칸은 다시 비워서 안내 목표로 고정(데모 반복 가능), 그 외 칸은 고정만 해제한다.
 */
export function releaseSlot(lotId: string, slotId: string) {
  if (slotId !== DEMO_SLOT_ID) {
    lockedSlotIds.delete(slotId);
    return;
  }
  const slots = snapshot.slots[lotId];
  if (!slots) return;
  emit({
    ...snapshot,
    slots: {
      ...snapshot.slots,
      [lotId]: slots.map((s) => (s.id === slotId ? { ...s, status: 'empty' } : s)),
    },
    updatedAt: { ...snapshot.updatedAt, [lotId]: Date.now() },
  });
}
