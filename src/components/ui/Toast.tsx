'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '@/store/useToastStore';

/** 폰 프레임 하단에 잠깐 떴다 사라지는 안내 메시지 */
export default function Toast() {
  const { message, key, hide } = useToastStore();

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(hide, 2200);
    return () => clearTimeout(t);
  }, [message, key, hide]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-[100] flex justify-center px-6">
      <AnimatePresence>
        {message && (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="rounded-full bg-ink/90 px-4 py-2.5 text-center text-sm font-medium text-white shadow-float"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
