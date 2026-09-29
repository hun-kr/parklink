'use client';

import { motion } from 'framer-motion';

/** 06 시안: 초록 체크 + 퍼지는 조각 애니메이션 */
const PIECES = [
  { angle: -60, dist: 78, color: '#2FAF56' },
  { angle: -20, dist: 84, color: '#34D399' },
  { angle: 20, dist: 82, color: '#2FAF56' },
  { angle: 60, dist: 76, color: '#34D399' },
  { angle: 120, dist: 80, color: '#2FAF56' },
  { angle: 160, dist: 84, color: '#34D399' },
  { angle: 200, dist: 80, color: '#2FAF56' },
  { angle: 240, dist: 78, color: '#34D399' },
];

export default function CheckBurst() {
  return (
    <div className="relative mx-auto h-[128px] w-[128px]" aria-hidden>
      {/* 바깥 연한 원 */}
      <motion.span
        className="absolute inset-0 rounded-full bg-available-light"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
      />
      {/* 조각 */}
      {PIECES.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-[10px] w-[4px] rounded-full"
            style={{ background: p.color, rotate: p.angle + 90 }}
            initial={{ x: -2, y: -5, opacity: 0, scale: 0.4 }}
            animate={{ x: Math.cos(rad) * p.dist - 2, y: Math.sin(rad) * p.dist - 5, opacity: [0, 1, 1, 0.85], scale: 1 }}
            transition={{ delay: 0.25 + i * 0.02, duration: 0.7, ease: 'easeOut' }}
          />
        );
      })}
      {/* 체크 원 */}
      <motion.span
        className="absolute inset-[22px] flex items-center justify-center rounded-full bg-available shadow-[0_6px_18px_rgba(47,175,86,0.35)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
      >
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="#fff"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.35, duration: 0.45, ease: 'easeOut' }}
          />
        </svg>
      </motion.span>
    </div>
  );
}
