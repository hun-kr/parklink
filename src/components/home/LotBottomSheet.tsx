'use client';

import Link from 'next/link';
import { Accessibility, Car, Clock3, Images, Map, MapPinned, Navigation, PlugZap, ReceiptText, X } from 'lucide-react';
import BottomSheet from '@/components/ui/BottomSheet';
import AiLiveBadge from '@/components/ui/AiLiveBadge';
import BottomActions from '@/components/ui/BottomActions';
import PhotoPlaceholder from '@/components/ui/PhotoPlaceholder';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/cn';
import { formatUpdatedAgo } from '@/lib/format';
import type { Congestion, LotSummary } from '@/lib/types';
import { toast } from '@/store/useToastStore';

const NUMBER_COLOR: Record<Congestion, string> = {
  available: 'text-available',
  normal: 'text-primary',
  busy: 'text-busy',
  unknown: 'text-ink-muted',
};

function Amenity({ icon: Icon, label, href }: { icon: typeof Clock3; label: string; href?: string }) {
  const content = (
    <>
      <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-surface text-ink-sub">
        <Icon size={21} strokeWidth={1.9} />
      </span>
      <span className="mt-1.5 whitespace-nowrap text-[12px] font-medium text-ink-sub">{label}</span>
    </>
  );
  const cls = 'flex flex-col items-center';
  return href ? (
    <Link href={href} className={cls}>
      {content}
    </Link>
  ) : (
    <div className={cls}>{content}</div>
  );
}

/** 02 시안: 주차장 선택 바텀시트 */
export default function LotBottomSheet({
  lot,
  onClose,
  onHeightChange,
}: {
  lot: LotSummary | null;
  onClose: () => void;
  onHeightChange?: (h: number) => void;
}) {
  const now = useNow();

  return (
    <BottomSheet open={!!lot} onClose={onClose} onHeightChange={onHeightChange} sheetKey={lot?.id}>
      {lot && (
        <>
          <div className="px-4">
            {/* 제목 */}
            <div className="mt-2 flex items-start gap-2">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                <h2 className="text-[17.5px] font-bold leading-snug tracking-[-0.03em]">{lot.name}</h2>
                {lot.isRealtime ? (
                  <AiLiveBadge size="sm" />
                ) : (
                  <span className="inline-flex h-6 items-center rounded-full bg-unknown-light px-2 text-[11.5px] font-semibold text-ink-muted">
                    실시간 미제공
                  </span>
                )}
              </div>
              <button
                type="button"
                aria-label="닫기"
                onClick={onClose}
                className="-mr-0.5 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-surface text-ink"
              >
                <X size={20} strokeWidth={2.2} />
              </button>
            </div>
            <p className="mt-1 text-[14px] text-ink-muted">{lot.address}</p>

            {/* 사진 */}
            <div className="mt-3.5 flex h-[72px] gap-2">
              <PhotoPlaceholder className="flex-1 rounded-xl" iconSize={24} />
              <PhotoPlaceholder className="w-[72px] rounded-xl" iconSize={22} icon={MapPinned} />
              <button
                type="button"
                onClick={() => toast('등록된 사진이 아직 없어요.')}
                className="flex w-[64px] flex-col items-center justify-center gap-1 rounded-xl bg-surface text-ink-sub"
              >
                <Images size={20} strokeWidth={1.8} />
                <span className="text-[11.5px] font-medium">전체보기</span>
              </button>
            </div>

            {/* 현재 여유 주차면 */}
            <div className="mt-3.5 flex items-center gap-2 rounded-2xl bg-surface p-3.5">
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-ink-sub">현재 여유 주차면</p>
                <p className="mt-0.5 flex items-baseline gap-1 whitespace-nowrap">
                  <span className={cn('text-[34px] font-extrabold leading-none tracking-[-0.03em]', NUMBER_COLOR[lot.congestion])}>
                    {lot.availableSpaces ?? '-'}
                    <span className="text-[28px]">면</span>
                  </span>
                  <span className="text-[15px] text-ink-sub">/ {lot.totalSpaces}면</span>
                </p>
                {lot.isRealtime ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-ink-sub">
                    <span className="h-2 w-2 rounded-full bg-available" />
                    {formatUpdatedAgo(lot.updatedAt, now)}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[12.5px] text-ink-muted">
                    {lot.availableSpaces === null ? '실시간 정보가 없어요' : '운영사 제공 기준 정보'}
                  </p>
                )}
              </div>
              {lot.zoneSummaries.length > 0 && (
                <div className="grid shrink-0 grid-cols-4 gap-1">
                  {lot.zoneSummaries.map((z) => (
                    <div key={z.id} className="flex w-[42px] flex-col items-center rounded-xl bg-[#EDF1F7] py-2">
                      <span className="text-[11px] font-medium text-ink-sub">{z.name}</span>
                      <span className="mt-0.5 text-[14.5px] font-bold text-primary">{z.availableSpaces}면</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 편의 정보 */}
            <div className="mt-3.5 grid grid-cols-5">
              <Amenity icon={Clock3} label={lot.amenities.open24h ? '24시간 운영' : '시간제 운영'} />
              <Amenity icon={Car} label={lot.amenities.visitorAllowed ? '방문차량 가능' : '방문차량 불가'} />
              <Amenity icon={PlugZap} label={`전기차 ${lot.amenities.evSpaces}면`} />
              <Amenity icon={Accessibility} label={`장애인 ${lot.amenities.disabledSpaces}면`} />
              <Amenity icon={ReceiptText} label="상세정보" href={`/lot/${lot.id}`} />
            </div>
          </div>

          <BottomActions
            className="mt-1"
            secondary={{ label: '상세정보 보기', href: `/lot/${lot.id}` }}
            primary={
              lot.zones
                ? { label: '주차현황 보기', icon: Map, href: `/lot/${lot.id}/status` }
                : { label: '길안내', icon: Navigation, href: `/navigate/${lot.id}` }
            }
          />
        </>
      )}
    </BottomSheet>
  );
}
