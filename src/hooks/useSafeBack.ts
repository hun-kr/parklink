'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * 앱 안에서 쌓인 화면 스택 (경로 기준).
 * - 새 경로 = 스택의 바로 앞 경로 → 뒤로가기로 판단해 pop
 * - replace 로 이동 → 맨 위 교체
 * - 그 외 → push
 */
const stack: string[] = [];
let pendingReplace = false;

/** router.replace 직전에 호출하면 스택 맨 위를 교체한다 */
export function noteReplace() {
  pendingReplace = true;
}

/** 레이아웃에 한 번 두어 앱 내부 이동을 추적한다 */
export function useNavigationTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (stack[stack.length - 1] === pathname) return; // StrictMode 중복 실행
    if (pendingReplace && stack.length > 0) {
      stack[stack.length - 1] = pathname;
    } else if (stack.length > 1 && stack[stack.length - 2] === pathname) {
      stack.pop();
    } else {
      stack.push(pathname);
    }
    pendingReplace = false;
  }, [pathname]);
}

/**
 * 안전한 뒤로가기.
 * 앱 안에 이전 화면이 있으면 history.back, 공유 링크·새 탭 등으로 바로 들어와 이전 화면이 없으면
 * fallback(상위 화면)으로 '교체' 이동한다 → 앱 밖으로 나가거나 두 화면을 오가는 Dead End 방지.
 */
export function useSafeBack(fallback = '/') {
  const router = useRouter();
  return () => {
    if (stack.length > 1) {
      router.back();
    } else {
      noteReplace();
      router.replace(fallback);
    }
  };
}
