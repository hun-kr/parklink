import { CONFIG } from './config';
import type { LotSummary, RankedLot, RankedZone, Recommendation, Slot, ZoneSummary } from './types';

/**
 * 구역 순위: 목적지까지 도보 거리가 가깝고 여유면이 많은 구역 우선.
 * 점수 = 여유면 × spaceWeight − 도보분 × walkWeight. 혼잡(여유면 ≤ busyMax) 구역은 선택 불가.
 * 초기값(A4/B14/C6/D0) · 제1공학관 기준 1위: B구역 · 14면 · 도보 2분
 */
export function rankZones(zones: ZoneSummary[], destinationId: string): RankedZone[] {
  const { spaceWeight, walkWeight } = CONFIG.recommend;
  return zones
    .map((zone) => {
      const walkMinutes = zone.walkMinutesTo[destinationId] ?? 5;
      return {
        zone,
        walkMinutes,
        score: zone.availableSpaces * spaceWeight - walkMinutes * walkWeight,
        selectable: zone.availableSpaces > CONFIG.status.busyMax,
      };
    })
    .sort((a, b) => Number(b.selectable) - Number(a.selectable) || b.score - a.score);
}

/**
 * 주차장 순위 (구역 데이터가 없는 목적지용).
 * 여유면은 lotSpaceCap 까지만 반영해 가까운 주차장을 우선한다. 혼잡·정보없음은 추천하지 않는다.
 */
export function rankLots(candidates: { lot: LotSummary; walkMinutes: number }[]): RankedLot[] {
  const { walkWeight, lotSpaceCap } = CONFIG.recommend;
  return candidates
    .map(({ lot, walkMinutes }) => {
      const known = lot.availableSpaces !== null;
      return {
        lot,
        walkMinutes,
        score: known ? Math.min(lot.availableSpaces!, lotSpaceCap) - walkMinutes * walkWeight : -Infinity,
        selectable: lot.congestion !== 'busy',
      };
    })
    .sort(
      (a, b) =>
        Number(b.selectable && b.score > -Infinity) - Number(a.selectable && a.score > -Infinity) ||
        b.score - a.score ||
        a.walkMinutes - b.walkMinutes,
    );
}

/** 추천 구역 + 안내 목표 칸 */
export function recommendZone(
  lotId: string,
  destinationId: string,
  zones: ZoneSummary[],
  slots: Slot[],
  preferredSlotId?: string,
): Recommendation | null {
  const best = rankZones(zones, destinationId).find((r) => r.selectable || r.zone.availableSpaces > 0);
  if (!best) return null;

  const emptySlots = slots
    .filter((s) => s.zone === best.zone.id && s.status === 'empty')
    .sort((a, b) => a.row - b.row || a.index - b.index);
  const target = emptySlots.find((s) => s.id === preferredSlotId) ?? emptySlots[0] ?? null;

  return {
    destinationId,
    lotId,
    zoneId: best.zone.id,
    zoneName: best.zone.name,
    availableSpaces: best.zone.availableSpaces,
    walkMinutes: best.walkMinutes,
    score: best.score,
    targetSlotId: target?.id ?? null,
  };
}

/** 추천 이유 문구 */
export function zoneReason(target: RankedZone, all: RankedZone[]) {
  const selectable = all.filter((r) => r.selectable);
  const mostSpaces = selectable.every((r) => r.zone.availableSpaces <= target.zone.availableSpaces);
  const closest = selectable.every((r) => r.walkMinutes >= target.walkMinutes);
  if (mostSpaces && closest) return '여유면이 가장 많고 목적지와 가장 가까워요';
  if (mostSpaces) return '여유면이 가장 많고 목적지와 가까워요';
  if (closest) return '목적지와 가장 가까운 구역이에요';
  return '여유면과 도보 거리를 함께 고려했어요';
}
