import Link from 'next/link';
import { Search } from 'lucide-react';

/** 상단 검색창 → 목적지 선택 화면으로 이동 */
export default function SearchBar() {
  return (
    <Link
      href="/destination"
      className="pressable flex h-[48px] items-center gap-3 rounded-full border border-[#E6E9EE] bg-white px-4 shadow-[0_2px_10px_rgba(17,26,46,0.10)] active:bg-surface"
    >
      <Search size={24} className="shrink-0 text-primary" strokeWidth={2.4} />
      <span className="truncate text-[15.5px] text-[#9AA1AD]">목적지 또는 장소를 검색하세요</span>
    </Link>
  );
}
