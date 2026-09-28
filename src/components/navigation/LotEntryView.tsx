'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FloorBase, SlotLayer, useSlotRects } from '@/components/parking/ParkingMap';
import { buildRoute, pointAt, remainingPoints } from '@/lib/route';
import type { MapPoint, Slot, ZoneDef, ZoneSummary } from '@/lib/types';
import { ZONE_COLOR } from '@/lib/zoneColors';
import { CAR_ENTRANCE, FLOOR, slotRect, zoneRect } from '@/mocks/lotFloorPlan';

/** A·B 와 C·D 사이 세로 통로 x 좌표 */
const CORRIDOR_X = 222;
/** A·C 사이 가로 차로 y 좌표 */
const LANE_Y = CAR_ENTRANCE.y + 2;

/** (출입구로 들어와) 가로 차로 → 세로 통로 → 칸 앞 통로 → 칸 안 */
export function entryPath(zone: ZoneDef, slot: Slot): MapPoint[] {
  const r = slotRect(zone, slot.row, slot.index);
  const z = zoneRect(zone);
  const cx = r.x + r.w / 2;
  // 짝수 줄(쌍의 아래 줄)은 아래 통로, 홀수 줄은 위 통로에서 진입
  const aisleY = (slot.row - 1) % 2 === 1 ? r.y + r.h + 6 : Math.max(z.y - 5, r.y - 6);
  return [
    { x: CORRIDOR_X - 80, y: LANE_Y },
    { x: CORRIDOR_X, y: LANE_Y },
    { x: CORRIDOR_X, y: aisleY },
    { x: cx, y: aisleY },
    { x: cx, y: r.y + r.h / 2 },
  ];
}

const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

/**
 * 주차장 입구 도착 후: 평면도에서 차가 추천 칸으로 들어가는 연출.
 * 끝나면 onDone 호출. 평면도는 경로가 보이도록 확대해서 보여준다.
 */
export default function LotEntryView({
  zones,
  slots,
  target,
  durationMs,
  parked,
  onProgress,
  onDone,
}: {
  zones: ZoneSummary[];
  slots: Slot[];
  target: Slot;
  durationMs: number;
  parked: boolean;
  /** 남은 비율 (1 → 0) */
  onProgress?: (remainingRatio: number) => void;
  onDone: () => void;
}) {
  const zone = zones.find((z) => z.id === target.zone)!;
  // 경로는 시작 시 한 번만 계산 (실시간 갱신으로 구역 객체가 바뀌어도 애니메이션이 다시 시작되지 않게)
  const [path] = useState(() => entryPath(zone, target));
  const [route] = useState(() => buildRoute(path));
  const [d, setD] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const dist = easeInOut(t) * route.total;
      setD(dist);
      onProgressRef.current?.(route.total > 0 ? 1 - dist / route.total : 0);
      if (t < 1) raf = requestAnimationFrame(tick);
      else if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [route, durationMs]);

  const zoneDefs = useMemo(() => zones.map(({ id, name, color, totalSpaces, rows, slotsPerRow, walkMinutesTo }) => ({ id, name, color, totalSpaces, rows, slotsPerRow, walkMinutesTo })), [zones]);
  // 목표 칸은 차가 들어갈 때까지 '비어있음'으로 표시
  const shownSlots = useMemo(
    () => (parked ? slots : slots.map((s) => (s.id === target.id ? { ...s, status: 'empty' as const } : s))),
    [slots, target.id, parked],
  );
  const slotRects = useSlotRects(zoneDefs, shownSlots);
  const tr = slotRect(zone, target.row, target.index);
  const car = pointAt(route, d);
  const color = ZONE_COLOR[zone.color];

  // 보이는 영역: 경로 + 목표 구역을 담는 사각형
  const zr = zoneRect(zone);
  const xs = [...path.map((p) => p.x), zr.x, zr.x + zr.w];
  const ys = [...path.map((p) => p.y), zr.y, zr.y + zr.h];
  const pad = 14;
  const vb = {
    x: Math.max(0, Math.min(...xs) - pad),
    y: Math.max(0, Math.min(...ys) - pad),
    w: 0,
    h: 0,
  };
  vb.w = Math.min(FLOOR.width, Math.max(...xs) + pad) - vb.x;
  vb.h = Math.min(FLOOR.height, Math.max(...ys) + pad) - vb.y;

  const remaining = remainingPoints(route, d);
  const toPath = (pts: MapPoint[]) => pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      className="absolute inset-0 bg-[#8DBF7F]"
    >
      <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} preserveAspectRatio="xMidYMid meet" className="h-full w-full" aria-label="주차장 진입 안내">
        <FloorBase zones={zoneDefs} />
        <SlotLayer items={slotRects} />

        {/* 목표 칸 */}
        <rect x={tr.x - 1.5} y={tr.y - 1.5} width={tr.w + 3} height={tr.h + 3} rx={1.5} fill="none" stroke="#FFD43B" strokeWidth={1.8}>
          {!parked && <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />}
        </rect>

        {/* 남은 경로 */}
        {!parked && remaining.length > 1 && (
          <>
            <path d={toPath(remaining)} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            <path d={toPath(remaining)} fill="none" stroke="#1A63F0" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {/* 목표 구역 라벨 */}
        <g transform={`translate(${zr.x + zr.w / 2} ${zr.y - 12})`}>
          <rect x={-22} y={-8} width={44} height={16} rx={5} fill={color.hex} />
          <text textAnchor="middle" y={4} fontSize={9.5} fontWeight={700} fill="#fff">
            {zone.name}
          </text>
        </g>

        {/* 차 */}
        <g transform={`translate(${car.point.x} ${car.point.y}) rotate(${car.heading})`}>
          <rect x={-3.6} y={-6} width={7.2} height={12} rx={2} fill="#1A63F0" stroke="#fff" strokeWidth={1} />
          <rect x={-2.6} y={-4.2} width={5.2} height={2.8} rx={0.8} fill="#BFD6FF" />
        </g>
      </svg>
    </motion.div>
  );
}
