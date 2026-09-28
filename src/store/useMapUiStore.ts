import { create } from 'zustand';
import type { MapViewState } from '@/components/map/MapView';
import { EMPTY_FILTERS, type LotFilters } from '@/lib/filters';

/** 지도 홈 화면 UI 상태. 다른 화면에 갔다 돌아와도 선택·지도 위치가 유지된다. */
interface MapUiState {
  selectedLotId: string | null;
  listOpen: boolean;
  filters: LotFilters;
  view: MapViewState | null;
  selectLot: (id: string | null) => void;
  setListOpen: (open: boolean) => void;
  toggleFilter: (key: keyof LotFilters) => void;
  saveView: (view: MapViewState) => void;
}

export const useMapUiStore = create<MapUiState>((set) => ({
  selectedLotId: null,
  listOpen: false,
  filters: EMPTY_FILTERS,
  view: null,
  selectLot: (selectedLotId) => set({ selectedLotId, listOpen: false }),
  setListOpen: (listOpen) => set({ listOpen }),
  toggleFilter: (key) => set((s) => ({ filters: { ...s.filters, [key]: !s.filters[key] } })),
  saveView: (view) => set({ view }),
}));
