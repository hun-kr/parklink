'use client';

import { useEffect } from 'react';
import { useMyCarStore } from '@/store/useMyCarStore';
import { useParkingStore } from '@/store/useParkingStore';

/** 앱 전체에서 한 번: 실시간 시뮬레이션 연결 + 내 주차 위치 복원 */
export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const disconnect = useParkingStore.getState().connect();
    void useMyCarStore.persist.rehydrate();
    return disconnect;
  }, []);

  return <>{children}</>;
}
