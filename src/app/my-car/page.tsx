import { getLot } from '@/services/parkingService';
import MyCarClient, { type SharedParking } from './MyCarClient';

/** 07 시안: 내 차 찾기. ?lot=&slot=&at= 이 있으면 공유받은 위치로 표시 */
export default async function MyCarPage({
  searchParams,
}: {
  searchParams: Promise<{ lot?: string; slot?: string; at?: string }>;
}) {
  const { lot, slot, at } = await searchParams;
  let shared: SharedParking | null = null;
  const m = slot?.match(/^([ABCD])-(\d+)-(\d+)$/);
  if (lot && m && getLot(lot)?.zones) {
    const parkedAt = Number(at);
    shared = {
      lotId: lot,
      slotId: slot!,
      zone: m[1] as SharedParking['zone'],
      row: Number(m[2]),
      index: Number(m[3]),
      parkedAt: Number.isFinite(parkedAt) && parkedAt > 0 ? parkedAt : null,
    };
  }
  return <MyCarClient shared={shared} />;
}
