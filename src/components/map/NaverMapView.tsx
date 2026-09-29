'use client';

import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { scaleToZoom, toLatLng, toMapPoint, zoomToScale } from '@/lib/geo';
import { loadNaverMaps, onNaverAuthFailure } from '@/lib/naverMapsLoader';
import type { MapPoint } from '@/lib/types';
import { useMapProviderStore } from '@/store/useMapProviderStore';
import { toast } from '@/store/useToastStore';
import CurrentLocationDot from './CurrentLocationDot';
import type { FlyToOptions, MapBounds, MapViewProps, MapViewState } from './MapView';

const MIN_ZOOM = 10;
const MAX_ZOOM = 20;
const ME_ID = '__current-location';
/** 마커를 누른 직후 들어오는 지도 click 은 무시한다 (마커 선택 → 바로 선택 해제 방지) */
const MARKER_TAP_GUARD_MS = 400;

/** 네이버 LatLng 은 (위도, 경도) 숫자 인자로 만든다 (객체 인자는 런타임에서 지원되지 않을 수 있음) */
const toNaverLatLng = (p: MapPoint) => {
  const { lat, lng } = toLatLng(p);
  return new naver.maps.LatLng(lat, lng);
};

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z)));

interface MarkerEntry {
  el: HTMLDivElement;
  marker: naver.maps.Marker | null;
}

interface LineEntry {
  line: naver.maps.Polyline;
  casing: naver.maps.Polyline | null;
}

/**
 * 네이버 지도 구현체. MapView 인터페이스(가상 지도 좌표)를 그대로 받아 위경도로 바꿔 그린다.
 * 마커는 React 요소를 포털로 네이버 마커(HTML 아이콘) 안에 렌더링한다.
 */
