'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bookmark, Car, ChevronRight, House, Info, MapPin, X } from 'lucide-react';
import CheckBurst from '@/components/mycar/CheckBurst';
import LotBriefCard from '@/components/mycar/LotBriefCard';
import SlotPosition from '@/components/mycar/SlotPosition';
import SlotPreview from '@/components/mycar/SlotPreview';
import BottomActions from '@/components/ui/BottomActions';
import PageLoading from '@/components/ui/PageLoading';
import { formatDateTime } from '@/lib/format';
import { getLot } from '@/services/parkingService';
import { useMyCarStore } from '@/store/useMyCarStore';
import { useLotSummary, useSlots } from '@/store/useParkingStore';
import { toast } from '@/store/useToastStore';

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35 },
});

/** 06 시안: 주차 완료 + 위치 저장 */
export default function ParkedPage() {
  const router = useRouter();
  const { myParking, hydrated } = useMyCarStore();
  const lotId = myParking?.lotId ?? '';
  const lot = useLotSummary(lotId);
  const slots = useSlots(lotId);

  if (!hydrated) return <PageLoading label="주차 정보를 불러오는 중" />;

  if (!myParking || !lot || !getLot(myParking.lotId)) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface text-ink-muted">
          <MapPin size={38} strokeWidth={1.8} />
        </span>
        <h1 className="mt-5 text-[22px] font-bold">저장된 주차 위치가 없어요</h1>
        <p className="mt-2 text-[15px] text-ink-muted">주차장 안내를 받아 주차를 완료해 주세요.</p>
        <Link href="/" className="pressable mt-8 flex h-[52px] w-full items-center justify-center rounded-2xl bg-primary text-[16.5px] font-bold text-white">
          홈으로
        </Link>
      </main>
    );
  }

  return (
    <>
      <main className="relative flex-1 overflow-y-auto scrollbar-none px-4 pb-5 pt-4">
        <button
          type="button"
          aria-label="닫기"
          onClick={() => router.push('/')}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full text-ink active:bg-surface"
        >
          <X size={28} strokeWidth={2} />
        </button>

        <div className="pt-6 text-center">
          <CheckBurst />
          <motion.h1 {...rise(0.45)} className="mt-4 text-[26px] font-extrabold tracking-[-0.03em]">
            주차가 완료되었습니다!
          </motion.h1>
          <motion.p {...rise(0.55)} className="mt-1 text-[15px] text-ink-sub">
            즐거운 시간 보내세요.
          </motion.p>
        </div>

        <motion.div {...rise(0.65)} className="mt-6">
          <LotBriefCard lot={lot} withAmenities />
        </motion.div>

        <motion.section {...rise(0.75)} className="mt-3 rounded-[20px] border border-line bg-white p-4 shadow-card">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Car size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] text-ink-sub">내 주차 위치</p>
                <span className="inline-flex h-8 items-center gap-1 rounded-xl border border-available/40 bg-available-light px-2.5 text-[12.5px] font-semibold text-available">
                  <Bookmark size={14} strokeWidth={2.2} />
                  내 차량 위치 저장됨
                </span>
              </div>
              <SlotPosition zone={myParking.zone} row={myParking.row} index={myParking.index} className="mt-1 text-[22px]" />
              <p className="mt-2 text-[13px] text-ink-muted">주차 시간</p>
              <p className="text-[15px] font-medium">{formatDateTime(myParking.parkedAt)}</p>
            </div>
          </div>

          {lot.zoneSummaries.length > 0 && (
            <SlotPreview zones={lot.zoneSummaries} slots={slots} slotId={myParking.slotId} href="/my-car" />
          )}

          <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-available-light px-4 py-3">
            <Bookmark size={20} className="mt-0.5 shrink-0 fill-available text-available" />
            <div>
              <p className="text-[14.5px] font-semibold text-available-dark">이 위치는 &lsquo;내 차량 위치&rsquo;에 저장되었습니다.</p>
              <p className="mt-0.5 text-[13px] text-ink-sub">귀가 시 지도에서 내 차량 위치를 다시 확인할 수 있습니다.</p>
            </div>
          </div>
        </motion.section>

        <motion.button
          {...rise(0.85)}
          type="button"
          onClick={() => toast('소중한 의견 감사합니다! 리뷰 기능은 준비 중이에요.')}
          className="mt-3 flex w-full items-center gap-3 rounded-[20px] border border-line bg-[#F8FAFC] px-4 py-4 text-left"
        >
          <Info size={24} className="shrink-0 text-ink-sub" />
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">주차장 이용은 어떠셨나요?</span>
            <span className="mt-0.5 block text-[13px] text-ink-muted">더 나은 서비스 제공을 위해 의견을 부탁드립니다.</span>
          </span>
          <ChevronRight size={20} className="text-ink-sub" />
        </motion.button>
      </main>

      <BottomActions
        className="border-t border-line"
        secondary={{ label: '홈으로', icon: House, href: '/' }}
        primary={{ label: '내 차 찾기', icon: Car, variant: 'success', href: '/my-car' }}
      />
    </>
  );
}
