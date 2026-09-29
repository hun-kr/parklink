import Toast from '@/components/ui/Toast';
import AppSplash from './AppSplash';

/**
 * 모바일에서는 화면 전체, PC(≥ 480px)에서는 가운데 390px 폰 프레임으로 표시한다.
 * 프레임은 relative + overflow-hidden 이므로, 하단 탭·바텀시트 등은
 * fixed 대신 absolute 로 프레임 안에 배치한다.
 */
export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center min-[480px]:py-6">
      <div
        id="phone-frame"
        className="relative flex h-dvh w-full max-w-phone flex-col overflow-clip bg-white min-[480px]:h-[844px] min-[480px]:max-h-[calc(100dvh-48px)] min-[480px]:rounded-[44px] min-[480px]:shadow-[0_0_0_10px_#111827,0_24px_60px_rgba(17,24,39,0.35)]"
      >
        {children}
        <Toast />
        <AppSplash />
      </div>
    </div>
  );
}
