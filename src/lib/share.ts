import { formatDateTime, formatSlotPosition } from './format';
import type { MyParking } from './types';

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

/** Web Share API 로 공유, 지원하지 않으면 클립보드에 복사 */
export async function shareOrCopy(data: { title: string; text: string; url: string }): Promise<ShareResult> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
      // 공유 실패 시 복사로 대체
    }
  }
  try {
    await navigator.clipboard.writeText(`${data.text}\n${data.url}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}

/** 내 차 위치 공유 링크: 받은 사람이 열면 '공유받은 위치'로 표시된다 */
export function myCarShareUrl(origin: string, p: MyParking) {
  const q = new URLSearchParams({ lot: p.lotId, slot: p.slotId, at: String(p.parkedAt) });
  return `${origin}/my-car?${q.toString()}`;
}

export function myCarShareText(p: MyParking) {
  return `[ParkLink] 내 차 위치\n${p.lotName}\n${formatSlotPosition(p.zone, p.row, p.index)}\n주차 시간: ${formatDateTime(p.parkedAt)}`;
}
