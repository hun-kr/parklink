'use client';

import { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/cn';
import type { MapPoint } from '@/lib/types';
import { MAX_SCALE, MIN_SCALE, WORLD } from '@/mocks/mapFeatures';
import CampusMapSvg from './CampusMapSvg';
import CurrentLocationDot from './CurrentLocationDot';
import MapLabels from './MapLabels';
import type { FlyToOptions, MapBounds, MapViewProps, MapViewState } from './MapView';

const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
const EASE = [0.25, 0.1, 0.25, 1] as const;

/** SVG 가상 지도 구현체. 드래그 이동, 휠·핀치·버튼 확대, flyTo 애니메이션 지원 */
export default function VirtualMapView({
  initialView,
  markers,
  currentLocation,
  onMapClick,
  onViewChangeEnd,
  ref,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cx = useMotionValue(initialView.center.x);
  const cy = useMotionValue(initialView.center.y);
  const scale = useMotionValue(initialView.scale);
  const width = useMotionValue(390);
  const height = useMotionValue(780);
  const inverse = useTransform(scale, (s) => 1 / s);
  const transform = useTransform(
    [cx, cy, scale, width, height] as const,
    ([x, y, s, w, h]: number[]) => `translate3d(${w / 2 - x * s}px, ${h / 2 - y * s}px, 0) scale(${s})`,
  );

  const onViewChangeEndRef = useRef(onViewChangeEnd);
  onViewChangeEndRef.current = onViewChangeEnd;

  const getView = useCallback(
    (): MapViewState => ({ center: { x: cx.get(), y: cy.get() }, scale: scale.get() }),
    [cx, cy, scale],
  );

  const emitViewEnd = useCallback(() => {
    const s = scale.get();
    const halfW = width.get() / 2 / s;
    const halfH = height.get() / 2 / s;
    const bounds: MapBounds = {
      minX: cx.get() - halfW,
      maxX: cx.get() + halfW,
      minY: cy.get() - halfH,
      maxY: cy.get() + halfH,
    };
    onViewChangeEndRef.current?.(getView(), bounds);
  }, [cx, cy, scale, width, height, getView]);

  /** 지도 밖으로 벗어나지 않게 중심 좌표 제한 */
  const clampCenter = useCallback(
    (p: MapPoint, s: number): MapPoint => {
      const halfW = width.get() / 2 / s;
      const halfH = height.get() / 2 / s;
      const clamp = (v: number, min: number, max: number) => (min > max ? (min + max) / 2 : Math.min(max, Math.max(min, v)));
      return {
        x: clamp(p.x, WORLD.minX + halfW, WORLD.maxX - halfW),
        y: clamp(p.y, WORLD.minY + halfH, WORLD.maxY - halfH),
      };
    },
    [width, height],
  );

  const stopAll = () => {
    cx.stop();
    cy.stop();
    scale.stop();
  };

  const animateTo = useCallback(
    (center: MapPoint, s: number) => {
      const target = clampCenter(center, s);
      const opts = { duration: 0.55, ease: EASE };
      Promise.all([animate(cx, target.x, opts), animate(cy, target.y, opts), animate(scale, s, opts)]).then(
        emitViewEnd,
        () => undefined,
      );
    },
    [cx, cy, scale, clampCenter, emitViewEnd],
  );

  useImperativeHandle(
    ref,
    () => ({
      flyTo: (position: MapPoint, options?: FlyToOptions) => {
        const s = clampScale(options?.scale ?? scale.get());
        const w = width.get();
        const h = height.get();
        const sp = options?.screenPoint ?? { x: w / 2, y: h / 2 };
        animateTo({ x: position.x + (w / 2 - sp.x) / s, y: position.y + (h / 2 - sp.y) / s }, s);
      },
      zoomBy: (factor: number) => {
        animateTo({ x: cx.get(), y: cy.get() }, clampScale(scale.get() * factor));
      },
      getView,
      getSize: () => ({ width: width.get(), height: height.get() }),
    }),
    [animateTo, getView, cx, cy, scale, width, height],
  );

  // 컨테이너 크기 추적
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      width.set(entry.contentRect.width);
      height.set(entry.contentRect.height);
      emitViewEnd();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height, emitViewEnd]);

  // ---- 제스처: 드래그 이동 + 핀치 확대 ----
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    startX: number;
    startY: number;
    cx0: number;
    cy0: number;
    s0: number;
    dist0: number;
    mid0: { x: number; y: number };
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  const localPoint = (e: { clientX: number; clientY: number }) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startGesture = () => {
    const pts = [...pointers.current.values()];
    const mid = pts.length === 2 ? { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 } : pts[0];
    gesture.current = {
      startX: mid.x,
      startY: mid.y,
      cx0: cx.get(),
      cy0: cy.get(),
      s0: scale.get(),
      dist0: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      mid0: mid,
      moved: gesture.current?.moved ?? false,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    stopAll();
    pointers.current.set(e.pointerId, localPoint(e));
    if (pointers.current.size === 1) gesture.current = null;
    startGesture();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, localPoint(e));
    const g = gesture.current;
    const pts = [...pointers.current.values()];
    const mid = pts.length >= 2 ? { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 } : pts[0];

    if (!g.moved && Math.hypot(mid.x - g.startX, mid.y - g.startY) < 5 && pts.length < 2) return;
    if (!g.moved) {
      g.moved = true;
      containerRef.current?.setPointerCapture(e.pointerId);
    }

    let s = g.s0;
    if (pts.length >= 2 && g.dist0 > 0) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      s = clampScale((g.s0 * dist) / g.dist0);
    }
    // 제스처 시작 지점의 월드 좌표가 현재 손가락 중점 아래에 오도록
    const w = width.get();
    const h = height.get();
    const worldX = g.cx0 + (g.mid0.x - w / 2) / g.s0;
    const worldY = g.cy0 + (g.mid0.y - h / 2) / g.s0;
    const next = clampCenter({ x: worldX - (mid.x - w / 2) / s, y: worldY - (mid.y - h / 2) / s }, s);
    scale.set(s);
    cx.set(next.x);
    cy.set(next.y);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.delete(e.pointerId);
    const moved = gesture.current?.moved ?? false;
    if (pointers.current.size > 0) {
      startGesture();
      return;
    }
    gesture.current = null;
    if (moved) {
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 0);
      emitViewEnd();
    }
  };

  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopAll();
      const p = localPoint(e);
      const s0 = scale.get();
      const s = clampScale(s0 * Math.exp(-e.deltaY * 0.0015));
      const w = width.get();
      const h = height.get();
      const worldX = cx.get() + (p.x - w / 2) / s0;
      const worldY = cy.get() + (p.y - h / 2) / s0;
      const next = clampCenter({ x: worldX - (p.x - w / 2) / s, y: worldY - (p.y - h / 2) / s }, s);
      scale.set(s);
      cx.set(next.x);
      cy.set(next.y);
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(emitViewEnd, 200);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampCenter, emitViewEnd]);

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 touch-none select-none overflow-clip bg-[#F1F2EE]', className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      onClick={() => onMapClick?.()}
    >
      <motion.div className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ transform }}>
        <CampusMapSvg />
        <MapLabels scale={scale} inverse={inverse} />

        {currentLocation && (
          <div className="absolute" style={{ left: currentLocation.x, top: currentLocation.y, zIndex: 5 }}>
            <motion.div style={{ scale: inverse, originX: 0, originY: 0 }}>
              <CurrentLocationDot />
            </motion.div>
          </div>
        )}

        {markers.map((m) => (
          <div key={m.id} className="absolute" style={{ left: m.position.x, top: m.position.y, zIndex: 10 + (m.zIndex ?? 0) }}>
            <motion.div style={{ scale: inverse, originX: 0, originY: 0 }}>{m.element}</motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
