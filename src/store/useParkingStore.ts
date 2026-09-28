import { useMemo } from 'react';
import { create } from 'zustand';
import type { RealtimeSnapshot } from '@/lib/types';
import * as parkingService from '@/services/parkingService';

interface ParkingState {
  snapshot: RealtimeSnapshot;
  connected: boolean;
  /** parkingService 실시간 구독 시작. 해제 함수를 반환한다. */
  connect: () => () => void;
}

export const useParkingStore = create<ParkingState>((set) => ({
  snapshot: parkingService.getSnapshot(),
  connected: false,
  connect: () => {
    const unsubscribe = parkingService.subscribeRealtime((snapshot) => set({ snapshot }));
    set({ connected: true });
    return () => {
      unsubscribe();
      set({ connected: false });
    };
  },
}));

// ---- 화면에서 쓰는 셀렉터 훅 (계산은 parkingService 에 위임) ----

export function useLotSummaries() {
  const snapshot = useParkingStore((s) => s.snapshot);
  return useMemo(() => parkingService.getLotSummaries(snapshot), [snapshot]);
}

export function useLotSummary(lotId: string) {
  const snapshot = useParkingStore((s) => s.snapshot);
  return useMemo(() => parkingService.getLotSummary(lotId, snapshot), [lotId, snapshot]);
}

export function useSlots(lotId: string) {
  const snapshot = useParkingStore((s) => s.snapshot);
  return useMemo(() => parkingService.getSlots(lotId, snapshot), [lotId, snapshot]);
}

export function useRecommendation(destinationId: string) {
  const snapshot = useParkingStore((s) => s.snapshot);
  return useMemo(() => parkingService.getRecommendation(destinationId, snapshot), [destinationId, snapshot]);
}
