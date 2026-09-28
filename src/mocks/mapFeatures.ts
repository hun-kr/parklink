/**
 * 가상 캠퍼스 지도 목데이터 (성균관대학교 자연과학캠퍼스 주변을 단순화한 가상 지도).
 * 좌표 단위는 CONFIG.map.metersPerUnit (1단위 = 1.5m).
 * 실제 지도(카카오/네이버)로 교체하면 이 파일과 CampusMapSvg 는 사용하지 않는다.
 */
import { createRng } from '@/lib/random';
import type { MapPoint } from '@/lib/types';

/** 지도를 그리는 전체 영역 (이 밖으로는 이동 불가) */
export const WORLD = { minX: -500, minY: -400, maxX: 1500, maxY: 1500 };

/** 첫 화면(01 시안) 시점 */
export const INITIAL_VIEW = { center: { x: 470, y: 610 }, scale: 0.62 };
/** 주차장 선택(02 시안) 시 확대 배율 */
export const FOCUS_SCALE = 1.2;
export const MIN_SCALE = 0.35;
export const MAX_SCALE = 2.6;

export interface RectFeature {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RoadFeature {
  d: string;
  width: number;
  kind: 'arterial' | 'major' | 'campus';
}

export type LabelKind = 'school' | 'building' | 'park' | 'station' | 'water' | 'area' | 'campus';

export interface MapLabel {
  id: string;
  text: string;
  position: MapPoint;
  kind: LabelKind;
  /** 이 배율 이상에서만 표시 */
  minScale?: number;
  /** 이 배율 미만에서만 표시 */
  maxScale?: number;
}

/** 캠퍼스 부지 */
export const CAMPUS_AREA = '150,230 780,225 800,690 140,700';

/** 녹지 (캠퍼스 내 숲, 공원) */
export const GREEN_AREAS: string[] = [
  '160,240 330,238 320,290 170,300',
  '690,640 790,630 795,685 700,690',
  '150,640 270,650 260,695 145,700',
  '-500,1000 1500,960 1500,1130 -500,1180',
];

export const ROADS: RoadFeature[] = [
  // 서부로 (동쪽 간선)
  { d: 'M 850 -400 C 835 300, 860 700, 830 1500', width: 26, kind: 'arterial' },
  // 수성로 (북쪽 간선)
  { d: 'M -500 190 L 1500 165', width: 22, kind: 'arterial' },
  // 율전로 (남쪽)
  { d: 'M -500 730 C 200 705, 600 725, 1500 700', width: 20, kind: 'major' },
  // 일월로 (서쪽)
  { d: 'M 110 -400 C 95 200, 120 800, 70 1500', width: 18, kind: 'major' },
  // 남쪽 생활도로
  { d: 'M -500 880 L 1500 850', width: 12, kind: 'major' },
  { d: 'M 330 730 L 320 1000', width: 12, kind: 'major' },
  { d: 'M 640 720 L 655 1000', width: 12, kind: 'major' },
  { d: 'M 1000 180 L 1010 1000', width: 12, kind: 'major' },
  { d: 'M -500 520 L 110 520', width: 12, kind: 'major' },
  // 캠퍼스 순환도로
  { d: 'M 180 260 L 770 255 L 775 665 L 175 672 Z', width: 11, kind: 'campus' },
  // 캠퍼스 내부 도로
  { d: 'M 420 258 L 422 668', width: 10, kind: 'campus' },
  { d: 'M 178 468 L 772 462', width: 10, kind: 'campus' },
  { d: 'M 560 462 L 560 668', width: 8, kind: 'campus' },
  { d: 'M 505 668 L 505 725', width: 10, kind: 'campus' },
  { d: 'M 770 380 L 845 380', width: 10, kind: 'campus' },
];

/** 철도 (1호선) */
export const RAILWAY = 'M -500 975 L 1500 915';

/** 서호천 */
export const RIVER = 'M -500 1080 C 0 1020, 400 1110, 800 1050 S 1300 1030, 1500 1060';

/** 일월저수지 */
export const LAKE = { cx: -210, cy: 450, rx: 190, ry: 240 };

/** 캠퍼스 건물 */
export const CAMPUS_BUILDINGS: (RectFeature & { name?: string })[] = [
  { x: 550, y: 392, w: 92, h: 56, name: '제1공학관' },
  { x: 540, y: 290, w: 80, h: 42, name: '제2공학관' },
  { x: 440, y: 290, w: 72, h: 45, name: '반도체관' },
  { x: 220, y: 300, w: 82, h: 42, name: '약학관' },
  { x: 290, y: 500, w: 80, h: 58, name: '생명과학관' },
  { x: 440, y: 580, w: 90, h: 60, name: '삼성학술정보관' },
  { x: 200, y: 585, w: 70, h: 45, name: '학생회관' },
  { x: 680, y: 262, w: 26, h: 80 },
  { x: 718, y: 262, w: 26, h: 80 },
  { x: 330, y: 380, w: 60, h: 60 },
  { x: 250, y: 400, w: 50, h: 40 },
];

/** 주차장 부지 (칸 줄무늬) */
export const PARKING_SURFACES: (RectFeature & { lotId: string })[] = [
  { lotId: 'skku-eng1', x: 440, y: 400, w: 100, h: 54 },
  { lotId: 'skku-pharm', x: 200, y: 350, w: 50, h: 24 },
  { lotId: 'skku-life', x: 225, y: 525, w: 50, h: 30 },
  { lotId: 'skku-stadium', x: 572, y: 480, w: 58, h: 22 },
  { lotId: 'skku-dorm', x: 616, y: 343, w: 48, h: 24 },
  { lotId: 'yuljeon-public', x: 535, y: 766, w: 50, h: 28 },
  { lotId: 'yuljeon-private', x: 230, y: 788, w: 40, h: 24 },
  { lotId: 'skku-station', x: 370, y: 905, w: 60, h: 26 },
];

/** 대운동장 */
export const STADIUM = { x: 600, y: 505, w: 160, h: 130 };

export const LABELS: MapLabel[] = [
  { id: 'campus-far', text: '성균관대 자연과학캠퍼스', position: { x: 430, y: 255 }, kind: 'campus', maxScale: 0.85 },
  { id: 'campus', text: '성균관대학교\n자연과학캠퍼스', position: { x: 440, y: 318 }, kind: 'school', minScale: 0.85 },
  { id: 'eng1', text: '제1공학관', position: { x: 596, y: 420 }, kind: 'building', minScale: 0.85 },
  { id: 'eng2', text: '제2공학관', position: { x: 580, y: 312 }, kind: 'building', minScale: 1.1 },
  { id: 'semi', text: '반도체관', position: { x: 476, y: 312 }, kind: 'building', minScale: 1.6 },
  { id: 'pharm', text: '약학관', position: { x: 261, y: 321 }, kind: 'building', minScale: 1.1 },
  { id: 'life', text: '생명과학관', position: { x: 330, y: 529 }, kind: 'building', minScale: 0.85 },
  { id: 'library', text: '삼성학술정보관', position: { x: 485, y: 610 }, kind: 'building', minScale: 0.85 },
  { id: 'union', text: '학생회관', position: { x: 235, y: 607 }, kind: 'building', minScale: 1.1 },
  { id: 'stadium', text: '대운동장', position: { x: 680, y: 575 }, kind: 'park', minScale: 0.85 },
  { id: 'dorm', text: '기숙사', position: { x: 712, y: 302 }, kind: 'building', minScale: 1.1 },
  { id: 'school', text: '율전중학교', position: { x: 930, y: 440 }, kind: 'school', minScale: 0.85 },
  { id: 'station', text: '성균관대역', position: { x: 405, y: 985 }, kind: 'station' },
  { id: 'river', text: '서호천', position: { x: 180, y: 1062 }, kind: 'water' },
  { id: 'lake', text: '일월저수지', position: { x: -170, y: 450 }, kind: 'water' },
  { id: 'yuljeon', text: '율전동', position: { x: 760, y: 800 }, kind: 'area' },
  { id: 'cheoncheon', text: '천천동', position: { x: 1150, y: 420 }, kind: 'area' },
  { id: 'jeongja', text: '정자동', position: { x: 450, y: 90 }, kind: 'area' },
];

/** 주거지 블록: 영역 안을 시드 고정 격자로 채운다 */
function generateCityBlocks(): RectFeature[] {
  const rng = createRng(2066);
  const regions: { x0: number; y0: number; x1: number; y1: number }[] = [
    { x0: -500, y0: -400, x1: 1500, y1: 170 }, // 북쪽
    { x0: 125, y0: 745, x1: 1500, y1: 945 }, // 남쪽 (율전동)
    { x0: -500, y0: 540, x1: 95, y1: 960 }, // 남서쪽
    { x0: 870, y0: 190, x1: 1500, y1: 700 }, // 동쪽
    { x0: -500, y0: 1150, x1: 1500, y1: 1500 }, // 강 남쪽
  ];
  const skip = (x: number, y: number, w: number, h: number) =>
    // 율전중학교 운동장, 주차장 부지 주변은 비워 둔다
    (x < 1010 && x + w > 880 && y < 480 && y + h > 400) ||
    PARKING_SURFACES.some((p) => x < p.x + p.w + 6 && x + w > p.x - 6 && y < p.y + p.h + 6 && y + h > p.y - 6) ||
    (x < 445 && x + w > 360 && y < 945 && y + h > 895);

  const blocks: RectFeature[] = [];
  for (const r of regions) {
    for (let y = r.y0 + 10; y < r.y1 - 20; y += 46) {
      for (let x = r.x0 + 10; x < r.x1 - 30; x += 58) {
        if (rng() < 0.12) continue;
        const w = 30 + rng() * 18;
        const h = 22 + rng() * 14;
        if (skip(x, y, w, h)) continue;
        blocks.push({ x, y, w, h });
      }
    }
  }
  return blocks;
}

export const CITY_BLOCKS = generateCityBlocks();
