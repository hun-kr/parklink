'use client';

import { ChevronLeft, Search, X } from 'lucide-react';

/** 뒤로가기 + 목적지 검색창 */
export default function SearchHeader({
  value,
  onChange,
  onSubmit,
  onBack,
  onClear,
  onFocus,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onClear: () => void;
  onFocus?: () => void;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 pb-2 pl-2 pr-4 pt-3">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className="flex h-11 w-10 shrink-0 items-center justify-center rounded-full text-ink active:bg-surface"
      >
        <ChevronLeft size={28} strokeWidth={2.2} />
      </button>
      <form
        className="flex h-[48px] min-w-0 flex-1 items-center gap-2.5 rounded-full border border-[#E6E9EE] bg-white pl-4 pr-2 shadow-[0_2px_10px_rgba(17,24,39,0.08)] focus-within:border-primary"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <Search size={22} className="shrink-0 text-primary" strokeWidth={2.4} />
        <input
          type="search"
          enterKeyHint="search"
          value={value}
          autoFocus={autoFocus}
          onFocus={onFocus}
          onChange={(e) => onChange(e.target.value)}
          placeholder="목적지를 검색하세요"
          aria-label="목적지 검색"
          className="min-w-0 flex-1 bg-transparent text-[15.5px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-[#9AA1AD] [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={onClear}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C4CAD3] text-white"
          >
            <X size={15} strokeWidth={3} />
          </button>
        )}
      </form>
    </div>
  );
}
