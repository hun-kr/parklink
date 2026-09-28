import type { ParkingLot } from '@/lib/types';

/**
 * 제1공학관 주차장 (데모 메인). 총 640면 = A160 + B220 + C120 + D140
 * 구역별 도보 시간(walkMinutesTo)은 목적지별 값. 제1공학관 보행 출입구는 B구역 쪽에 있다.
 */
export const MAIN_LOT: ParkingLot = {
  id: 'skku-eng1',
  name: '성균관대학교 제1공학관 주차장',
  shortName: '제1공학관 주차장',
  address: '경기도 수원시 장안구 서부로 2066',
  position: { x: 490, y: 428 },
  totalSpaces: 640,
  isRealtime: true,
  tags: ['대학 주차장', '24시간 운영'],
  amenities: {
    open24h: true,
    visitorAllowed: true,
    evSpaces: 8,
    disabledSpaces: 4,
    heightLimitM: 2.3,
  },
  operation: {
    hours: '24시간 연중무휴',
    target: '교수 · 직원 · 학생 · 방문차량',
    restriction: '높이 2.3m, 대형차량 일부 제한',
  },
  photos: [],
  zones: [
    { id: 'A', name: 'A구역', color: 'green', totalSpaces: 160, rows: 8, slotsPerRow: 20, walkMinutesTo: { 'eng1-building': 4, 'eng2-building': 3, 'semi-building': 1, library: 4 } },
    { id: 'B', name: 'B구역', color: 'blue', totalSpaces: 220, rows: 10, slotsPerRow: 22, walkMinutesTo: { 'eng1-building': 2, 'eng2-building': 2, 'semi-building': 3, library: 3 } },
    { id: 'C', name: 'C구역', color: 'orange', totalSpaces: 120, rows: 6, slotsPerRow: 20, walkMinutesTo: { 'eng1-building': 3, 'eng2-building': 4, 'semi-building': 3, library: 1 } },
    { id: 'D', name: 'D구역', color: 'red', totalSpaces: 140, rows: 7, slotsPerRow: 20, walkMinutesTo: { 'eng1-building': 2, 'eng2-building': 3, 'semi-building': 4, library: 1 } },
  ],
};

const UNIVERSITY_OPERATION = {
  hours: '평일 07:00 ~ 23:00',
  target: '교수 · 직원 · 학생 · 방문차량',
  restriction: '높이 2.1m',
};

const PUBLIC_OPERATION = {
  hours: '24시간',
  target: '누구나',
  restriction: '없음',
};

/** 주변 주차장 (실시간 / 일반 / 정보없음 혼합). position 은 가상 지도 좌표 (mocks/mapFeatures.ts) */
export const NEARBY_LOTS: ParkingLot[] = [
  {
    id: 'skku-pharm',
    name: '성균관대학교 약학관 주차장',
    shortName: '약학관 주차장',
    address: '경기도 수원시 장안구 서부로 2066 약학관',
    position: { x: 225, y: 360 },
    totalSpaces: 80,
    isRealtime: true,
    tags: ['대학 주차장'],
    amenities: { open24h: false, visitorAllowed: true, evSpaces: 2, disabledSpaces: 2 },
    operation: UNIVERSITY_OPERATION,
    photos: [],
  },
  {
    id: 'skku-life',
    name: '성균관대학교 생명과학관 주차장',
    shortName: '생명과학관 주차장',
    address: '경기도 수원시 장안구 서부로 2066 생명과학관',
    position: { x: 250, y: 540 },
    totalSpaces: 90,
    isRealtime: true,
    tags: ['대학 주차장'],
    amenities: { open24h: false, visitorAllowed: true, evSpaces: 0, disabledSpaces: 2 },
    operation: UNIVERSITY_OPERATION,
    photos: [],
  },
  {
    id: 'skku-stadium',
    name: '성균관대학교 대운동장 주차장',
    shortName: '대운동장 주차장',
    address: '경기도 수원시 장안구 서부로 2066 대운동장',
    position: { x: 600, y: 505 },
    totalSpaces: 200,
    isRealtime: true,
    tags: ['대학 주차장'],
    amenities: { open24h: true, visitorAllowed: true, evSpaces: 4, disabledSpaces: 4 },
    operation: { ...UNIVERSITY_OPERATION, hours: '24시간' },
    photos: [],
  },
  {
    id: 'skku-dorm',
    name: '성균관대학교 기숙사 주차장',
    shortName: '기숙사 주차장',
    address: '경기도 수원시 장안구 서부로 2066 기숙사',
    position: { x: 640, y: 355 },
    totalSpaces: 50,
    isRealtime: true,
    tags: ['대학 주차장'],
    amenities: { open24h: true, visitorAllowed: false, evSpaces: 0, disabledSpaces: 1 },
    operation: { ...UNIVERSITY_OPERATION, hours: '24시간', target: '기숙사생 · 교직원' },
    photos: [],
  },
  {
    id: 'yuljeon-public',
    name: '율전동 공영주차장',
    shortName: '율전동 공영주차장',
    address: '경기도 수원시 장안구 율전동 292',
    position: { x: 560, y: 780 },
    totalSpaces: 80,
    isRealtime: false,
    tags: ['공영 주차장'],
    amenities: { open24h: true, visitorAllowed: true, evSpaces: 2, disabledSpaces: 1 },
    operation: PUBLIC_OPERATION,
    photos: [],
  },
  {
    id: 'yuljeon-private',
    name: '율전동 민영주차장',
    shortName: '율전동 민영주차장',
    address: '경기도 수원시 장안구 율전동 318',
    position: { x: 250, y: 800 },
    totalSpaces: 50,
    isRealtime: false,
    tags: ['민영 주차장'],
    amenities: { open24h: false, visitorAllowed: true, evSpaces: 0, disabledSpaces: 1 },
    operation: { ...PUBLIC_OPERATION, hours: '08:00 ~ 22:00' },
    photos: [],
  },
  {
    id: 'skku-station',
    name: '성균관대역 환승주차장',
    shortName: '성균관대역 환승주차장',
    address: '경기도 수원시 장안구 율전로 지하 1',
    position: { x: 400, y: 930 },
    totalSpaces: 300,
    isRealtime: false,
    tags: ['환승 주차장'],
    amenities: { open24h: false, visitorAllowed: true, evSpaces: 6, disabledSpaces: 6 },
    operation: { ...PUBLIC_OPERATION, hours: '05:00 ~ 01:00' },
    photos: [],
  },
];

export const ALL_LOTS: ParkingLot[] = [MAIN_LOT, ...NEARBY_LOTS];

/**
 * 칸 데이터가 없는 주차장의 초기 여유면. null = 정보없음.
 * 실시간이 아닌 주차장의 숫자는 '기준 정보'로 시뮬레이션하지 않는다.
 */
export const INITIAL_LOT_AVAILABLE: Record<string, number | null> = {
  'skku-pharm': 18, // 여유
  'skku-life': 4, // 보통 (4/90 = 4.4%)
  'skku-stadium': 32, // 여유
  'skku-dorm': 2, // 혼잡
  'yuljeon-public': 3, // 보통 (실시간 아님)
  'yuljeon-private': null, // 정보없음
  'skku-station': null, // 정보없음
};
