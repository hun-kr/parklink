'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import BrandSymbol, { Wordmark } from '@/components/brand/BrandSymbol';
import { useSessionStore } from '@/store/useSessionStore';

const SPLASH_MS = 1_000;

/**
 * S01 로딩: 앱을 처음 열 때(새로고침 포함) 흰 화면에 심볼 하나. 1초 이내, 광고·안내 없음.
 * 끝나면 온보딩 전인 사용자는 홈 대신 S02 로그인으로 보낸다.
 */
export default function AppSplash() {
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const t = setTimeout(() => {
      if (pathname === '/' && !useSessionStore.getState().onboarded) router.replace('/login');
      setVisible(false);
    }, SPLASH_MS);
    return () => clearTimeout(t);
    // 최초 실행 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          aria-label="ParkLink 로딩 중"
        >
          <motion.div initial={{ scale: 0.86, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.35 }}>
            <BrandSymbol size={112} />
          </motion.div>
          <Wordmark className="absolute bottom-[max(env(safe-area-inset-bottom),44px)] text-[17px]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
