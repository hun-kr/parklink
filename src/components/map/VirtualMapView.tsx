'use client';

import { memo, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { usePanZoom } from '@/hooks/usePanZoom';
import { cn } from '@/lib/cn';
import { arrowsAlong } from '@/lib/route';
import type { MapPoint } from '@/lib/types';
import { MAX_SCALE, MIN_SCALE, WORLD } from '@/mocks/mapFeatures';
import CampusMapSvg from './CampusMapSvg';
import CurrentLocationDot from './CurrentLocationDot';
import MapLabels from './MapLabels';
import type { FlyToOptions, MapPolyline, MapViewProps } from './MapView';

const LIMITS = { minScale: MIN_SCALE, maxScale: MAX_SCALE, bounds: WORLD };

const toPath = (pts: MapPoint[]) => pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');

/** 경로 선 (월드 좌표 SVG) */
const Polylines = memo(function Polylines({ lines }: { lines: MapPolyline[] }) {
  const w = WORLD.maxX - WORLD.minX;
  const h = WORLD.maxY - WORLD.minY;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`${WORLD.minX} ${WORLD.minY} ${w} ${h}`}
      style={{ position: 'absolute', left: WORLD.minX, top: WORLD.minY, pointerEvents: 'none' }}
      aria-hidden
    >
      {lines.map((l) => {
        const d = toPath(l.points);
        return (
          <g key={l.id}>
            {l.casing && <path d={d} fill="none" stroke={l.casing} strokeWidth={l.width + 4} strokeLinecap="round" strokeLinejoin="round" />}
            <path d={d} fill="none" stroke={l.color} strokeWidth={l.width} strokeLinecap="round" strokeLinejoin="round" />
            {l.arrowSpacing &&
              arrowsAlong(l.points, l.arrowSpacing).map((a, i) => (
                <path
                  key={i}
                  d="M -3 2.5 L 0 -1.5 L 3 2.5"
                  transform={`translate(${a.point.x} ${a.point.y}) rotate(${a.heading})`}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
          </g>
        );
      })}
    </svg>
  );
});

/** SVG 가상 지도 구현체. 드래그 이동, 휠·핀치·버튼 확대, flyTo 애니메이션, 경로 선 지원 */
export default function VirtualMapView({
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
  const pz = usePanZoom({
    initialCenter: initialView.center,
    initialScale: initialView.scale,
    getLimits: () => LIMITS,
    onViewChangeEnd,
    onGestureStart: onUserInteract,
  });

  const centerFor = (position: MapPoint, options?: FlyToOptions) => {
    const s = pz.clampScale(options?.scale ?? pz.scale.get());
    const w = pz.width.get();
    const h = pz.height.get();
    const sp = options?.screenPoint ?? { x: w / 2, y: h / 2 };
    return { center: { x: position.x + (w / 2 - sp.x) / s, y: position.y + (h / 2 - sp.y) / s }, s };
  };

  useImperativeHandle(
    ref,
    () => ({
      flyTo: (position, options) => {
        const { center, s } = centerFor(position, options);
        pz.animateTo(center, s);
      },
      jumpTo: (position, options) => {
        const { center, s } = centerFor(position, options);
        pz.jumpTo(center, s);
      },
      zoomBy: (factor: number) => {
        pz.animateTo({ x: pz.cx.get(), y: pz.cy.get() }, pz.scale.get() * factor);
      },
      getView: pz.getView,
      getSize: () => ({ width: pz.width.get(), height: pz.height.get() }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pz],
  );

  return (
    <div
      ref={pz.containerRef}
      className={cn('absolute inset-0 touch-none select-none overflow-clip bg-[#F1F2EE]', className)}
      {...pz.handlers}
      onClick={() => onMapClick?.()}
    >
      <motion.div className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ transform: pz.transform }}>
        <CampusMapSvg />
        {polylines && polylines.length > 0 && <Polylines lines={polylines} />}
        <MapLabels scale={pz.scale} inverse={pz.inverse} />

        {currentLocation && (
          <div className="absolute" style={{ left: currentLocation.x, top: currentLocation.y, zIndex: 5 }}>
            <motion.div style={{ scale: pz.inverse, originX: 0, originY: 0 }}>
              <CurrentLocationDot />
            </motion.div>
          </div>
        )}

        {markers.map((m) => (
          <div key={m.id} className="absolute" style={{ left: m.position.x, top: m.position.y, zIndex: 10 + (m.zIndex ?? 0) }}>
            <motion.div style={{ scale: pz.inverse, originX: 0, originY: 0 }}>{m.element}</motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
