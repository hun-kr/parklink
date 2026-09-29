/**
 * 길안내 Mock 경로 (가상 지도 좌표). 도로(mapFeatures.ROADS)를 따라 그렸다.
 * 출발: 율전동 남쪽 도로 → 율전로 → 캠퍼스 정문 → 캠퍼스 도로 → 제1공학관 주차장 입구 (약 1.1km)
 */
import { toMapPoint } from '@/lib/geo';
import type { MapPoint } from '@/lib/types';

/** 차량 출발 지점 (Mock 현재 차량 위치) — NAV_ROUTES_GEO 첫 점과 같은 위치 */
export const NAV_START: MapPoint & { label: string } = { ...toMapPoint({ lat: 37.286758, lng: 126.978117 }), label: '율전동' };

/**
 * 길안내 경유지 (실제 위경도). 네이버 지도와 가상 지도 모두 이 값을 가상 좌표로 바꿔 쓴다.
 * 길찾기(Directions) API 없이 동작하도록 경로를 직접 지정한다.
 * 수정 방법: 네이버 지도에서 지점을 우클릭 → 좌표 복사 → 아래 [위도, 경도] 를 바꾼다.
 * 도로 모퉁이마다 점 하나씩 찍으면 회전 안내(좌회전·우회전)가 자동으로 계산된다.
 * ※ 현재 값은 캠퍼스 대략 위치 기준 추정치이므로 현장 도로에 맞게 보정이 필요하다.
 */
export const NAV_ROUTES_GEO: Record<string, [lat: number, lng: number][]> = {
  'skku-eng1': [
    [37.286758, 126.978117], // 출발 (율전동)
    [37.290383, 126.977896], // 율전로 합류 → 좌회전
    [37.290424, 126.975593], // 캠퍼스 정문 → 우회전
    [37.291091, 126.975593], // 순환도로 → 우회전
    [37.291097, 126.976524], // 좌회전
    [37.293846, 126.976524], // 좌회전
    [37.293839, 126.975593], // 우회전 → 주차장 입구
    [37.294008, 126.975593], // 제1공학관 주차장 입구
  ],
};

export const NAV_ROUTES: Record<string, MapPoint[]> = Object.fromEntries(
  Object.entries(NAV_ROUTES_GEO).map(([id, pts]) => [id, pts.map(([lat, lng]) => toMapPoint({ lat, lng }))]),
);

/** 정의되지 않은 주차장: 출발지 → 율전로 → 주차장 방향으로 꺾이는 단순 경로 */
export function fallbackRoute(target: MapPoint): MapPoint[] {
  const junction = NAV_ROUTES['skku-eng1'][1];
  return [NAV_START, junction, { x: target.x, y: junction.y }, target];
}
