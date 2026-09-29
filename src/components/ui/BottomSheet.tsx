'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion';
import { cn } from '@/lib/cn';

/**
 * 폰 프레임 하단에서 올라오는 시트. 핸들을 아래로 끌거나 백드롭을 누르면 닫힌다.
 * 높이가 바뀌면 onHeightChange 로 알려준다 (지도 컨트롤 위치 조정용).
 */
export default function BottomSheet({
  open,
  onClose,
  children,
  backdrop = false,
  className,
  onHeightChange,
  sheetKey,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdrop?: boolean;
  className?: string;
  onHeightChange?: (height: number) => void;
  /** 내용이 바뀔 때 시트를 다시 띄우고 싶으면 다른 key 를 준다 */
  sheetKey?: string;
}) {
  const dragControls = useDragControls();
  const ref = useRef<HTMLDivElement>(null);
  const onHeightChangeRef = useRef(onHeightChange);
  onHeightChangeRef.current = onHeightChange;

  useEffect(() => {
    if (!open) {
      onHeightChangeRef.current?.(0);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => onHeightChangeRef.current?.(entry.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, sheetKey]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 90 || info.velocity.y > 600) onClose();
  };

  return (
    <AnimatePresence>
      {open && backdrop && (
        <motion.div
          key="backdrop"
          className="absolute inset-0 z-40 bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {open && (
        <motion.div
          key={sheetKey ?? 'sheet'}
          ref={ref}
          role="dialog"
          className={cn(
            'absolute inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[24px] bg-white shadow-[0_-6px_24px_rgba(17,24,39,0.12)]',
            className,
          )}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.7 }}
          onDragEnd={handleDragEnd}
        >
          <div
            className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-2.5"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <span className="h-1 w-10 rounded-full bg-[#D5DAE1]" />
          </div>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
