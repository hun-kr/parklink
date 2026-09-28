const TZ = 'Asia/Seoul';

/** "10초 전 업데이트" 등 */
export function formatUpdatedAgo(updatedAt: number | null, now: number | null) {
  if (updatedAt === null || now === null) return '실시간 업데이트';
  const sec = Math.max(0, Math.floor((now - updatedAt) / 1000));
  if (sec < 5) return '방금 전 업데이트';
  if (sec < 60) return `${sec}초 전 업데이트`;
  return `${Math.floor(sec / 60)}분 전 업데이트`;
}

/** "2026년 9월 28일 (월) 오전 9:41" */
export function formatDateTime(epoch: number) {
  return `${formatDate(epoch)} ${formatTime(epoch)}`;
}

/** "2026년 9월 28일 (월)" */
export function formatDate(epoch: number) {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).formatToParts(new Date(epoch));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}년 ${get('month')}월 ${get('day')}일 (${get('weekday')})`;
}

/** "오전 9:41" */
export function formatTime(epoch: number) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(epoch));
}

/** 1200 → "1.2km", 350 → "350m" */
export function formatDistance(meters: number) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`;
  return `${Math.round(meters / 10) * 10}m`;
}

/** 'B', 2, 5 → "B구역 · 2열 · 5번째 칸" */
export function formatSlotPosition(zone: string, row: number, index: number) {
  return `${zone}구역 · ${row}열 · ${index}번째 칸`;
}
