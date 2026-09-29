'use client';

/**
 * 지도 컴포넌트 인터페이스.
 * 기본은 네이버 지도(NaverMapView)이고, Client ID 가 없거나 로드·인증에 실패하면
 * SVG 가상 지도(VirtualMapView)로 자동 대체한다. 두 구현체 모두 같은 props / handle 을 만족한다.
 * 좌표는 항상 가상 지도 좌표(MapPoint)이며, 네이버 지도는 lib/geo 로 위경도로 바꿔 그린다.
 */
import type { ReactNode, Ref } from 'react';
import { useMapProviderStore } from '@/store/useMapProviderStore';
import NaverMapView from './NaverMapView';
import VirtualMapView from './VirtualMapView';
import type { MapPoint } from '@/lib/types';

export interface MapViewState {
  center: MapPoint;
  scale: number;
}

export interface MapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface MapMarker {
  id: string;
  position: MapPoint;
  zIndex?: number;
  /** 요소의 (0,0) 이 position 에 놓인다. 말풍선 꼬리 정렬은 요소가 직접 처리한다. */
  element: ReactNode;
}

/** 경로 등 선 그리기 (월드 좌표, 두께도 월드 단위) */
export interface MapPolyline {
  id: string;
  points: MapPoint[];
  color: string;
  width: number;
  /** 테두리 색 (없으면 생략) */
  casing?: string;
  /** 진행 방향 화살표 간격 (없으면 생략) */
  arrowSpacing?: number;
}

export interface FlyToOptions {
  scale?: number;
  /** position 이 놓일 화면 좌표(px, 지도 컨테이너 기준). 기본값은 화면 중앙 */
  screenPoint?: { x: number; y: number };
}

export interface MapViewHandle {
  flyTo: (position: MapPoint, options?: FlyToOptions) => void;
  /** 애니메이션 없이 즉시 이동 (차량 따라가기 등 매 프레임 갱신용) */
  jumpTo: (position: MapPoint, options?: FlyToOptions) => void;
  zoomBy: (factor: number) => void;
  getView: () => MapViewState;
  getSize: () => { width: number; height: number };
}

export interface MapViewProps {
  initialView: MapViewState;
  markers: MapMarker[];
  polylines?: MapPolyline[];
  currentLocation?: MapPoint;
  /** 사용자가 지도를 직접 움직이기 시작했을 때 */
  onUserInteract?: () => void;
  /** 지도 빈 곳을 탭했을 때 (드래그 제외) */
  onMapClick?: () => void;
  /** 이동·확대가 끝났을 때 */
  onViewChangeEnd?: (view: MapViewState, bounds: MapBounds) => void;
  ref?: Ref<MapViewHandle>;
  className?: string;
}

export default function MapView(props: MapViewProps) {
  const provider = useMapProviderStore((s) => s.provider);
  return provider === 'virtual' ? <VirtualMapView {...props} /> : <NaverMapView {...props} />;
}
