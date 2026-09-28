import type { MapPoint } from './types';

/** 경로 기하: 누적 거리 기반으로 위치·진행 방향·회전 안내를 계산한다. 거리 단위는 좌표 단위. */
export interface RouteGeometry {
  points: MapPoint[];
  /** cum[i] = 시작점에서 points[i] 까지 거리 */
  cum: number[];
  total: number;
}

export type TurnDir = 'left' | 'right' | 'straight';

export interface Maneuver {
  /** 경로 시작점에서 이 안내 지점까지 거리 */
  at: number;
  type: TurnDir | 'arrive';
  point: MapPoint;
}

export function buildRoute(points: MapPoint[]): RouteGeometry {
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  return { points, cum, total: cum[cum.length - 1] };
}

/** 진행 방향(도, 북쪽 0 · 시계방향) */
function headingOf(a: MapPoint, b: MapPoint) {
  return (Math.atan2(b.x - a.x, -(b.y - a.y)) * 180) / Math.PI;
}

/** 거리 d 지점의 좌표와 진행 방향 */
export function pointAt(route: RouteGeometry, d: number) {
  const dist = Math.min(Math.max(d, 0), route.total);
  let i = 1;
  while (i < route.cum.length - 1 && route.cum[i] < dist) i++;
  const a = route.points[i - 1];
  const b = route.points[i];
  const segLen = route.cum[i] - route.cum[i - 1] || 1;
  const t = (dist - route.cum[i - 1]) / segLen;
  return {
    point: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t },
    heading: headingOf(a, b),
    segment: i - 1,
  };
}

/** 거리 d 이후 남은 경로 좌표 */
export function remainingPoints(route: RouteGeometry, d: number): MapPoint[] {
  const { point, segment } = pointAt(route, d);
  return [point, ...route.points.slice(segment + 1)];
}

/** 세 점의 회전 방향 (화면 좌표: y 아래로 증가) */
export function turnDir(a: MapPoint, b: MapPoint, c: MapPoint): TurnDir {
  const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
  const len = Math.hypot(b.x - a.x, b.y - a.y) * Math.hypot(c.x - b.x, c.y - b.y) || 1;
  const sin = cross / len;
  if (Math.abs(sin) < 0.35) return 'straight';
  return sin > 0 ? 'right' : 'left';
}

/** 회전 지점 + 도착 안내 목록 */
export function maneuvers(route: RouteGeometry): Maneuver[] {
  const list: Maneuver[] = [];
  for (let i = 1; i < route.points.length - 1; i++) {
    const type = turnDir(route.points[i - 1], route.points[i], route.points[i + 1]);
    if (type !== 'straight') list.push({ at: route.cum[i], type, point: route.points[i] });
  }
  list.push({ at: route.total, type: 'arrive', point: route.points[route.points.length - 1] });
  return list;
}

export const MANEUVER_TEXT: Record<Maneuver['type'], string> = {
  right: '우측으로 이동',
  left: '좌측으로 이동',
  straight: '직진',
  arrive: '주차장 입구 도착',
};

/** 안내 거리 표기: 100m 이상은 10m 단위, 그 아래는 5m 단위 */
export function roundGuideMeters(m: number) {
  if (m >= 100) return Math.round(m / 10) * 10;
  return Math.max(5, Math.round(m / 5) * 5);
}

/** 경로를 따라 일정 간격의 화살표 위치·방향 */
export function arrowsAlong(points: MapPoint[], spacing: number, offset = spacing / 2) {
  const out: { point: MapPoint; heading: number }[] = [];
  let carry = offset;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const heading = headingOf(a, b);
    let d = carry;
    while (d < len) {
      const t = d / len;
      out.push({ point: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, heading });
      d += spacing;
    }
    carry = d - len;
  }
  return out;
}
