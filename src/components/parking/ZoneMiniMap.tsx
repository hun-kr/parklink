import { ZONE_COLOR } from '@/lib/zoneColors';
import type { ZoneId, ZoneSummary } from '@/lib/types';

/** 04 시안 배치 기준 2×2 구역 칸 (A 좌상 / B 우상 / C 좌하 / D 우하) */
const CELL: Record<ZoneId, { x: number; y: number }> = {
  A: { x: 18, y: 6 },
  B: { x: 80, y: 6 },
  C: { x: 18, y: 46 },
  D: { x: 80, y: 46 },
};
const W = 58;
const H = 36;
/** 제1공학관 보행 출입구 (B구역 쪽, 오른쪽) */
const GATE = { x: 150, y: 24 };

/**
 * 주차장 미니 배치도: 추천(선택) 구역 강조 + 보행 출입구까지 점선 경로.
 * 왼쪽 화살표 = 차량 출입구, 오른쪽 사람 = 제1공학관 보행 출입구.
 */
export default function ZoneMiniMap({ zones, highlight }: { zones: ZoneSummary[]; highlight: ZoneId }) {
  const target = CELL[highlight];
  // 구역 아래쪽 가운데 → 통로 → 오른쪽 보행 출입구
  const startX = target.x + W / 2;
  const startY = target.y + H;
  const laneY = target.y === 6 ? 44 : 86;

  return (
    <svg viewBox="0 0 170 104" className="h-auto w-full" role="img" aria-label={`${highlight}구역 위치`}>
      {/* 주차장 바닥 */}
      <rect x={12} y={0} width={132} height={88} rx={10} fill="#EEF1F5" />

      {/* 차량 출입구 */}
      <path d="M 0 44 L 10 44" stroke="#1E5EEB" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M 6 40 L 11 44 L 6 48" fill="none" stroke="#1E5EEB" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />

      {zones.map((z) => {
        const c = CELL[z.id];
        const color = ZONE_COLOR[z.color].hex;
        const on = z.id === highlight;
        return (
          <g key={z.id}>
            <rect
              x={c.x}
              y={c.y}
              width={W}
              height={H}
              rx={6}
              fill={on ? color : `${color}1F`}
              stroke={color}
              strokeWidth={on ? 0 : 1.2}
              strokeOpacity={0.6}
            />
            <text
              x={c.x + W / 2}
              y={c.y + 15}
              textAnchor="middle"
              fontSize={10.5}
              fontWeight={700}
              fill={on ? '#fff' : color}
            >
              {z.id}구역
            </text>
            <text x={c.x + W / 2} y={c.y + 29} textAnchor="middle" fontSize={10} fontWeight={600} fill={on ? '#fff' : '#4B5563'}>
              {z.availableSpaces}면
            </text>
          </g>
        );
      })}

      {/* 선택 구역 → 보행 출입구 */}
      <path
        d={`M ${startX} ${startY} L ${startX} ${laneY} L ${GATE.x} ${laneY} L ${GATE.x} ${GATE.y + 9}`}
        fill="none"
        stroke="#111827"
        strokeOpacity={0.55}
        strokeWidth={1.6}
        strokeDasharray="3 3"
        strokeLinejoin="round"
      />
      <circle cx={startX} cy={startY} r={2.6} fill="#fff" stroke="#111827" strokeWidth={1.4} />

      {/* 보행 출입구 */}
      <circle cx={GATE.x} cy={GATE.y} r={9} fill="#2FAF56" />
      <g transform={`translate(${GATE.x - 5} ${GATE.y - 6}) scale(0.42)`} fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="4" r="2" />
        <path d="M4 17l5 1l.75 -1.5" />
        <path d="M15 21l0 -4l-4 -3l1 -6" />
        <path d="M7 12l0 -3l5 -1l3 3l3 1" />
      </g>

      {/* 제1공학관 */}
      <rect x={96} y={92} width={70} height={12} rx={3} fill="#DADDE3" />
      <text x={131} y={101} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#4B5563">
        제1공학관
      </text>
      <path d={`M ${GATE.x} ${laneY} L ${GATE.x} 92`} stroke="#2FAF56" strokeWidth={1.6} strokeDasharray="2 2" />
    </svg>
  );
}
