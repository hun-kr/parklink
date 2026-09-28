/**
 * 제1공학관 주차장 평면도 좌표 (SVG 단위). 04 시안 배치 기준:
 * A 좌상 / B 우상 / C 좌하 / D 우하, 왼쪽 차량 출입구, B구역 오른쪽 보행 출입구 → 제1공학관.
 * 칸 위치는 구역 정의(rows, slotsPerRow)로 계산한다.
 */
import type { ZoneDef, ZoneId } from '@/lib/types';

export const FLOOR = { width: 430, height: 500 };

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 칸 치수: 두 줄이 등을 맞댄 '쌍' 단위로 배치, 쌍 사이는 차로 */
const SLOT_H = 13;
const AISLE = 12;
const PAD = 6;

export const ZONE_ORIGIN: Record<ZoneId, { x: number; y: number; w: number }> = {
  A: { x: 56, y: 36, w: 160 },
  B: { x: 228, y: 36, w: 166 },
  C: { x: 56, y: 236, w: 160 },
  D: { x: 228, y: 250, w: 166 },
};

export function zoneRect(zone: ZoneDef): Rect {
  const o = ZONE_ORIGIN[zone.id];
  const pairs = Math.ceil(zone.rows / 2);
  const lastSingle = zone.rows % 2 === 1;
  const h = PAD * 2 + pairs * SLOT_H * 2 - (lastSingle ? SLOT_H : 0) + (pairs - 1) * AISLE;
  return { x: o.x, y: o.y, w: o.w, h };
}

/** row, index 는 1부터 */
export function slotRect(zone: ZoneDef, row: number, index: number): Rect {
  const r = zoneRect(zone);
  const w = (r.w - PAD * 2) / zone.slotsPerRow;
  const pair = Math.floor((row - 1) / 2);
  const inPair = (row - 1) % 2;
  return {
    x: r.x + PAD + (index - 1) * w,
    y: r.y + PAD + pair * (SLOT_H * 2 + AISLE) + inPair * SLOT_H,
    w,
    h: SLOT_H,
  };
}

/** 주차장 바닥(아스팔트) */
export const ASPHALT: Rect = { x: 44, y: 24, w: 362, h: 382 };

/** 도로 */
export const ROADS: Rect[] = [
  { x: 14, y: 0, w: 26, h: 500 }, // 왼쪽 진입도로
  { x: 14, y: 410, w: 416, h: 18 }, // 아래쪽 도로
];

/** 차량 출입구 (왼쪽, A·C 사이 차로) */
export const CAR_ENTRANCE = { x: 44, y: 210 };

/** 제1공학관 건물 (오른쪽 아래) */
export const BUILDING: Rect = { x: 214, y: 436, w: 216, h: 64 };

/** 보행 출입구 (B구역 오른쪽) → 보행로 → 제1공학관 */
export const PEDESTRIAN_GATE = { x: 416, y: 100 };
export const WALKWAY = `M ${PEDESTRIAN_GATE.x} ${PEDESTRIAN_GATE.y} L ${PEDESTRIAN_GATE.x} 436`;

/** 나무 (위쪽 줄 + 왼쪽 줄 + 아래 잔디) */
export const TREES: { x: number; y: number; r: number }[] = [
  ...Array.from({ length: 17 }, (_, i) => ({ x: 56 + i * 22, y: 10, r: 9 + (i % 3) })),
  ...Array.from({ length: 22 }, (_, i) => ({ x: 6, y: 12 + i * 22, r: 7 + (i % 2) * 2 })),
  ...Array.from({ length: 7 }, (_, i) => ({ x: 56 + i * 22, y: 452 + (i % 2) * 18, r: 10 })),
];

/** 칸 앞 통로의 y 좌표: 쌍의 아래 줄은 아래 통로, 위 줄은 위 통로에서 진입 */
export function slotAisleY(zone: ZoneDef, row: number, index: number) {
  const r = slotRect(zone, row, index);
  const z = zoneRect(zone);
  return (row - 1) % 2 === 1 ? r.y + r.h + 6 : Math.max(z.y - 5, r.y - 6);
}

/** B·D 사이 가로 통로 (보행 출입구에서 왼쪽 구역으로 갈 때) */
const WALK_CROSS_Y = 238;
/** A·B 와 C·D 사이 세로 통로 */
export const CORRIDOR_X = 222;

/**
 * 보행 출입구(제1공학관 쪽) → 내 칸 도보 경로.
 * 오른쪽 구역(B·D)은 칸 앞 통로로 바로, 왼쪽 구역(A·C)은 가운데 통로를 거쳐 간다.
 */
export function walkPathToSlot(zone: ZoneDef, row: number, index: number) {
  const r = slotRect(zone, row, index);
  const cx = r.x + r.w / 2;
  const aisleY = slotAisleY(zone, row, index);
  const gate = { x: PEDESTRIAN_GATE.x, y: PEDESTRIAN_GATE.y };
  const end = { x: cx, y: r.y + r.h / 2 };
  if (zone.id === 'B' || zone.id === 'D') {
    return [gate, { x: gate.x, y: aisleY }, { x: cx, y: aisleY }, end];
  }
  return [
    gate,
    { x: gate.x, y: WALK_CROSS_Y },
    { x: CORRIDOR_X, y: WALK_CROSS_Y },
    { x: CORRIDOR_X, y: aisleY },
    { x: cx, y: aisleY },
    end,
  ];
}

/** 점들을 감싸는 사각형 (+여백) */
export function boundsOf(points: { x: number; y: number }[], pad = 16): Rect {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  return { x, y, w: Math.max(...xs) + pad - x, h: Math.max(...ys) + pad - y };
}
