/**
 * 지도 컴포넌트 인터페이스.
 * 지금은 SVG 가상 지도(VirtualMapView)로 구현하고, 추후 카카오/네이버 지도로 교체할 때는
 * 같은 props / handle 을 만족하는 구현체로 바꿔 끼우면 된다.
 */
import type { ReactNode, Ref } from 'react';
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

export interface FlyToOptions {
  scale?: number;
  /** position 이 놓일 화면 좌표(px, 지도 컨테이너 기준). 기본값은 화면 중앙 */
  screenPoint?: { x: number; y: number };
}

export interface MapViewHandle {
  flyTo: (position: MapPoint, options?: FlyToOptions) => void;
  zoomBy: (factor: number) => void;
  getView: () => MapViewState;
  getSize: () => { width: number; height: number };
}

export interface MapViewProps {
  initialView: MapViewState;
  markers: MapMarker[];
  currentLocation?: MapPoint;
  /** 지도 빈 곳을 탭했을 때 (드래그 제외) */
  onMapClick?: () => void;
  /** 이동·확대가 끝났을 때 */
  onViewChangeEnd?: (view: MapViewState, bounds: MapBounds) => void;
  ref?: Ref<MapViewHandle>;
  className?: string;
}

export { default } from './VirtualMapView';
