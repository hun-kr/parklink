import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CONFIG } from '@/lib/config';
import type { MyParking } from '@/lib/types';
import * as parkingService from '@/services/parkingService';

interface MyCarState {
  myParking: MyParking | null;
  /** localStorage 복원 완료 여부 (SSR 하이드레이션 불일치 방지용) */
  hydrated: boolean;
  /** 주차 완료 → 위치 저장 + 해당 칸을 주차중으로 고정 */
  park: (input: Omit<MyParking, 'plateNumber' | 'parkedAt'> & { parkedAt?: number }) => MyParking;
  /** 출차 → 저장 위치 삭제 */
  clear: () => void;
}

export const useMyCarStore = create<MyCarState>()(
  persist(
    (set, get) => ({
      myParking: null,
      hydrated: false,
      park: (input) => {
        // 이미 저장된 위치가 있으면 먼저 비운다 (다른 칸으로 다시 주차)
        const prev = get().myParking;
        if (prev && prev.slotId !== input.slotId) parkingService.releaseSlot(prev.lotId, prev.slotId);
        const myParking: MyParking = {
          ...input,
          plateNumber: CONFIG.demo.plateNumber,
          parkedAt: input.parkedAt ?? Date.now(),
        };
        parkingService.parkAt(myParking.lotId, myParking.slotId);
        set({ myParking });
        return myParking;
      },
      clear: () => {
        const current = get().myParking;
        if (current) parkingService.releaseSlot(current.lotId, current.slotId);
        set({ myParking: null });
      },
    }),
    {
      name: CONFIG.storageKey,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ myParking: s.myParking }),
      // 클라이언트 마운트 후 RealtimeProvider 에서 rehydrate() 호출
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        // 새로고침 후에도 내 차가 있는 칸은 주차중으로 유지
        if (state?.myParking) parkingService.parkAt(state.myParking.lotId, state.myParking.slotId);
        useMyCarStore.setState({ hydrated: true });
      },
    },
  ),
);
