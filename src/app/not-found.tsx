import Link from 'next/link';
import { MapPinOff } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface text-ink-muted">
        <MapPinOff size={38} strokeWidth={1.8} />
      </span>
      <h1 className="mt-5 text-[22px] font-bold">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 text-[15px] text-ink-muted">주소가 바뀌었거나 없는 주차장이에요.</p>
      <Link
        href="/"
        className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-[17px] font-bold text-white"
      >
        홈으로
      </Link>
    </main>
  );
}
