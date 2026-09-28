'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, LocateFixed, Minus, Navigation2, Plus } from 'lucide-react';
import { usePanZoom } from '@/hooks/usePanZoom';
import { cn } from '@/lib/cn';
import type { Slot, SlotStatus, ZoneDef, ZoneId, ZoneSummary } from '@/lib/types';
import { ZONE_COLOR } from '@/lib/zoneColors';
import {
  ASPHALT,
  BUILDING,
  CAR_ENTRANCE,
  FLOOR,
  PEDESTRIAN_GATE,
  ROADS,
  TREES,
  WALKWAY,
  slotRect,
  zoneRect,
} from '@/mocks/lotFloorPlan';
import { toast } from '@/store/useToastStore';

export const SLOT_FILL: Record<SlotStatus, string> = {
  empty: '#2FBF63',
  occupied: '#E5484D',
  unknown: '#BCC2CA',
};

/** 정적 배경 (도로·나무·건물·구역 테두리) */
const FloorBase = memo(function FloorBase({ zones }: { zones: ZoneDef[] }) {
  return (
    <>
      <rect x={0} y={0} width={FLOOR.width} height={FLOOR.height} fill="#8DBF7F" />
      {TREES.map((t, i) => (
        <circle key={i} cx={t.x} cy={t.y} r={t.r} fill={i % 3 === 0 ? '#4E8F47' : '#5FA257'} />
      ))}
      {ROADS.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#A4AAB2" />
      ))}
      {/* 진입도로 중앙선 */}
      <line x1={27} y1={0} x2={27} y2={410} stroke="#fff" strokeWidth={1} strokeDasharray="6 6" />
      <rect x={ASPHALT.x} y={ASPHALT.y} width={ASPHALT.w} height={ASPHALT.h} rx={14} fill="#6A7079" />
      {/* 차로 화살표 */}
      {[210, 229].map((y) => (
        <path key={y} d={`M 120 ${y} l 16 0 m -5 -4 l 5 4 l -5 4`} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.4} />
      ))}
      {zones.map((z) => {
        const r = zoneRect(z);
        const c = ZONE_COLOR[z.color].hex;
        return <rect key={z.id} x={r.x - 4} y={r.y - 4} width={r.w + 8} height={r.h + 8} rx={8} fill={`${c}33`} stroke={c} strokeWidth={2} />;
      })}
      {/* 보행로 + 제1공학관 */}
      <path d={WALKWAY} stroke="#E8F6EC" strokeWidth={6} strokeLinecap="round" />
      <path d={WALKWAY} stroke="#16A34A" strokeWidth={1.6} strokeDasharray="4 4" />
      <rect x={BUILDING.x} y={BUILDING.y} width={BUILDING.w} height={BUILDING.h} rx={4} fill="#DDE1E7" stroke="#C3C9D1" />
      <rect x={BUILDING.x + 20} y={BUILDING.y + 10} width={BUILDING.w - 60} height={BUILDING.h - 20} rx={3} fill="#E9ECF0" />
    </>
  );
});

function ZoneLabel({ zone, active, onClick }: { zone: ZoneSummary; active: boolean; onClick: () => void }) {
  const c = ZONE_COLOR[zone.color];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={`${zone.name} ${zone.availableSpaces}면 여유, 확대`}
      className={cn(
        'flex -translate-x-1/2 -translate-y-1/2 flex-col items-center overflow-hidden whitespace-nowrap rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-transform',
        active && 'scale-110 ring-2 ring-white',
      )}
    >
      <span className={cn('w-full px-3 py-[3px] text-center text-[12px] font-bold text-white', c.bg)}>{zone.name}</span>
      <span className="px-3 py-[3px] text-[12.5px] font-bold text-ink">
        <span className={c.text}>{zone.availableSpaces}</span> / {zone.totalSpaces}
      </span>
    </button>
  );
}

/**
 * 04 시안: 구역별 주차현황 평면도.
 * 칸 색 = 실시간 칸 상태 (시뮬레이터와 연동, 구역 숫자와 항상 일치). 구역 라벨/카드를 누르면 해당 구역 확대.
 */
