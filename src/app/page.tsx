'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { List } from 'lucide-react';
import FilterChips from '@/components/home/FilterChips';
import LotBottomSheet from '@/components/home/LotBottomSheet';
import LotListSheet from '@/components/home/LotListSheet';
import NearbyPeek from '@/components/home/NearbyPeek';
import SearchBar from '@/components/home/SearchBar';
import BottomTabBar from '@/components/layout/BottomTabBar';
import LotMarker from '@/components/map/LotMarker';
import MapControls from '@/components/map/MapControls';
import MapView, { type MapBounds, type MapMarker, type MapViewHandle } from '@/components/map/MapView';
import ScaleBar from '@/components/map/ScaleBar';
import { applyLotFilters } from '@/lib/filters';
import { FOCUS_SCALE, INITIAL_VIEW } from '@/mocks/mapFeatures';
import { getCurrentLocation } from '@/services/parkingService';
import { useMapUiStore } from '@/store/useMapUiStore';
import { useLotSummaries } from '@/store/useParkingStore';
import { toast } from '@/store/useToastStore';

const TAB_BAR_H = 64;
const PEEK_H = 96;
/** 지도 위 상단(검색창+필터칩) 영역 높이 */
const TOP_OVERLAY_H = 112;
/** 02 바텀시트 예상 높이 (실제 높이는 측정해서 컨트롤 위치에 반영) */
const LOT_SHEET_H = 470;

export default function HomePage() {
  const router = useRouter();
  const lots = useLotSummaries();
  const { selectedLotId, selectLot, listOpen, setListOpen, filters, toggleFilter, view, saveView } = useMapUiStore();
  const mapRef = useRef<MapViewHandle>(null);
  const [initialView] = useState(() => view ?? INITIAL_VIEW);
  const [scale, setScale] = useState(initialView.scale);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [sheetH, setSheetH] = useState(0);
  const currentLocation = getCurrentLocation();

  const filtered = useMemo(() => applyLotFilters(lots, filters), [lots, filters]);
  const nearby = useMemo(
    () =>
      bounds
        ? filtered.filter(
            (l) =>
              l.position.x >= bounds.minX &&
              l.position.x <= bounds.maxX &&
              l.position.y >= bounds.minY &&
              l.position.y <= bounds.maxY,
          )
        : filtered,
    [filtered, bounds],
  );
  const selected = lots.find((l) => l.id === selectedLotId) ?? null;

  const focusLot = (id: string) => {
    const lot = lots.find((l) => l.id === id);
    const map = mapRef.current;
    selectLot(id);
    if (!lot || !map) return;
    const { width, height } = map.getSize();
    const sheetTop = height + TAB_BAR_H - LOT_SHEET_H;
    map.flyTo(lot.position, {
      scale: Math.max(FOCUS_SCALE, map.getView().scale),
      // 말풍선이 오른쪽으로 펼쳐지므로 꼬리를 중앙보다 조금 왼쪽에 둔다
      screenPoint: { x: width / 2 - 40, y: TOP_OVERLAY_H + (sheetTop - TOP_OVERLAY_H) * 0.5 },
    });
  };

  const markerLots = selected && !filtered.includes(selected) ? [...filtered, selected] : filtered;
  const markers: MapMarker[] = markerLots.map((lot) => ({
    id: lot.id,
    position: lot.position,
    zIndex: lot.id === selectedLotId ? 1000 : Math.round(lot.position.y / 10),
    element: (
      <LotMarker
        lot={lot}
        variant={selectedLotId ? (lot.id === selectedLotId ? 'selected' : 'compact') : 'full'}
        onClick={() => focusLot(lot.id)}
      />
    ),
  }));

  // 오른쪽 컨트롤·축척·목록보기는 시트 위로 올라간다
  const sheetOpen = !!selected;
  const sheetTopOffset = Math.max(sheetH || LOT_SHEET_H, 200) - TAB_BAR_H;
  const overlayBottom = sheetOpen ? sheetTopOffset + 14 : PEEK_H + 14;
  const controlsBottom = sheetOpen ? sheetTopOffset + 10 : PEEK_H + 70;

  return (
    <>
      <div className="relative flex-1 overflow-clip">
        <MapView
          ref={mapRef}
          initialView={initialView}
          markers={markers}
          currentLocation={currentLocation}
          onMapClick={() => selectedLotId && selectLot(null)}
          onViewChangeEnd={(v, b) => {
            saveView(v);
            setScale(v.scale);
            setBounds(b);
          }}
        />

        {/* 상단: 검색창 + 필터칩 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 space-y-2.5 px-3 pt-3 [&>*]:pointer-events-auto">
          <SearchBar />
          <FilterChips
            filters={filters}
            onToggle={toggleFilter}
            onSearchHere={() => toast(`현 지도 영역에서 주차장 ${nearby.length}곳을 찾았어요.`)}
            onMoreFilters={() => toast('상세 필터는 데모 버전에서 준비 중이에요.')}
          />
        </div>

        {/* 오른쪽 지도 컨트롤 */}
        <motion.div className="absolute right-3.5 z-20" initial={false} animate={{ bottom: controlsBottom }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}>
          <MapControls
            onLocate={() => mapRef.current?.flyTo(currentLocation)}
            onZoomIn={() => mapRef.current?.zoomBy(1.5)}
            onZoomOut={() => mapRef.current?.zoomBy(1 / 1.5)}
            onNavigate={() => router.push('/destination')}
            showNavigate={!sheetOpen}
          />
        </motion.div>

        {/* 왼쪽 아래: 축척 + 목록보기 */}
        <motion.div
          className="absolute left-3.5 z-20 flex flex-col items-start gap-3"
          initial={false}
          animate={{ bottom: overlayBottom, opacity: sheetOpen ? 0 : 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        >
          <div className="pl-2">
            <ScaleBar scale={scale} />
          </div>
          <button
            type="button"
            onClick={() => setListOpen(true)}
            className="flex h-[42px] items-center gap-2 rounded-full border border-[#E6E9EE] bg-white px-4 text-[14.5px] font-semibold shadow-[0_2px_10px_rgba(17,26,46,0.12)]"
          >
            <List size={20} strokeWidth={2.2} />
            목록보기
          </button>
        </motion.div>

        {/* 하단 미리보기 시트 */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <NearbyPeek count={nearby.length} onOpen={() => setListOpen(true)} />
        </div>
      </div>

      <BottomTabBar />

      <LotBottomSheet lot={selected} onClose={() => selectLot(null)} onHeightChange={setSheetH} />
      <LotListSheet open={listOpen} lots={nearby} onClose={() => setListOpen(false)} onSelect={focusLot} />
    </>
  );
}
