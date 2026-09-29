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
    /**
     * 네이버 지도 연동: 가상 지도 좌표 anchor.point 가 실제 위경도 anchor.latLng 에 놓인다.
     * (북쪽 = -y, 동쪽 = +x, 1단위 = metersPerUnit m). 마커 위치가 실제 지도와 어긋나면 이 값을 조정한다.
     */
    geoAnchor: {
      point: { x: 470, y: 460 },
      latLng: { lat: 37.2939, lng: 126.975 },
    },
    /** 네이버 지도 스크립트 로드 제한 시간. 넘으면 가상 지도로 대체 */
    naverLoadTimeoutMs: 8_000,
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
    /** S08 AI 재추천: 주행 진행률이 이 값에 이르면 목표 구역이 빠르게 차는 상황을 연출 */
    rerouteAtProgress: 0.35,
    /** 재추천 연출 때 목표 구역에 남기는 여유면 */
    rerouteLeave: 2,
  },
  storageKey: 'parklink:my-car',
} as const;
