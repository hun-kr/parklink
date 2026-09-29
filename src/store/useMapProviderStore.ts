import { create } from 'zustand';

/**
 * 실제로 쓰이는 지도 구현체.
 * - loading: 네이버 지도 로드 중
 * - naver: 네이버 지도
 * - virtual: SVG 가상 지도 (Client ID 없음 · 로드 실패 · 인증 실패 시 대체)
 */
export type MapProvider = 'loading' | 'naver' | 'virtual';

interface MapProviderState {
  provider: MapProvider;
  /** 가상 지도로 바뀐 이유 (디버깅·안내용) */
  fallbackReason: string | null;
  setProvider: (provider: MapProvider, fallbackReason?: string | null) => void;
}

export const useMapProviderStore = create<MapProviderState>((set) => ({
  provider: 'loading',
  fallbackReason: null,
  setProvider: (provider, fallbackReason = null) => set({ provider, fallbackReason }),
}));
