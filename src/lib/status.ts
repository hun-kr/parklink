import { CONFIG } from './config';
import type { Congestion, Slot, ZoneDef, ZoneSummary } from './types';

/** 여유면·총면수로 혼잡도 판정. 판정 순서: 정보없음 → 혼잡 → 여유 → 보통 */
export function getCongestion(available: number | null, total: number): Congestion {
  if (available === null || total <= 0) return 'unknown';
  const { busyMax, availableRatio, availableMin } = CONFIG.status;
  if (available <= busyMax) return 'busy';
  if (available / total >= availableRatio || available >= availableMin) return 'available';
  return 'normal';
}

/** 칸 데이터 → 구역별 요약. 구역 여유면은 항상 칸 데이터에서 계산한다. */
export function summarizeZones(zones: ZoneDef[], slots: Slot[]): ZoneSummary[] {
  return zones.map((zone) => {
    let availableSpaces = 0;
    let unknownSpaces = 0;
    for (const s of slots) {
      if (s.zone !== zone.id) continue;
      if (s.status === 'empty') availableSpaces += 1;
      else if (s.status === 'unknown') unknownSpaces += 1;
    }
    return {
      ...zone,
      availableSpaces,
      unknownSpaces,
      congestion: getCongestion(availableSpaces, zone.totalSpaces),
    };
  });
}

/** 전체 여유면 = 구역별 여유면 합계 */
export function sumAvailable(zones: ZoneSummary[]): number {
  return zones.reduce((acc, z) => acc + z.availableSpaces, 0);
}
