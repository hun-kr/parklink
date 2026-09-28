import { notFound } from 'next/navigation';
import { getLot } from '@/services/parkingService';
import LotStatusClient from './LotStatusClient';

export default async function LotStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 칸 단위 현황은 구역 데이터가 있는 주차장만 제공
  if (!getLot(id)?.zones) notFound();
  return <LotStatusClient lotId={id} />;
}
