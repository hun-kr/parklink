'use client';

import { useRouter } from 'next/navigation';
import { Car, Eye, MapPin } from 'lucide-react';
import { type LocationConsent, useSessionStore } from '@/store/useSessionStore';
import { toast } from '@/store/useToastStore';

const REASONS = [
  { icon: MapPin, title: '가까운 주차장 찾기', desc: '내 주변과 목적지 주변 주차장을 보여줘요' },
  { icon: Eye, title: '진입·주차 완료 자동 인식', desc: '주차장에 들어가면 주차장 모드로 바뀌어요' },
  { icon: Car, title: '내 차 위치 자동 저장', desc: '주차한 칸을 따로 적지 않아도 돼요' },
];

/** S03 위치 권한: 권한이 필요한 이유를 기능 단위로. 거절해도 검색·안내는 가능 */
export default function PermissionPage() {
  const router = useRouter();
  const setLocationConsent = useSessionStore((s) => s.setLocationConsent);

  // 데모는 Mock 현재 위치(캠퍼스)를 쓰므로 브라우저 권한은 요청하지 않는다
  const done = (consent: LocationConsent) => {
    setLocationConsent(consent);
    if (consent === 'later') toast('위치 없이도 검색·안내는 할 수 있어요.');
    router.replace('/');
  };

  return (
    <main className="flex flex-1 flex-col px-6 pb-[max(env(safe-area-inset-bottom),20px)] pt-16">
      <h1 className="text-[26px] font-bold leading-[1.35] tracking-[-0.03em]">
        편하게 안내하려면
        <br />
        위치 권한이 필요해요
      </h1>

      <ul className="mt-10 space-y-7">
        {REASONS.map(({ icon: Icon, title, desc }) => (
          <li key={title} className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
              <Icon size={22} />
            </span>
            <span>
              <span className="block text-[16px] font-bold">{title}</span>
              <span className="mt-0.5 block text-[14px] text-ink-muted">{desc}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-1 pt-8">
        <button type="button" onClick={() => done('granted')} className="h-[56px] w-full rounded-2xl bg-primary text-[17px] font-bold text-white">
          확인
        </button>
        <button type="button" onClick={() => done('later')} className="w-full py-3 text-[14px] font-medium text-ink-muted">
          나중에 할게요
        </button>
      </div>
    </main>
  );
}
