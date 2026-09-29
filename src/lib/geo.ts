import { CONFIG } from './config';
import type { MapPoint } from './types';

/**
 * 가상 지도 좌표(MapPoint) ↔ 실제 위경도 변환.
 * 앱 데이터는 계속 MapPoint 를 쓰고, 실제 지도(네이버)에 그릴 때만 위경도로 바꾼다.
 * 캠퍼스 범위(수 km) 안에서는 평면 근사로 충분하다.
 */
export interface LatLng {
  lat: number;
  lng: number;
}

const M_PER_DEG_LAT = 111_320;
const { point: ANCHOR_PT, latLng: ANCHOR_LL } = CONFIG.map.geoAnchor;
const MPU = CONFIG.map.metersPerUnit;
const M_PER_DEG_LNG = M_PER_DEG_LAT * Math.cos((ANCHOR_LL.lat * Math.PI) / 180);

export function toLatLng(p: MapPoint): LatLng {
  return {
    lat: ANCHOR_LL.lat - ((p.y - ANCHOR_PT.y) * MPU) / M_PER_DEG_LAT,
    lng: ANCHOR_LL.lng + ((p.x - ANCHOR_PT.x) * MPU) / M_PER_DEG_LNG,
  };
}

export function toMapPoint(ll: LatLng): MapPoint {
  return {
    x: ANCHOR_PT.x + ((ll.lng - ANCHOR_LL.lng) * M_PER_DEG_LNG) / MPU,
    y: ANCHOR_PT.y - ((ll.lat - ANCHOR_LL.lat) * M_PER_DEG_LAT) / MPU,
  };
}

/** Web Mercator(256px 타일) 줌 레벨 z 에서 1px 이 몇 m 인지 */
const metersPerPxAtZoom = (z: number) => (156_543.034 * Math.cos((ANCHOR_LL.lat * Math.PI) / 180)) / 2 ** z;

/** 가상 지도 배율(px / 좌표단위) → 지도 줌 레벨 */
export function scaleToZoom(scale: number): number {
  return Math.log2((156_543.034 * Math.cos((ANCHOR_LL.lat * Math.PI) / 180) * scale) / MPU);
}

/** 지도 줌 레벨 → 가상 지도 배율 */
export function zoomToScale(zoom: number): number {
  return MPU / metersPerPxAtZoom(zoom);
}
