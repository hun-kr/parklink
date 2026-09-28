'use client';

import { Car, Home, MapPin } from 'lucide-react';
import ScreenPlaceholder from '@/components/layout/ScreenPlaceholder';
import MyParkingCard from '@/components/parking/MyParkingCard';
import BottomActions from '@/components/ui/BottomActions';
import Card from '@/components/ui/Card';
import { useMyCarStore } from '@/store/useMyCarStore';

export default function ParkedPage() {
  const { myParking, hydrated } = useMyCarStore();

  return (
    <ScreenPlaceholder
      title={myParking ? '주차가 완료되었습니다!' : '주차 완료'}
      subtitle={myParking ? '즐거운 시간 보내세요.' : undefined}
      step="7단계"
      backHref="/"
      footer={
        <BottomActions
          secondary={{ label: '홈으로', icon: Home, href: '/' }}
          primary={
            myParking
              ? { label: '내 차 찾기', icon: Car, variant: 'success', href: '/my-car' }
              : { label: '주차장 찾기', icon: MapPin, href: '/' }
          }
        />
      }
    >
      {hydrated &&
        (myParking ? (
          <>
            <MyParkingCard parking={myParking} />
            <Card tone="surface" className="p-4 text-sm font-medium text-available">
              이 위치는 &lsquo;내 차량 위치&rsquo;에 저장되었습니다.
            </Card>
          </>
        ) : (
          <Card tone="surface" className="p-5 text-sm text-ink-sub">
            저장된 주차 위치가 없어요. 주차장 안내를 받아 주차를 완료해 주세요.
          </Card>
        ))}
    </ScreenPlaceholder>
  );
}
