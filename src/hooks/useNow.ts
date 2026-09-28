'use client';

import { useEffect, useState } from 'react';

/** 1초마다 갱신되는 현재 시각. 서버 렌더링·첫 렌더에서는 null (하이드레이션 불일치 방지) */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
