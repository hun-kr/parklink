import type { Destination, MapPoint } from '@/lib/types';

/** Mock 현재 위치: 성균관대학교 자연과학캠퍼스 정문 앞 */
export const CURRENT_LOCATION: MapPoint & { label: string } = {
  x: 540,
  y: 700,
  label: '성균관대학교 자연과학캠퍼스 정문 앞',
};

export const DESTINATIONS: Destination[] = [
  {
    id: 'eng1-building',
    name: '제1공학관',
    category: '강의동',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 600, y: 500 },
    lotId: 'skku-eng1',
  },
  {
    id: 'life-building',
    name: '생명과학관',
    category: '강의동',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 170, y: 660 },
    lotId: 'skku-life',
  },
  {
    id: 'library',
    name: '삼성학술정보관',
    category: '도서관',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 300, y: 820 },
    lotId: 'skku-library',
  },
  {
    id: 'stadium',
    name: '대운동장',
    category: '체육시설',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 800, y: 660 },
    lotId: 'skku-stadium',
  },
];
