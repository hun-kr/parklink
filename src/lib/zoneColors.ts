import type { ZoneDef } from './types';

type ZoneColor = ZoneDef['color'];

/** 구역 색 (04 시안: A 초록 / B 파랑 / C 주황 / D 빨강) */
export const ZONE_COLOR: Record<ZoneColor, { hex: string; text: string; bg: string; border: string; light: string }> = {
  green: { hex: '#16A34A', text: 'text-zone-a', bg: 'bg-zone-a', border: 'border-zone-a', light: 'bg-[#E8F7EE]' },
  blue: { hex: '#0A5BD9', text: 'text-zone-b', bg: 'bg-zone-b', border: 'border-zone-b', light: 'bg-[#EAF2FF]' },
  orange: { hex: '#F08C00', text: 'text-zone-c', bg: 'bg-zone-c', border: 'border-zone-c', light: 'bg-[#FFF4E5]' },
  red: { hex: '#EF4444', text: 'text-zone-d', bg: 'bg-zone-d', border: 'border-zone-d', light: 'bg-[#FDECEC]' },
};
