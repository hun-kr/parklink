'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Maximize2 } from 'lucide-react';
import { FloorBase, SlotLayer, useSlotRects } from '@/components/parking/ParkingMap';
import type { Slot, ZoneSummary } from '@/lib/types';
import { ZONE_COLOR } from '@/lib/zoneColors';
import { slotRect, zoneRect } from '@/mocks/lotFloorPlan';

/** 06 시안: 내 칸 주변 평면도 미리보기 (정적) + 핀 + 확대 버튼 */
export default function SlotPreview({
  zones,
  slots,
  slotId,
  href,
}: {
  zones: ZoneSummary[];
  slots: Slot[];
  slotId: string;
  href: string;
}) {
  const zoneDefs = useMemo(
    () => zones.map(({ id, name, color, totalSpaces, rows, slotsPerRow, walkMinutesTo }) => ({ id, name, color, totalSpaces, rows, slotsPerRow, walkMinutesTo })),
    [zones],
  );
  const slotRects = useSlotRects(zoneDefs, slots);
  const slot = slots.find((s) => s.id === slotId);
  const zone = zoneDefs.find((z) => z.id === slot?.zone);
  if (!slot || !zone) return null;

  const r = slotRect(zone, slot.row, slot.index);
  const zr = zoneRect(zone);
  // 칸을 가운데 두고 가로 150 × 세로 60 영역
  const vw = 150;
  const vh = 60;
  const vx = Math.min(Math.max(r.x + r.w / 2 - vw / 2, 0), 430 - vw);
  const vy = Math.max(r.y + r.h / 2 - vh / 2 - 6, 0);
  const color = ZONE_COLOR[zone.color];

  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl">
      <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className="block h-[150px] w-full" preserveAspectRatio="xMidYMid slice" aria-label="내 주차 위치 미리보기">
        <FloorBase zones={zoneDefs} />
        <SlotLayer items={slotRects} />
        <rect x={r.x - 2} y={r.y - 2} width={r.w + 4} height={r.h + 4} rx={2} fill="#2FAF56" fillOpacity={0.35} />
        <rect x={r.x - 0.6} y={r.y - 0.6} width={r.w + 1.2} height={r.h + 1.2} rx={1.2} fill="#2FBF63" stroke="#fff" strokeWidth={0.9} />
        {/* 구역 라벨 */}
        <g transform={`translate(${Math.max(zr.x + 16, vx + 16)} ${Math.max(zr.y + 6, vy + 7)})`}>
          <rect x={-14} y={-5.5} width={28} height={11} rx={5.5} fill={color.hex} />
          <text textAnchor="middle" y={3} fontSize={6.5} fontWeight={700} fill="#fff">
            {zone.name}
          </text>
        </g>
        {/* 핀 */}
        <g transform={`translate(${r.x + r.w / 2} ${r.y - 1})`}>
          <path d="M 0 0 L -3 -5 A 7 7 0 1 1 3 -5 Z" fill="#2FAF56" stroke="#fff" strokeWidth={1} />
          {/* 자동차 */}
          <g fill="#fff">
            <path d="M -3.4 -10.2 L -2.4 -12.6 L 2.4 -12.6 L 3.4 -10.2 Z" />
            <rect x={-4} y={-10.4} width={8} height={3.2} rx={0.9} />
            <rect x={-3.4} y={-7.6} width={1.5} height={1.2} rx={0.4} />
            <rect x={1.9} y={-7.6} width={1.5} height={1.2} rx={0.4} />
          </g>
        </g>
      </svg>
      <Link
        href={href}
        aria-label="내 차 찾기 지도 크게 보기"
        className="pressable absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-ink/80 text-white"
      >
        <Maximize2 size={18} />
      </Link>
    </div>
  );
}
