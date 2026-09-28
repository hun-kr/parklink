import { create } from 'zustand';

/** 목적지 선택 화면 상태. 안내·현황 화면에 갔다 돌아와도 선택이 유지된다. */
interface DestinationState {
  destinationId: string | null;
  /** 사용자가 직접 고른 구역(ZoneId) 또는 주차장 id. null 이면 추천 대상 사용 */
  targetOverride: string | null;
  selectDestination: (id: string | null) => void;
  setTargetOverride: (id: string | null) => void;
}

export const useDestinationStore = create<DestinationState>((set) => ({
  destinationId: null,
  targetOverride: null,
  selectDestination: (destinationId) => set({ destinationId, targetOverride: null }),
  setTargetOverride: (targetOverride) => set({ targetOverride }),
}));
