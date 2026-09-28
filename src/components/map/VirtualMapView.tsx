'use client';

import { useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { usePanZoom } from '@/hooks/usePanZoom';
import { cn } from '@/lib/cn';
import type { MapPoint } from '@/lib/types';
import { MAX_SCALE, MIN_SCALE, WORLD } from '@/mocks/mapFeatures';
import CampusMapSvg from './CampusMapSvg';
import CurrentLocationDot from './CurrentLocationDot';
import MapLabels from './MapLabels';
import type { FlyToOptions, MapViewProps } from './MapView';

const LIMITS = { minScale: MIN_SCALE, maxScale: MAX_SCALE, bounds: WORLD };

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
  const pz = usePanZoom({
    initialCenter: initialView.center,
    initialScale: initialView.scale,
    getLimits: () => LIMITS,
    onViewChangeEnd,
  });

  useImperativeHandle(
    ref,
    () => ({
      flyTo: (position: MapPoint, options?: FlyToOptions) => {
        const s = pz.clampScale(options?.scale ?? pz.scale.get());
        const w = pz.width.get();
        const h = pz.height.get();
        const sp = options?.screenPoint ?? { x: w / 2, y: h / 2 };
        pz.animateTo({ x: position.x + (w / 2 - sp.x) / s, y: position.y + (h / 2 - sp.y) / s }, s);
      },
      zoomBy: (factor: number) => {
        pz.animateTo({ x: pz.cx.get(), y: pz.cy.get() }, pz.scale.get() * factor);
      },
      getView: pz.getView,
      getSize: () => ({ width: pz.width.get(), height: pz.height.get() }),
    }),
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
