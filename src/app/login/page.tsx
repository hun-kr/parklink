'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import BrandSymbol from '@/components/brand/BrandSymbol';
import ZoneMiniMap from '@/components/parking/ZoneMiniMap';
import { CONFIG } from '@/lib/config';
import { useLotSummary, useRecommendation } from '@/store/useParkingStore';
import { type LoginProvider, useSessionStore } from '@/store/useSessionStore';

const OUTLINE = 'flex h-[54px] w-full items-center justify-center rounded-2xl border border-[#DDE1E7] bg-white text-[16px] font-bold';

/** S02 로그인: 간편 로그인 + 둘러보기. 첫 화면에서 서비스 가치를 한 문장으로 */
export default function LoginPage() {
  const router = useRouter();
  const login = useSessionStore((s) => s.login);
  const lot = useLotSummary(CONFIG.demo.mainLotId);
  const recommendation = useRecommendation(CONFIG.demo.mainDestinationId);

  // 데모: 실제 소셜 로그인 없이 선택만 기록하고 위치 권한 안내로 넘어간다
  const start = (provider: LoginProvider) => {
    login(provider);
    router.push('/permission');
  };

  return (
    <main className="flex flex-1 flex-col overflow-y-auto scrollbar-none px-6 pb-[max(env(safe-area-inset-bottom),20px)] pt-12">
      <BrandSymbol size={52} className="-ml-1.5" />
      <h1 className="mt-5 text-[26px] font-bold leading-[1.35] tracking-[-0.03em]">
        목적지 가까운 빈자리,
        <br />
        도착 전에 알려드릴게요
      </h1>
      <p className="mt-3 text-[15px] leading-[1.55] text-ink-sub">
        AI가 주차장 CCTV를 분석해
        <br />
        지금 비어 있는 자리를 보여줘요
      </p>

      {lot && lot.zoneSummaries.length > 0 && (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-3" aria-hidden>
          <ZoneMiniMap zones={lot.zoneSummaries} highlight={recommendation?.zoneId ?? 'B'} />
        </div>
      )}

      <div className="mt-auto space-y-2.5 pt-8">
        <button type="button" onClick={() => start('kakao')} className="flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#FEE500] text-[16px] font-bold text-[#191919]">
          <MessageCircle size={20} className="fill-[#191919]" />
          카카오로 시작하기
        </button>
        <button type="button" onClick={() => start('naver')} className={OUTLINE}>
          네이버로 시작하기
        </button>
        <button type="button" onClick={() => start('apple')} className={OUTLINE}>
          Apple로 계속하기
        </button>
        <button type="button" onClick={() => start('guest')} className="w-full py-3 text-[14px] font-medium text-ink-muted">
          로그인 없이 둘러보기
        </button>
      </div>
    </main>
  );
}
