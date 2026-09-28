import { CONFIG } from './config';
import type { Recommendation, Slot, ZoneSummary } from './types';

/**
 * 추천 구역: 목적지까지 도보 거리가 가깝고 여유면이 많은 구역 우선.
 * 점수 = 여유면 × spaceWeight − 도보분 × walkWeight. 혼잡(여유면 ≤ busyMax) 구역은 후보에서 제외.
 * 초기값(A4/B14/C6/D0) 기준 결과: B구역 · 14면 · 도보 2분
 */
export function recommendZone(
  lotId: string,
  destinationId: string,
  zones: ZoneSummary[],
  slots: Slot[],
  preferredSlotId?: string,
): Recommendation | null {
  if (zones.length === 0) return null;
  const { spaceWeight, walkWeight } = CONFIG.recommend;

  const scored = zones.map((z) => {
    const walkMinutes = z.walkMinutesTo[destinationId] ?? 5;
    return { zone: z, walkMinutes, score: z.availableSpaces * spaceWeight - walkMinutes * walkWeight };
  });
  const candidates = scored.filter((s) => s.zone.availableSpaces > CONFIG.status.busyMax);
  const pool = candidates.length > 0 ? candidates : scored.filter((s) => s.zone.availableSpaces > 0);
  if (pool.length === 0) return null;

  const best = pool.reduce((a, b) => (b.score > a.score ? b : a));
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
