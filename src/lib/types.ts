export type ZoneId = 'A' | 'B' | 'C' | 'D';
export type SlotStatus = 'empty' | 'occupied' | 'unknown';
export type SlotType = 'normal' | 'ev' | 'disabled';

/** 여유 / 보통 / 혼잡 / 정보없음 */
export type Congestion = 'available' | 'normal' | 'busy' | 'unknown';

/** 가상 SVG 지도 좌표 (추후 실제 지도로 교체 시 lat/lng 로 대체) */
export interface MapPoint {
  x: number;
  y: number;
}

export interface Amenities {
  open24h: boolean;
  visitorAllowed: boolean;
  evSpaces: number;
  disabledSpaces: number;
  heightLimitM?: number;
}

export interface OperationInfo {
  hours: string;
  target: string;
  restriction: string;
}

/** 주차장 기본 정보 (정적) */
export interface ParkingLot {
  id: string;
  name: string;
  shortName: string;
  address: string;
  position: MapPoint;
  /** 현재 위치 기준 거리(m) */
  distanceM: number;
  totalSpaces: number;
  /** AI Vision 실시간 제공 여부 */
  isRealtime: boolean;
  tags: string[];
  amenities: Amenities;
  operation: OperationInfo;
  photos: string[];
  /** 칸 단위 데이터가 있는 주차장만 구역 정의를 가진다 */
  zones?: ZoneDef[];
}

/** 구역 정의 (정적) */
export interface ZoneDef {
  id: ZoneId;
  name: string;
  color: 'green' | 'blue' | 'orange' | 'red';
  totalSpaces: number;
  rows: number;
  slotsPerRow: number;
  /** 목적지 id → 도보 시간(분) */
  walkMinutesTo: Record<string, number>;
}

/** 칸 단위 데이터 */
export interface Slot {
  id: string; // 'B-2-05'
  zone: ZoneId;
  row: number; // 1부터 → 'N열'
  index: number; // 1부터 → 'N번째 칸'
  status: SlotStatus;
  type: SlotType;
}

/** 구역 실시간 요약 (칸 데이터에서 계산) */
export interface ZoneSummary extends ZoneDef {
  availableSpaces: number;
  unknownSpaces: number;
  congestion: Congestion;
}

/** 주차장 실시간 요약 */
export interface LotSummary extends ParkingLot {
  /** null = 정보없음 */
  availableSpaces: number | null;
  congestion: Congestion;
  zoneSummaries: ZoneSummary[];
  updatedAt: number | null;
}

export interface Destination {
  id: string;
  name: string;
  category: string;
  address: string;
  position: MapPoint;
  lotId: string;
}

export interface Recommendation {
  destinationId: string;
  lotId: string;
  zoneId: ZoneId;
  zoneName: string;
  availableSpaces: number;
  walkMinutes: number;
  score: number;
  /** 추천 구역에서 비어 있는 칸 하나 (안내 목표) */
  targetSlotId: string | null;
}

/** 내 주차 위치 (localStorage 저장) */
export interface MyParking {
  lotId: string;
  lotName: string;
  address: string;
  zone: ZoneId;
  row: number;
  index: number;
  slotId: string;
  plateNumber: string;
  parkedAt: number;
}

/** 실시간 스냅샷: 주차장별 여유면(칸 데이터 없는 주차장) + 칸 데이터 */
export interface RealtimeSnapshot {
  /** 칸 데이터가 없는 주차장의 여유면. null = 정보없음 */
  lotAvailable: Record<string, number | null>;
  /** lotId → 칸 배열 */
  slots: Record<string, Slot[]>;
  /** lotId → 마지막 업데이트 시각(epoch ms) */
  updatedAt: Record<string, number>;
}
