/**
 * 길안내 Mock 경로 (가상 지도 좌표). 도로(mapFeatures.ROADS)를 따라 그렸다.
 * 출발: 율전동 남쪽 도로 → 율전로 → 캠퍼스 정문 → 캠퍼스 도로 → 제1공학관 주차장 입구 (약 1.1km)
 */
import type { MapPoint } from '@/lib/types';

/** 차량 출발 지점 (Mock 현재 차량 위치) */
export const NAV_START: MapPoint & { label: string } = { x: 654, y: 990, label: '율전동' };

export const NAV_ROUTES: Record<string, MapPoint[]> = {
  'skku-eng1': [
    NAV_START,
    { x: 641, y: 721 }, // 율전로 합류 → 좌회전
    { x: 505, y: 718 }, // 캠퍼스 정문 → 우회전
    { x: 505, y: 668.5 }, // 순환도로 → 우회전
    { x: 560, y: 668 }, // 좌회전
    { x: 560, y: 464 }, // 좌회전
    { x: 505, y: 464.5 }, // 우회전 → 주차장 입구
    { x: 505, y: 452 },
  ],
};

/** 정의되지 않은 주차장: 출발지 → 율전로 → 주차장 방향으로 꺾이는 단순 경로 */
export function fallbackRoute(target: MapPoint): MapPoint[] {
  return [NAV_START, { x: 641, y: 721 }, { x: target.x, y: 718 }, target];
}
