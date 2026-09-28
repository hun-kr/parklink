import { CornerUpLeft, CornerUpRight, Navigation2 } from 'lucide-react';
import type { TurnDir } from '@/lib/route';

/** 내 차: 흰 원 + 파란 반경 + 진행 방향 화살표 */
export function CarMarker({ heading }: { heading: number }) {
  return (
    <div className="pointer-events-none relative -translate-x-1/2 -translate-y-1/2">
      <span className="absolute left-1/2 top-1/2 h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1A73FF]/20" />
      <span className="relative flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
        <Navigation2 size={24} className="fill-[#1A63F0] text-[#1A63F0]" strokeWidth={1.5} style={{ transform: `rotate(${heading}deg)` }} />
      </span>
    </div>
  );
}

/** 회전 지점 말풍선: "80m 좌측으로 이동" */
export function TurnCallout({ dir, meters }: { dir: TurnDir; meters: number }) {
  const Icon = dir === 'left' ? CornerUpLeft : CornerUpRight;
  return (
    <div className="pointer-events-none relative -translate-x-1/2" style={{ transform: 'translate(-50%, calc(-100% - 10px))' }}>
      <div className="flex items-center gap-2 whitespace-nowrap rounded-[12px] bg-[#2B3442]/95 py-1.5 pl-2 pr-3 text-white shadow-float">
        <Icon size={24} strokeWidth={2.6} />
        <span className="leading-tight">
          <span className="block text-[15px] font-bold tabular-nums">{meters}m</span>
          <span className="block text-[12px] text-white/85">{dir === 'left' ? '좌측으로 이동' : '우측으로 이동'}</span>
        </span>
      </div>
      <span className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#2B3442]/95" />
    </div>
  );
}

/** 도착지: P 핀 + "도착 / 제1공학관 주차장" 말풍선 */
export function DestinationMarker({ name }: { name: string }) {
  return (
    <div className="pointer-events-none relative">
      {/* 핀 */}
      <div className="absolute -translate-x-1/2" style={{ transform: 'translate(-50%, -100%)' }}>
        <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full border-[3px] border-white bg-primary text-[20px] font-extrabold text-white shadow-float">
          P
        </span>
        <span className="mx-auto block h-3 w-[3px] rounded-b bg-primary" />
      </div>
      {/* 말풍선 (핀 왼쪽 위) */}
      <div className="absolute" style={{ transform: 'translate(calc(-100% - 26px), -150%)' }}>
        <div className="flex items-center gap-2 whitespace-nowrap rounded-[12px] border-[1.5px] border-primary bg-white py-1.5 pl-1.5 pr-3 shadow-float">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[14px] font-extrabold text-white">P</span>
          <span className="leading-tight">
            <span className="block text-[13px] font-bold text-ink">도착</span>
            <span className="block text-[11.5px] text-ink-sub">{name}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
