'use client';

import { useCallback, useEffect, useRef } from 'react';
import { animate, useMotionValue, useTransform } from 'framer-motion';
import type { MapPoint } from '@/lib/types';

export interface PanZoomBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface PanZoomLimits {
  minScale: number;
  maxScale: number;
  /** 월드 영역. 화면이 이 밖으로 나가지 않게 중심을 제한한다 */
  bounds: PanZoomBounds;
}

export interface PanZoomView {
  center: MapPoint;
  scale: number;
}

const EASE = [0.25, 0.1, 0.25, 1] as const;

/**
 * 드래그 이동 · 핀치 · 휠 확대 · 애니메이션 이동을 제공하는 공통 훅.
 * 지도(VirtualMapView)와 주차장 평면도(ParkingMap)가 함께 쓴다.
 * 반환된 transform 을 월드 레이어(origin 0 0)에 적용하면 된다.
 */
export function usePanZoom({
  initialCenter,
  initialScale,
  getLimits,
  onViewChangeEnd,
  onGestureStart,
}: {
  initialCenter: MapPoint;
  initialScale: number;
  getLimits: (size: { width: number; height: number }) => PanZoomLimits;
  onViewChangeEnd?: (view: PanZoomView, visible: PanZoomBounds) => void;
  /** 드래그·핀치·휠로 사용자가 직접 움직이기 시작할 때 */
  onGestureStart?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cx = useMotionValue(initialCenter.x);
  const cy = useMotionValue(initialCenter.y);
  const scale = useMotionValue(initialScale);
  const width = useMotionValue(390);
  const height = useMotionValue(780);
  const inverse = useTransform(scale, (s) => 1 / s);
  const transform = useTransform(
    [cx, cy, scale, width, height] as const,
    ([x, y, s, w, h]: number[]) => `translate3d(${w / 2 - x * s}px, ${h / 2 - y * s}px, 0) scale(${s})`,
  );

  const getLimitsRef = useRef(getLimits);
  getLimitsRef.current = getLimits;
  const onViewChangeEndRef = useRef(onViewChangeEnd);
  onViewChangeEndRef.current = onViewChangeEnd;
  const onGestureStartRef = useRef(onGestureStart);
  onGestureStartRef.current = onGestureStart;

  const limits = useCallback(() => getLimitsRef.current({ width: width.get(), height: height.get() }), [width, height]);

  const clampScale = useCallback(
    (s: number) => {
      const { minScale, maxScale } = limits();
      return Math.min(maxScale, Math.max(minScale, s));
    },
    [limits],
  );

  const getView = useCallback((): PanZoomView => ({ center: { x: cx.get(), y: cy.get() }, scale: scale.get() }), [cx, cy, scale]);

  const emitViewEnd = useCallback(() => {
    const s = scale.get();
    const halfW = width.get() / 2 / s;
    const halfH = height.get() / 2 / s;
    onViewChangeEndRef.current?.(getView(), {
      minX: cx.get() - halfW,
      maxX: cx.get() + halfW,
      minY: cy.get() - halfH,
      maxY: cy.get() + halfH,
    });
  }, [cx, cy, scale, width, height, getView]);

  const clampCenter = useCallback(
    (p: MapPoint, s: number): MapPoint => {
      const { bounds } = limits();
      const halfW = width.get() / 2 / s;
      const halfH = height.get() / 2 / s;
      const clamp = (v: number, min: number, max: number) => (min > max ? (min + max) / 2 : Math.min(max, Math.max(min, v)));
      return {
        x: clamp(p.x, bounds.minX + halfW, bounds.maxX - halfW),
        y: clamp(p.y, bounds.minY + halfH, bounds.maxY - halfH),
      };
    },
    [limits, width, height],
  );

  const stopAll = useCallback(() => {
    cx.stop();
    cy.stop();
    scale.stop();
  }, [cx, cy, scale]);

  /** center 를 화면 중앙에, 배율 s 로 애니메이션 이동 */
  const animateTo = useCallback(
    (center: MapPoint, s: number, duration = 0.55) => {
      const ts = clampScale(s);
      const target = clampCenter(center, ts);
      const opts = { duration, ease: EASE };
      Promise.all([animate(cx, target.x, opts), animate(cy, target.y, opts), animate(scale, ts, opts)]).then(
        emitViewEnd,
        () => undefined,
      );
    },
    [cx, cy, scale, clampScale, clampCenter, emitViewEnd],
  );

  /** 애니메이션 없이 즉시 설정 */
  const jumpTo = useCallback(
    (center: MapPoint, s: number) => {
      const ts = clampScale(s);
      const target = clampCenter(center, ts);
      scale.set(ts);
      cx.set(target.x);
      cy.set(target.y);
      emitViewEnd();
    },
    [cx, cy, scale, clampScale, clampCenter, emitViewEnd],
  );

  const onResizeRef = useRef<((size: { width: number; height: number }) => void) | null>(null);

  // 컨테이너 크기 추적
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      width.set(entry.contentRect.width);
      height.set(entry.contentRect.height);
      onResizeRef.current?.({ width: entry.contentRect.width, height: entry.contentRect.height });
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
      onGestureStartRef.current?.();
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

  const onClickCapture = (e: React.MouseEvent) => {
    if (suppressClick.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // 휠 확대 (커서 위치 기준)
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopAll();
      onGestureStartRef.current?.();
      const rect = el.getBoundingClientRect();
      const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
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
  }, [cx, cy, scale, width, height, stopAll, clampScale, clampCenter, emitViewEnd]);

  return {
    containerRef,
    cx,
    cy,
    scale,
    width,
    height,
    inverse,
    transform,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onClickCapture,
    },
    animateTo,
    jumpTo,
    getView,
    clampScale,
    /** 컨테이너 크기가 바뀔 때 호출할 콜백 등록 (초기 맞춤 등) */
    onResizeRef,
  };
}
