import type { Destination, MapPoint } from '@/lib/types';

/** Mock 현재 위치: 성균관대학교 자연과학캠퍼스 안 (가상 지도 좌표) */
export const CURRENT_LOCATION: MapPoint & { label: string } = {
  x: 500,
  y: 500,
  label: '성균관대학교 자연과학캠퍼스 정문 앞',
};

/**
 * 추천 목적지. lotId 는 목적지 전용(가장 가까운) 주차장.
 * - 제1공학관 주차장(구역 데이터 있음)을 쓰는 목적지 → 구역 단위 추천
 * - 그 외 → 주변 주차장 단위 추천
 */
export const DESTINATIONS: Destination[] = [
  {
    id: 'eng1-building',
    name: '제1공학관',
    category: '강의동',
    icon: 'building',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 595, y: 422 },
    lotId: 'skku-eng1',
  },
  {
    id: 'library',
    name: '삼성학술정보관',
    category: '도서관',
    icon: 'library',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 485, y: 610 },
    lotId: 'skku-eng1',
  },
  {
    id: 'eng2-building',
    name: '제2공학관',
    category: '강의동',
    icon: 'building',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 580, y: 311 },
    lotId: 'skku-eng1',
  },
  {
    id: 'semi-building',
    name: '반도체관',
    category: '연구동',
    icon: 'lab',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 476, y: 312 },
    lotId: 'skku-eng1',
  },
  {
    id: 'life-building',
    name: '생명과학관',
    category: '강의동',
    icon: 'lab',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 330, y: 529 },
    lotId: 'skku-life',
  },
  {
    id: 'pharm-building',
    name: '약학관',
    category: '강의동',
    icon: 'lab',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 261, y: 321 },
    lotId: 'skku-pharm',
  },
  {
    id: 'stadium',
    name: '대운동장',
    category: '체육시설',
    icon: 'sports',
    address: '성균관대학교 자연과학캠퍼스',
    position: { x: 680, y: 570 },
    lotId: 'skku-stadium',
  },
];
