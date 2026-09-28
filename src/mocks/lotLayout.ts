import { createRng, shuffle } from '@/lib/random';
import type { Slot, SlotStatus, SlotType, ZoneDef, ZoneId } from '@/lib/types';

/** 초기 여유면: A 4 / B 14 / C 6 / D 0 → 합계 24 (CLAUDE.md §5) */
export const INITIAL_EMPTY: Record<ZoneId, number> = { A: 4, B: 14, C: 6, D: 0 };

/** 초기 정보없음 칸 수 (카메라 사각지대 등) */
const INITIAL_UNKNOWN: Record<ZoneId, number> = { A: 6, B: 8, C: 5, D: 6 };

/** 장애인 4면 / 전기차 8면 */
const SPECIAL_SLOTS: Record<string, SlotType> = {
  'A-1-01': 'disabled',
  'A-1-02': 'disabled',
  'B-1-01': 'disabled',
  'B-1-02': 'disabled',
  'C-1-01': 'ev',
  'C-1-02': 'ev',
  'C-1-03': 'ev',
  'C-1-04': 'ev',
  'D-1-01': 'ev',
  'D-1-02': 'ev',
  'D-1-03': 'ev',
  'D-1-04': 'ev',
};

/** 데모 시나리오에서 주차하는 칸: B구역 · 2열 · 5번째 칸 (초기에 비어 있음) */
export const DEMO_SLOT_ID = 'B-2-05';

export function slotId(zone: ZoneId, row: number, index: number) {
  return `${zone}-${row}-${String(index).padStart(2, '0')}`;
}

/** 시드 고정으로 칸 데이터를 만든다. 구역별 empty 개수가 INITIAL_EMPTY 와 정확히 일치한다. */
export function generateSlots(zones: ZoneDef[], seed: number): Slot[] {
  const rng = createRng(seed);
  const slots: Slot[] = [];

  for (const zone of zones) {
    const ids: string[] = [];
    for (let row = 1; row <= zone.rows; row++) {
      for (let index = 1; index <= zone.slotsPerRow; index++) ids.push(slotId(zone.id, row, index));
    }
    if (ids.length !== zone.totalSpaces) {
      throw new Error(`${zone.name} 칸 수(${ids.length})가 총면수(${zone.totalSpaces})와 다릅니다.`);
    }

    const status = new Map<string, SlotStatus>(ids.map((id) => [id, 'occupied']));
    let emptyLeft = INITIAL_EMPTY[zone.id];
    if (ids.includes(DEMO_SLOT_ID) && emptyLeft > 0) {
      status.set(DEMO_SLOT_ID, 'empty');
      emptyLeft -= 1;
    }
    const pool = shuffle(
      rng,
      ids.filter((id) => id !== DEMO_SLOT_ID),
    );
    pool.slice(0, emptyLeft).forEach((id) => status.set(id, 'empty'));
    pool.slice(emptyLeft, emptyLeft + INITIAL_UNKNOWN[zone.id]).forEach((id) => status.set(id, 'unknown'));

    for (const id of ids) {
      const [, row, index] = id.split('-');
      slots.push({
        id,
        zone: zone.id,
        row: Number(row),
        index: Number(index),
        status: status.get(id)!,
        type: SPECIAL_SLOTS[id] ?? 'normal',
      });
    }
  }
  return slots;
}
