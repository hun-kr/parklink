import type { LotSummary } from './types';

export interface LotFilters {
  realtimeOnly: boolean;
  ev: boolean;
  disabled: boolean;
}

export const EMPTY_FILTERS: LotFilters = { realtimeOnly: false, ev: false, disabled: false };

/** 필터칩 조건 적용 (모두 AND) */
export function applyLotFilters(lots: LotSummary[], f: LotFilters) {
  return lots.filter(
    (l) =>
      (!f.realtimeOnly || l.isRealtime) &&
      (!f.ev || l.amenities.evSpaces > 0) &&
      (!f.disabled || l.amenities.disabledSpaces > 0),
  );
}
