import { CONFIG } from '@/lib/config';

const STEPS = [50, 100, 200, 250, 500, 1000, 2000];

function label(m: number) {
  return m >= 1000 ? `${m / 1000}km` : `${m}m`;
}

/** 축척 표시: 0 — 250 — 500m */
export default function ScaleBar({ scale }: { scale: number }) {
  const metersPerPx = CONFIG.map.metersPerUnit / scale;
  // 막대 길이가 80~140px 사이가 되는 값 선택
  const total = STEPS.find((m) => m / metersPerPx >= 80) ?? STEPS[STEPS.length - 1];
  const px = total / metersPerPx;

  return (
    <div className="pointer-events-none text-[11px] font-semibold text-ink-sub" style={{ width: px + 24 }}>
      <div className="relative h-4" style={{ width: px }}>
        <span className="absolute left-0 -translate-x-1/2">0</span>
        <span className="absolute left-1/2 -translate-x-1/2">{total / 2}</span>
        <span className="absolute left-full -translate-x-1/2 whitespace-nowrap pl-3">{label(total)}</span>
      </div>
      <div className="relative h-[6px] border-x-[1.5px] border-b-[1.5px] border-ink-sub" style={{ width: px }}>
        <span className="absolute bottom-0 left-1/2 h-[5px] w-[1.5px] bg-ink-sub" />
      </div>
    </div>
  );
}
