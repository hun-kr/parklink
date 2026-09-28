import { CONFIG } from './config';
import { randomInt, shuffle, type Rng } from './random';
import type { ParkingLot, RealtimeSnapshot, Slot } from './types';

/**
 * 실시간 Vision 시뮬레이터.
 * 5~10초마다 임의 구역(또는 주변 실시간 주차장)의 여유면을 ±1~2 변동시킨다.
 * - 칸 데이터가 있는 주차장: 칸 상태를 empty ↔ occupied 로 바꾼다 → 여유면은 칸에서 계산되므로 0 미만·총면수 초과가 불가능
 * - 칸 데이터가 없는 실시간 주차장: 숫자를 0 ~ 총면수 범위에서 변동
 * - 초기값 쪽으로 약하게 되돌아가도록(mean reversion) 해서 데모 시나리오가 크게 흔들리지 않게 한다
 */

interface StepContext {
  lots: ParkingLot[];
  /** 초기 여유면 (lotId → 값, 또는 `${lotId}:${zoneId}` → 값) */
  baseline: Record<string, number>;
  /** 시뮬레이터가 건드리지 않는 칸 (내 차, 안내 목표 칸) */
  lockedSlotIds: Set<string>;
  rng: Rng;
  now: number;
}

/** 초기값보다 적으면 증가 확률↑, 많으면 감소 확률↑ */
function increaseProbability(current: number, base: number) {
  const p = 0.5 + 0.12 * (base - current);
  return Math.min(0.85, Math.max(0.15, p));
}

function stepSlots(slots: Slot[], ctx: StepContext, lot: ParkingLot): Slot[] {
  const zones = lot.zones!;
  const zone = zones[Math.floor(ctx.rng() * zones.length)];
  const current = slots.filter((s) => s.zone === zone.id && s.status === 'empty').length;
  const base = ctx.baseline[`${lot.id}:${zone.id}`] ?? current;
  const increase = ctx.rng() < increaseProbability(current, base);
  const delta = randomInt(ctx.rng, 1, CONFIG.simulation.maxDelta);

  const pick = (inc: boolean) =>
    slots.filter((s) => s.zone === zone.id && s.status === (inc ? 'occupied' : 'empty') && !ctx.lockedSlotIds.has(s.id));
  // 요청 방향으로 바꿀 칸이 없으면(예: 여유 0면에서 감소) 반대 방향으로
  let dir = increase;
  let candidates = pick(dir);
  if (candidates.length === 0) {
    dir = !dir;
    candidates = pick(dir);
  }
  const to = dir ? 'empty' : 'occupied';
  const targets = new Set(shuffle(ctx.rng, candidates).slice(0, delta).map((s) => s.id));
  if (targets.size === 0) return slots;
  return slots.map((s) => (targets.has(s.id) ? { ...s, status: to } : s));
}

function stepCount(current: number, total: number, base: number, rng: Rng) {
  const increase = rng() < increaseProbability(current, base);
  const delta = randomInt(rng, 1, CONFIG.simulation.maxDelta);
  return Math.min(total, Math.max(0, current + (increase ? delta : -delta)));
}

/** 시뮬레이션 1회 실행 → 새 스냅샷 (불변) */
export function simulateStep(snapshot: RealtimeSnapshot, ctx: StepContext): RealtimeSnapshot {
  const realtimeLots = ctx.lots.filter((l) => l.isRealtime);
  // 데모 무대인 칸 데이터 주차장(제1공학관)이 5~10초마다 눈에 보이게 바뀌도록 우선 선택
  const zoned = realtimeLots.filter((l) => l.zones);
  const others = realtimeLots.filter((l) => !l.zones);
  const useZoned = zoned.length > 0 && (others.length === 0 || ctx.rng() < CONFIG.simulation.mainLotProbability);
  const pool = useZoned ? zoned : others;
  const lot = pool[Math.floor(ctx.rng() * pool.length)];
  if (!lot) return snapshot;

  if (lot.zones && snapshot.slots[lot.id]) {
    return {
      ...snapshot,
      slots: { ...snapshot.slots, [lot.id]: stepSlots(snapshot.slots[lot.id], ctx, lot) },
      updatedAt: { ...snapshot.updatedAt, [lot.id]: ctx.now },
    };
  }

  const current = snapshot.lotAvailable[lot.id];
  if (current === null || current === undefined) return snapshot;
  return {
    ...snapshot,
    lotAvailable: {
      ...snapshot.lotAvailable,
      [lot.id]: stepCount(current, lot.totalSpaces, ctx.baseline[lot.id] ?? current, ctx.rng),
    },
    updatedAt: { ...snapshot.updatedAt, [lot.id]: ctx.now },
  };
}

/** 초기 스냅샷에서 mean reversion 기준값을 만든다 */
export function createBaseline(lots: ParkingLot[], snapshot: RealtimeSnapshot) {
  const baseline: Record<string, number> = {};
  for (const lot of lots) {
    const slots = snapshot.slots[lot.id];
    if (lot.zones && slots) {
      for (const z of lot.zones) {
        baseline[`${lot.id}:${z.id}`] = slots.filter((s) => s.zone === z.id && s.status === 'empty').length;
      }
    } else {
      const v = snapshot.lotAvailable[lot.id];
      if (typeof v === 'number') baseline[lot.id] = v;
    }
  }
  return baseline;
}

/** 5~10초 랜덤 간격으로 tick 을 호출하는 스케줄러. stop 함수를 반환한다. */
export function startTicker(tick: () => void, rng: Rng) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;
  const { minIntervalMs, maxIntervalMs } = CONFIG.simulation;

  const schedule = () => {
    if (stopped) return;
    timer = setTimeout(() => {
      tick();
      schedule();
    }, randomInt(rng, minIntervalMs, maxIntervalMs));
  };
  schedule();

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}
