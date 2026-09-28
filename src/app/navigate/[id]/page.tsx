import { notFound } from 'next/navigation';
import type { ZoneId } from '@/lib/types';
import { getLot } from '@/services/parkingService';
import NavigateClient from './NavigateClient';

export default async function NavigatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ zone?: string }>;
}) {
  const { id } = await params;
  const { zone } = await searchParams;
  const lot = getLot(id);
  if (!lot) notFound();
  const zoneId = lot.zones?.some((z) => z.id === zone) ? (zone as ZoneId) : null;
  return <NavigateClient lotId={id} zoneId={zoneId} />;
}
