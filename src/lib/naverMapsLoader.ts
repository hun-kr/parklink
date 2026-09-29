/**
 * 네이버 지도 JS API v3 스크립트 로더 (앱 전체에서 한 번만 로드).
 * Client ID 는 브라우저에 그대로 노출되는 공개 키이며, 네이버 클라우드 콘솔에 등록한
 * Web 서비스 URL 에서만 동작한다. Client Secret 은 이 API 에 필요 없으므로 코드에 두지 않는다.
 */
import { CONFIG } from './config';

export const NAVER_MAP_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? '';

declare global {
  interface Window {
    navermap_authFailure?: () => void;
    naver?: typeof naver;
  }
}

let promise: Promise<typeof naver.maps> | null = null;
let authFailed = false;
const authFailListeners = new Set<() => void>();

/** 인증 실패(등록되지 않은 도메인 등)는 스크립트 로드 이후에 따로 알려진다 */
export function onNaverAuthFailure(listener: () => void) {
  if (authFailed) listener();
  authFailListeners.add(listener);
  return () => void authFailListeners.delete(listener);
}

export function loadNaverMaps(): Promise<typeof naver.maps> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (!NAVER_MAP_CLIENT_ID) return Promise.reject(new Error('NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 가 없습니다.'));
  if (authFailed) return Promise.reject(new Error('네이버 지도 인증 실패'));
  if (promise) return promise;

  window.navermap_authFailure = () => {
    authFailed = true;
    promise = null;
    authFailListeners.forEach((l) => l());
  };

  promise = new Promise<typeof naver.maps>((resolve, reject) => {
    if (window.naver?.maps) return resolve(window.naver.maps);
    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(NAVER_MAP_CLIENT_ID)}`;
    script.async = true;
    const timer = setTimeout(() => fail(new Error('네이버 지도 로드 시간 초과')), CONFIG.map.naverLoadTimeoutMs);
    const fail = (e: Error) => {
      clearTimeout(timer);
      promise = null;
      script.remove();
      reject(e);
    };
    script.onload = () => {
      clearTimeout(timer);
      if (window.naver?.maps) resolve(window.naver.maps);
      else fail(new Error('네이버 지도 초기화 실패'));
    };
    script.onerror = () => fail(new Error('네이버 지도 스크립트를 불러오지 못했습니다.'));
    document.head.appendChild(script);
  });
  return promise;
}
