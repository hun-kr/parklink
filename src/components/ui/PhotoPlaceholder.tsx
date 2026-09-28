import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * 사진이 없을 때 쓰는 회색 placeholder.
 * src 가 주어지면 실제 이미지를 표시한다 (public/images/ 에 파일을 추가하면 교체됨).
 */
export default function PhotoPlaceholder({
  src,
  alt = '',
  label,
  counter,
  className,
  iconSize = 28,
}: {
  src?: string;
  alt?: string;
  label?: string;
  counter?: string;
  className?: string;
  iconSize?: number;
}) {
  return (
    <div className={cn('relative overflow-hidden bg-[#E3E7EE]', className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#E6EAF0] to-[#D5DBE5] text-[#9AA4B5]">
          <ImageIcon size={iconSize} strokeWidth={1.6} />
        </div>
      )}
      {label && (
        <span className="absolute bottom-2.5 left-3 text-[13px] font-semibold text-white drop-shadow">
          {label}
        </span>
      )}
      {counter && (
        <span className="absolute bottom-2 right-2 rounded-lg bg-black/45 px-2 py-0.5 text-xs font-medium text-white">
          {counter}
        </span>
      )}
    </div>
  );
}
