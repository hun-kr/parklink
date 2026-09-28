import { notFound } from 'next/navigation';
import type { ZoneId } from '@/lib/types';
import { getLot } from '@/services/parkingService';
import LotStatusClient, { type StatusTab } from './LotStatusClient';

const TABS: StatusTab[] = ['status', 'info', 'review'];

export default async function LotStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; zone?: string }>;
}) {
  const { id } = await params;
  const { tab, zone } = await searchParams;
  const lot = getLot(id);
  // 칸 단위 현황은 구역 데이터가 있는 주차장만 제공
  if (!lot?.zones) notFound();
  const initialZone = lot.zones.some((z) => z.id === zone) ? (zone as ZoneId) : null;
  const initialTab = TABS.includes(tab as StatusTab) ? (tab as StatusTab) : 'status';
  return <LotStatusClient lotId={id} initialTab={initialTab} initialZone={initialZone} />;
}
