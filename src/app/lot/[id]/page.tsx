import { notFound } from 'next/navigation';
import { getLot } from '@/services/parkingService';
import LotDetailClient from './LotDetailClient';

export default async function LotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getLot(id)) notFound();
  return <LotDetailClient lotId={id} />;
}
