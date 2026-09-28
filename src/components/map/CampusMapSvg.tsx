import { memo } from 'react';
import {
  CAMPUS_AREA,
  CAMPUS_BUILDINGS,
  CITY_BLOCKS,
  GREEN_AREAS,
  LAKE,
  PARKING_SURFACES,
  RAILWAY,
  RIVER,
  ROADS,
  STADIUM,
  WORLD,
} from '@/mocks/mapFeatures';

const C = {
  land: '#F1F2EE',
  campus: '#E6F1DF',
  green: '#D6EACD',
  water: '#BFDDF3',
  waterEdge: '#A9CFEC',
  building: '#E3E5E9',
  buildingEdge: '#D2D6DC',
  campusBuilding: '#DADDE3',
  road: '#FFFFFF',
  roadEdge: '#E1E3E7',
  arterial: '#FDF0CF',
  arterialEdge: '#EDD49A',
  parking: '#D9DDE3',
  field: '#BFE0B3',
  track: '#E9CFB4',
  rail: '#8C95A3',
};

/** SVG 로 그린 가상 캠퍼스 지도 (월드 좌표 그대로 그린다) */
function CampusMapSvg() {
  const w = WORLD.maxX - WORLD.minX;
  const h = WORLD.maxY - WORLD.minY;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`${WORLD.minX} ${WORLD.minY} ${w} ${h}`}
      style={{ position: 'absolute', left: WORLD.minX, top: WORLD.minY }}
      aria-hidden
    >
      <defs>
        <pattern id="parking-stripes" width="6" height="12" patternUnits="userSpaceOnUse">
          <rect width="6" height="12" fill={C.parking} />
          <line x1="0" y1="0" x2="0" y2="12" stroke="#FFFFFF" strokeWidth="0.9" />
        </pattern>
      </defs>

      <rect x={WORLD.minX} y={WORLD.minY} width={w} height={h} fill={C.land} />

      {/* 녹지·캠퍼스 */}
      <polygon points={CAMPUS_AREA} fill={C.campus} />
      {GREEN_AREAS.map((pts) => (
        <polygon key={pts} points={pts} fill={C.green} />
      ))}

      {/* 물 */}
      <ellipse {...LAKE} fill={C.water} stroke={C.waterEdge} strokeWidth={2} />
      <path d={RIVER} fill="none" stroke={C.waterEdge} strokeWidth={66} strokeLinecap="round" />
      <path d={RIVER} fill="none" stroke={C.water} strokeWidth={62} strokeLinecap="round" />

      {/* 주거지 블록 */}
      {CITY_BLOCKS.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={2} fill={C.building} stroke={C.buildingEdge} strokeWidth={0.8} />
      ))}

      {/* 율전중학교 운동장 */}
      <rect x={890} y={405} width={110} height={70} rx={6} fill={C.field} />

      {/* 대운동장 */}
      <rect x={STADIUM.x} y={STADIUM.y} width={STADIUM.w} height={STADIUM.h} rx={60} fill={C.track} />
      <rect x={STADIUM.x + 14} y={STADIUM.y + 14} width={STADIUM.w - 28} height={STADIUM.h - 28} rx={46} fill={C.field} />

      {/* 도로: 테두리 → 채움 순서 */}
      {ROADS.map((r) => (
        <path
          key={`e-${r.d}`}
          d={r.d}
          fill="none"
          stroke={r.kind === 'arterial' ? C.arterialEdge : C.roadEdge}
          strokeWidth={r.width + 3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      {ROADS.map((r) => (
        <path
          key={`f-${r.d}`}
          d={r.d}
          fill="none"
          stroke={r.kind === 'arterial' ? C.arterial : C.road}
          strokeWidth={r.width}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {/* 철도 */}
      <path d={RAILWAY} fill="none" stroke={C.rail} strokeWidth={7} />
      <path d={RAILWAY} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeDasharray="14 12" />
      <rect x={365} y={935} width={80} height={16} rx={4} fill="#9FB7DA" transform="rotate(-1.7 405 943)" />

      {/* 주차장 부지 */}
      {PARKING_SURFACES.map((p) => (
        <rect key={p.lotId} x={p.x} y={p.y} width={p.w} height={p.h} rx={3} fill="url(#parking-stripes)" stroke="#C9CED6" strokeWidth={1} />
      ))}

      {/* 캠퍼스 건물 */}
      {CAMPUS_BUILDINGS.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={3} fill={C.campusBuilding} stroke={C.buildingEdge} strokeWidth={1} />
      ))}
    </svg>
  );
}

export default memo(CampusMapSvg);
