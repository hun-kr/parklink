import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LoginProvider = 'kakao' | 'naver' | 'apple' | 'guest';
export type LocationConsent = 'granted' | 'later';

/** 온보딩(S02 로그인 · S03 위치 권한) 결과. 데모에서는 실제 로그인·권한 요청 없이 기록만 한다. */
interface SessionState {
  onboarded: boolean;
  loginProvider: LoginProvider | null;
  locationConsent: LocationConsent | null;
  login: (provider: LoginProvider) => void;
  setLocationConsent: (consent: LocationConsent) => void;
  /** MY 탭 '처음 화면부터 다시 보기' (데모 시연용) */
  reset: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      onboarded: false,
      loginProvider: null,
      locationConsent: null,
      login: (loginProvider) => set({ loginProvider }),
      setLocationConsent: (locationConsent) => set({ locationConsent, onboarded: true }),
      reset: () => set({ onboarded: false, loginProvider: null, locationConsent: null }),
    }),
    { name: 'parklink:session', storage: createJSONStorage(() => localStorage) },
  ),
);

export const LOGIN_PROVIDER_LABEL: Record<LoginProvider, string> = {
  kakao: '카카오',
  naver: '네이버',
  apple: 'Apple',
  guest: '둘러보기',
};
