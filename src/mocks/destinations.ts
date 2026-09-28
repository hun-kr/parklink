import type { Destination, MapPoint } from '@/lib/types';

/** Mock 현재 위치: 성균관대학교 자연과학캠퍼스 안 (가상 지도 좌표) */
export const CURRENT_LOCATION: MapPoint & { label: string } = {
  x: 500,
  y: 500,
  label: '성균관대학교 자연과학캠퍼스 정문 앞',
};

export const DESTINATIONS: Destination[] = [
  {
    id: 'eng1-building',
    name: '제1공학관',
    category: '강의동',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 595, y: 422 },
    lotId: 'skku-eng1',
  },
  {
    id: 'life-building',
    name: '생명과학관',
    category: '강의동',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 330, y: 530 },
    lotId: 'skku-life',
  },
  {
    id: 'pharm-building',
    name: '약학관',
    category: '강의동',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 260, y: 315 },
    lotId: 'skku-pharm',
  },
  {
    id: 'stadium',
    name: '대운동장',
    category: '체육시설',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 680, y: 570 },
    lotId: 'skku-stadium',
  },
];
