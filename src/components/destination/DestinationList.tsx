'use client';

import { BookOpen, Building2, ChevronRight, FlaskConical, Trophy } from 'lucide-react';
import { formatDistance } from '@/lib/format';
import type { Destination, DestinationIcon, LotSummary } from '@/lib/types';

const ICON: Record<DestinationIcon, typeof Building2> = {
  building: Building2,
  library: BookOpen,
  lab: FlaskConical,
  sports: Trophy,
};

/** 검색어 강조 */
function Highlight({ text, query }: { text: string; query: string }) {
  const i = query ? text.indexOf(query) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="text-primary">{text.slice(i, i + query.length)}</span>
      {text.slice(i + query.length)}
    </>
  );
}

export interface DestinationItem {
  destination: Destination;
  distanceM: number;
  lot?: LotSummary;
}

export default function DestinationList({
  items,
  query,
  onSelect,
}: {
  items: DestinationItem[];
  query: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="overflow-hidden rounded-card border border-line bg-white shadow-card">
      {items.map(({ destination: d, distanceM, lot }, i) => {
        const Icon = ICON[d.icon];
        return (
          <li key={d.id} className={i > 0 ? 'border-t border-line' : undefined}>
            <button
              type="button"
              onClick={() => onSelect(d.id)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-surface"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[16px] font-bold">
                    <Highlight text={d.name} query={query} />
                  </span>
                  <span className="shrink-0 text-[13px] text-ink-muted">{formatDistance(distanceM)}</span>
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-ink-muted">
                  {d.category}
                  {lot && (
                    <>
                      {' · '}
                      {lot.availableSpaces === null ? (
                        '주차 정보없음'
                      ) : (
                        <>
                          {lot.shortName}{' '}
                          <span className={lot.congestion === 'busy' ? 'font-semibold text-busy' : 'font-semibold text-available'}>
                            {lot.availableSpaces}면 여유
                          </span>
                        </>
                      )}
                    </>
                  )}
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-ink-muted" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