export default function NaverMapView({
  initialView,
  markers,
  polylines,
  currentLocation,
  onMapClick,
  onViewChangeEnd,
  onUserInteract,
  ref,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const [ready, setReady] = useState(false);
  const setProvider = useMapProviderStore((s) => s.setProvider);

  const markerEntries = useRef(new Map<string, MarkerEntry>());
  const lineEntries = useRef(new Map<string, LineEntry>());
  const lastMarkerTap = useRef(0);

  // 최신 콜백을 ref 로 들고 있어 지도 이벤트 리스너를 다시 달지 않는다
  const cb = useRef({ onMapClick, onViewChangeEnd, onUserInteract });
  cb.current = { onMapClick, onViewChangeEnd, onUserInteract };

  /** 마커 포털 컨테이너 (렌더 중 필요하므로 지연 생성) */
  const containerFor = (id: string) => {
    let entry = markerEntries.current.get(id);
    if (!entry) {
      const el = document.createElement('div');
      el.addEventListener('pointerdown', () => (lastMarkerTap.current = Date.now()));
      entry = { el, marker: null };
      markerEntries.current.set(id, entry);
    }
    return entry.el;
  };

  // ---- 지도 생성 ----
  useEffect(() => {
    let cancelled = false;
    let listeners: naver.maps.MapEventListener[] = [];
    const container = containerRef.current!;
    const onWheel = () => cb.current.onUserInteract?.();

    const fallback = (reason: string) => {
      if (cancelled) return;
      console.warn(`[ParkLink] 가상 지도로 대체: ${reason}`);
      setProvider('virtual', reason);
    };

    loadNaverMaps()
      .then((maps) => {
        if (cancelled) return;
        const map = new maps.Map(container, {
          center: toNaverLatLng(initialView.center),
          zoom: clampZoom(scaleToZoom(initialView.scale)),
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
          background: '#F1F2EE',
          zoomControl: false,
          scaleControl: false,
          mapDataControl: false,
          logoControl: true,
          logoControlOptions: { position: maps.Position.LEFT_CENTER },
        });
        mapRef.current = map;
        const c = map.getCenter();
        if (!Number.isFinite(c.x) || !Number.isFinite(c.y)) {
          map.destroy();
          mapRef.current = null;
          fallback('네이버 지도 좌표 초기화 실패');
          return;
        }

        const view = (): MapViewState => ({
          center: toMapPoint({ lat: map.getCenter().y, lng: map.getCenter().x }),
          scale: zoomToScale(map.getZoom()),
        });
        const bounds = (): MapBounds => {
          const b = map.getBounds();
          const min = toMapPoint({ lat: b.getMin().y, lng: b.getMin().x });
          const max = toMapPoint({ lat: b.getMax().y, lng: b.getMax().x });
          return { minX: min.x, maxX: max.x, minY: Math.min(min.y, max.y), maxY: Math.max(min.y, max.y) };
        };

        listeners = [
          maps.Event.addListener(map, 'idle', () => cb.current.onViewChangeEnd?.(view(), bounds())),
          maps.Event.addListener(map, 'dragstart', () => cb.current.onUserInteract?.()),
          maps.Event.addListener(map, 'pinchstart', () => cb.current.onUserInteract?.()),
          maps.Event.addListener(map, 'click', () => {
            if (Date.now() - lastMarkerTap.current < MARKER_TAP_GUARD_MS) return;
            cb.current.onMapClick?.();
          }),
        ];
        container.addEventListener('wheel', onWheel, { passive: true });

        setProvider('naver');
        setReady(true);
        // 첫 idle 전에도 목록·축척이 맞도록 한 번 알려 준다
        cb.current.onViewChangeEnd?.(view(), bounds());
      })
      .catch((e: Error) => fallback(e.message));

    const offAuth = onNaverAuthFailure(() => {
      toast('네이버 지도 인증에 실패해 가상 지도로 표시해요.');
      fallback('네이버 지도 인증 실패 (Web 서비스 URL 등록 확인)');
    });

    return () => {
      cancelled = true;
      offAuth();
      container.removeEventListener('wheel', onWheel);
      if (typeof naver !== 'undefined') naver.maps.Event.removeListener(listeners);
      markerEntries.current.forEach((m) => m.marker?.setMap(null));
      markerEntries.current.clear();
      lineEntries.current.forEach((l) => {
        l.line.setMap(null);
        l.casing?.setMap(null);
      });
      lineEntries.current.clear();
      mapRef.current?.destroy();
      mapRef.current = null;
    };
    // 지도는 한 번만 만든다 (initialView 는 최초 값만 사용)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 마커 동기화 ----
  const allMarkers = [
    ...(currentLocation ? [{ id: ME_ID, position: currentLocation, zIndex: -5, element: <CurrentLocationDot /> }] : []),
    ...markers,
  ];
  const markerKey = allMarkers.map((m) => `${m.id}:${m.position.x.toFixed(2)},${m.position.y.toFixed(2)}:${m.zIndex ?? 0}`).join('|');

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const seen = new Set<string>();
    for (const m of allMarkers) {
      seen.add(m.id);
      const entry = markerEntries.current.get(m.id);
      if (!entry) continue;
      const position = toNaverLatLng(m.position);
      const zIndex = 10 + (m.zIndex ?? 0);
      if (!entry.marker) {
        entry.marker = new naver.maps.Marker({
          map,
          position,
          zIndex,
          clickable: true,
          icon: { content: entry.el, anchor: new naver.maps.Point(0, 0) },
        });
      } else {
        entry.marker.setPosition(position);
        entry.marker.setZIndex(zIndex);
      }
    }
    markerEntries.current.forEach((entry, id) => {
      if (seen.has(id)) return;
      entry.marker?.setMap(null);
      markerEntries.current.delete(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, markerKey]);

  // ---- 경로 선 동기화 ----
  const lines = polylines ?? [];
  const lineKey = lines.map((l) => `${l.id}:${l.points.length}:${l.points[0]?.x.toFixed(1)},${l.points[0]?.y.toFixed(1)}`).join('|');

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const seen = new Set<string>();
    for (const l of lines) {
      seen.add(l.id);
      const path = l.points.map((p: MapPoint) => toNaverLatLng(p));
      const entry = lineEntries.current.get(l.id);
      if (entry) {
        entry.line.setPath(path);
        entry.casing?.setPath(path);
        continue;
      }
      const common = { map, path, strokeLineCap: 'round', strokeLineJoin: 'round', clickable: false } as const;
      lineEntries.current.set(l.id, {
        casing: l.casing ? new naver.maps.Polyline({ ...common, strokeColor: l.casing, strokeWeight: l.width + 4, zIndex: 1 }) : null,
        line: new naver.maps.Polyline({ ...common, strokeColor: l.color, strokeWeight: l.width, zIndex: 2 }),
      });
    }
    lineEntries.current.forEach((entry, id) => {
      if (seen.has(id)) return;
      entry.line.setMap(null);
      entry.casing?.setMap(null);
      lineEntries.current.delete(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, lineKey]);

  // ---- 명령형 핸들 ----
  const centerFor = (map: naver.maps.Map, position: MapPoint, options?: FlyToOptions) => {
    const zoom = options?.scale !== undefined ? clampZoom(scaleToZoom(options.scale)) : map.getZoom();
    const s = zoomToScale(zoom);
    const w = containerRef.current?.clientWidth ?? 0;
    const h = containerRef.current?.clientHeight ?? 0;
    const sp = options?.screenPoint ?? { x: w / 2, y: h / 2 };
    const center = { x: position.x + (w / 2 - sp.x) / s, y: position.y + (h / 2 - sp.y) / s };
    return { latLng: toNaverLatLng(center), zoom };
  };

  useImperativeHandle(
    ref,
    () => ({
      flyTo: (position, options) => {
        const map = mapRef.current;
        if (!map) return;
        const { latLng, zoom } = centerFor(map, position, options);
        map.morph(latLng, zoom, { duration: 450, easing: 'easeOutCubic' });
      },
      jumpTo: (position, options) => {
        const map = mapRef.current;
        if (!map) return;
        const { latLng, zoom } = centerFor(map, position, options);
        if (zoom !== map.getZoom()) map.setZoom(zoom, false);
        map.setCenter(latLng);
      },
      zoomBy: (factor) => {
        const map = mapRef.current;
        if (!map) return;
        const delta = Math.log2(factor);
        map.setZoom(clampZoom(map.getZoom() + Math.sign(delta) * Math.max(1, Math.round(Math.abs(delta)))), true);
      },
      getView: () => {
        const map = mapRef.current;
        if (!map) return initialView;
        const c = map.getCenter();
        return { center: toMapPoint({ lat: c.y, lng: c.x }), scale: zoomToScale(map.getZoom()) };
      },
      getSize: () => ({ width: containerRef.current?.clientWidth ?? 0, height: containerRef.current?.clientHeight ?? 0 }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialView],
  );

  return (
    // 네이버 지도는 지도 요소에 position: relative 를 강제하므로, 위치 지정은 바깥 래퍼가 맡고
    // 지도 요소는 래퍼를 100% 로 채운다 (지도 요소에 absolute inset-0 을 주면 높이가 0 이 된다)
    <div className={cn('absolute inset-0 isolate overflow-clip bg-[#F1F2EE]', className)}>
      <div ref={containerRef} className="h-full w-full" />
      {ready && allMarkers.map((m) => createPortal(m.element, containerFor(m.id), m.id))}
    </div>
  );
}
