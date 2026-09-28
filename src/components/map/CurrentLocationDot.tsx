/** 현재 위치: 파란 점 + 반투명 반경 + 방향 표시 */
export default function CurrentLocationDot() {
  return (
    <div className="pointer-events-none relative -translate-x-1/2 -translate-y-1/2">
      <span className="absolute left-1/2 top-1/2 h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1A73FF]/15" />
      <span className="absolute left-1/2 top-1/2 h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-[#1A73FF]/10 [animation-duration:2.4s]" />
      {/* 진행 방향 */}
      <span
        className="absolute left-1/2 top-1/2 h-[34px] w-[26px] -translate-x-1/2 -translate-y-full"
        style={{
          background: 'linear-gradient(to top, rgba(26,115,255,0.35), rgba(26,115,255,0))',
          clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
        }}
      />
      <span className="relative block h-[18px] w-[18px] rounded-full border-[3px] border-white bg-[#1A73FF] shadow-[0_1px_4px_rgba(0,0,0,0.3)]" />
    </div>
  );
}
