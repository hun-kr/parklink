'use client';

import { motion } from 'framer-motion';

/** 화면 전환 애니메이션: 새 화면이 오른쪽에서 살짝 밀려 들어오며 나타난다 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex min-h-0 flex-1 flex-col"
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
