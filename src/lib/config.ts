/** 데모 동작을 조정하는 설정값 (CLAUDE.md §5) */
export const CONFIG = {
  /** 상태 판정. 판정 순서: 정보없음 → 혼잡 → 여유 → 보통 */
  status: {
    /** 여유면이 이 값 이하이면 혼잡 */
    busyMax: 2,
    /** 여유율이 이 값 이상이면 여유 */
    availableRatio: 0.05,
    /** 또는 여유면이 이 값 이상이면 여유 */
    availableMin: 5,
  },
  /** 실시간 시뮬레이션 */
  simulation: {
    minIntervalMs: 5_000,
    maxIntervalMs: 10_000,
    /** 한 번에 변동하는 최대 면수 (1~maxDelta) */
    maxDelta: 2,
    /** 매 회 칸 데이터 주차장(제1공학관)을 바꿀 확률. 나머지는 주변 실시간 주차장 */
    mainLotProbability: 0.75,
    seed: 20661,
  },
  /** 추천 점수 = 여유면 × spaceWeight − 도보분 × walkWeight */
  recommend: {
    spaceWeight: 1,
    walkWeight: 3,
    /** 주차장 단위 추천에서는 여유면을 이 값까지만 점수에 반영 (가까운 곳 우선) */
    lotSpaceCap: 10,
    /** 주차장 단위 추천 후보 최대 거리(m) */
    lotMaxDistanceM: 900,
  },
  demo: {
    mainLotId: 'skku-eng1',
    mainDestinationId: 'eng1-building',
    plateNumber: '123가 4567',
  },
  /** 가상 지도 좌표 1단위 = 1.5m */
  map: {
    metersPerUnit: 1.5,
    /** 도보 속도 (m/분) */
    walkMetersPerMinute: 75,
  },
  /** 길안내 데모 연출 */
  nav: {
    /** 지도에서 주차장 입구까지 주행 시간 */
    driveMs: 14_000,
    /** 주차장 안에서 칸으로 들어가는 시간 */
    enterMs: 4_500,
    /** '주차 완료' 표시 후 이동까지 */
    doneMs: 1_500,
    /** 남은 시간 계산용 평균 속도 (m/분) */
    speedMetersPerMinute: 400,
    /** 주행 중 지도 배율 */
    followScale: 1.15,
  },
  storageKey: 'parklink:my-car',
} as const;