export default function ParkingMap({
  zones,
  slots,
  focusZone,
  onZoneSelect,
  highlightSlotId,
  className,
}: {
  zones: ZoneSummary[];
  slots: Slot[];
  focusZone: ZoneId | null;
  onZoneSelect: (zone: ZoneId | null) => void;
  highlightSlotId?: string | null;
  className?: string;
}) {
  const zoneById = useMemo(() => Object.fromEntries(zones.map((z) => [z.id, z])) as Record<ZoneId, ZoneSummary>, [zones]);
  const zoneDefs = useMemo(() => zones.map(({ id, name, color, totalSpaces, rows, slotsPerRow, walkMinutesTo }) => ({ id, name, color, totalSpaces, rows, slotsPerRow, walkMinutesTo })), [zones]);

  const fitScale = (size: { width: number; height: number }) => size.width / FLOOR.width;
  const pz = usePanZoom({
    initialCenter: { x: FLOOR.width / 2, y: FLOOR.height / 2 },
    initialScale: 0.9,
    getLimits: (size) => {
      const fit = fitScale(size);
      return {
        minScale: fit * 0.85,
        maxScale: fit * 4,
        bounds: { minX: -20, minY: -20, maxX: FLOOR.width + 20, maxY: FLOOR.height + 20 },
      };
    },
  });

  /** 전체 보기 */
  const fitView = (animated = true) => {
    const size = { width: pz.width.get(), height: pz.height.get() };
    const s = fitScale(size);
    const center = { x: FLOOR.width / 2, y: Math.min(FLOOR.height / 2, size.height / 2 / s - 4) };
    if (animated) pz.animateTo(center, s);
    else pz.jumpTo(center, s);
  };

  // 첫 크기 측정 시 폭에 맞춤
  const fitted = useRef(false);
  pz.onResizeRef.current = () => {
    if (fitted.current) return;
    fitted.current = true;
    if (focusZone) focusOn(focusZone, false);
    else fitView(false);
  };

  function focusOn(id: ZoneId, animated = true) {
    const z = zoneById[id];
    if (!z) return;
    const r = zoneRect(z);
    const w = pz.width.get();
    const h = pz.height.get();
    const s = Math.min((w * 0.86) / r.w, (h * 0.78) / r.h);
    const center = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    if (animated) pz.animateTo(center, s);
    else pz.jumpTo(center, s);
  }

  // 구역 선택이 바뀌면 확대 / 해제 시 전체 보기
  const prevFocus = useRef(focusZone);
  useEffect(() => {
    if (prevFocus.current === focusZone) return;
    prevFocus.current = focusZone;
    if (!fitted.current) return;
    if (focusZone) focusOn(focusZone);
    else fitView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusZone]);

  // 상태가 바뀐 칸 → 잠깐 반짝임
  const prevStatus = useRef<Map<string, SlotStatus> | null>(null);
  const [flash, setFlash] = useState<{ ids: string[]; v: number }>({ ids: [], v: 0 });
  useEffect(() => {
    const prev = prevStatus.current;
    const next = new Map(slots.map((s) => [s.id, s.status]));
    prevStatus.current = next;
    if (!prev) return;
    const changed = slots.filter((s) => prev.get(s.id) !== s.status).map((s) => s.id);
    if (changed.length > 0) setFlash((f) => ({ ids: changed, v: f.v + 1 }));
  }, [slots]);

  const slotRects = useMemo(
    () => slots.map((s) => ({ slot: s, rect: zoneById[s.zone] ? slotRect(zoneById[s.zone], s.row, s.index) : null })),
    // 칸 위치는 구역 정의에만 의존
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slots, zoneDefs],
  );
  const rectById = useMemo(() => new Map(slotRects.map((r) => [r.slot.id, r.rect])), [slotRects]);
  const highlightRect = highlightSlotId ? rectById.get(highlightSlotId) : null;

  const ctrl = 'flex h-[42px] w-[42px] items-center justify-center bg-white text-ink active:bg-surface';

  return (
    <div className={cn('relative overflow-clip bg-[#8DBF7F]', className)}>
      <div ref={pz.containerRef} className="absolute inset-0 touch-none select-none" {...pz.handlers} onClick={() => focusZone && onZoneSelect(null)}>
        <motion.div className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ transform: pz.transform }}>
          <svg width={FLOOR.width} height={FLOOR.height} viewBox={`0 0 ${FLOOR.width} ${FLOOR.height}`} className="absolute left-0 top-0" aria-hidden>
            <FloorBase zones={zoneDefs} />
            {/* 칸 */}
            <g stroke="#ffffff" strokeOpacity={0.85} strokeWidth={0.6}>
              {slotRects.map(({ slot, rect }) =>
                rect ? (
                  <rect
                    key={slot.id}
                    data-zone={slot.zone}
                    data-status={slot.status}
                    x={rect.x}
                    y={rect.y}
                    width={rect.w}
                    height={rect.h}
                    fill={SLOT_FILL[slot.status]}
                    style={{ transition: 'fill 0.6s ease' }}
                  />
                ) : null,
              )}
            </g>
            {/* 방금 바뀐 칸 */}
            {flash.ids.map((id) => {
              const r = rectById.get(id);
              return r ? (
                <rect
                  key={`${id}-${flash.v}`}
                  x={r.x - 1.5}
                  y={r.y - 1.5}
                  width={r.w + 3}
                  height={r.h + 3}
                  rx={1.5}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={1.6}
                  className="animate-slot-flash"
                />
              ) : null;
            })}
            {highlightRect && (
              <rect
                x={highlightRect.x - 2}
                y={highlightRect.y - 2}
                width={highlightRect.w + 4}
                height={highlightRect.h + 4}
                rx={2}
                fill="none"
                stroke="#FFD43B"
                strokeWidth={2}
              />
            )}
          </svg>

          {/* 구역 라벨 (확대해도 크기 유지) */}
          {zones.map((z) => {
            const r = zoneRect(z);
            return (
              <div key={z.id} className="absolute" style={{ left: r.x + r.w / 2, top: r.y + Math.min(40, r.h / 2), zIndex: 10 }}>
                <motion.div style={{ scale: pz.inverse, originX: 0, originY: 0 }}>
                  <ZoneLabel zone={z} active={focusZone === z.id} onClick={() => onZoneSelect(focusZone === z.id ? null : z.id)} />
                </motion.div>
              </div>
            );
          })}

          {/* 출입구 */}
          <div className="absolute" style={{ left: CAR_ENTRANCE.x - 4, top: CAR_ENTRANCE.y, zIndex: 9 }}>
            <motion.div style={{ scale: pz.inverse, originX: 0, originY: 0 }}>
              <span className="flex -translate-x-full -translate-y-1/2 items-center gap-1 whitespace-nowrap">
                <span className="rounded-md bg-navy px-2 py-1 text-[11.5px] font-bold text-white shadow">출입구</span>
                <span className="text-[16px] font-black leading-none text-white drop-shadow">→</span>
              </span>
            </motion.div>
          </div>
          <div className="absolute" style={{ left: PEDESTRIAN_GATE.x, top: PEDESTRIAN_GATE.y, zIndex: 9 }}>
            <motion.div style={{ scale: pz.inverse, originX: 0, originY: 0 }}>
              <span className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-available p-1 text-white shadow ring-2 ring-white">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="13" cy="4" r="2" />
                  <path d="M4 17l5 1l.75 -1.5" />
                  <path d="M15 21l0 -4l-4 -3l1 -6" />
                  <path d="M7 12l0 -3l5 -1l3 3l3 1" />
                </svg>
              </span>
            </motion.div>
          </div>
          <div className="absolute" style={{ left: BUILDING.x + BUILDING.w / 2 - 10, top: BUILDING.y + BUILDING.h / 2 - 4, zIndex: 9 }}>
            <motion.div style={{ scale: pz.inverse, originX: 0, originY: 0 }}>
              <span className="block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[13px] font-bold text-ink">제1공학관</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* 방위 */}
      <div className="pointer-events-none absolute left-3 top-3 flex h-[46px] w-[46px] flex-col items-center justify-center rounded-full bg-white shadow-float">
        <span className="text-[10px] font-bold leading-none">N</span>
        <Navigation2 size={18} className="fill-ink text-ink" strokeWidth={1.5} />
      </div>

      {/* 컨트롤 */}
      <div className="absolute right-3 top-3 flex flex-col gap-2.5">
        <button type="button" aria-label="지도 레이어" onClick={() => toast('위성 사진 보기는 준비 중이에요.')} className={cn(ctrl, 'rounded-[12px] shadow-float')}>
          <Layers size={20} strokeWidth={2} />
        </button>
        <div className="flex flex-col overflow-hidden rounded-[12px] shadow-float">
          <button type="button" aria-label="확대" onClick={() => pz.animateTo({ x: pz.cx.get(), y: pz.cy.get() }, pz.scale.get() * 1.5)} className={ctrl}>
            <Plus size={20} strokeWidth={2.2} />
          </button>
          <span className="mx-2 h-px bg-line" />
          <button type="button" aria-label="축소" onClick={() => pz.animateTo({ x: pz.cx.get(), y: pz.cy.get() }, pz.scale.get() / 1.5)} className={ctrl}>
            <Minus size={20} strokeWidth={2.2} />
          </button>
        </div>
        <button
          type="button"
          aria-label="전체 보기"
          onClick={() => (focusZone ? onZoneSelect(null) : fitView())}
          className={cn(ctrl, 'rounded-[12px] shadow-float')}
        >
          <LocateFixed size={20} strokeWidth={2} />
        </button>
      </div>

      {/* 범례 */}
      <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-3 rounded-full bg-white px-3.5 py-2 text-[12px] font-medium text-ink-sub shadow-float">
        {(
          [
            ['empty', '비어있음'],
            ['occupied', '주차중'],
            ['unknown', '정보없음'],
          ] as const
        ).map(([k, label]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: SLOT_FILL[k] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
