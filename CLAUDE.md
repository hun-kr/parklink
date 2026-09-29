# ParkLink App — MVP 초안 (Claude Code 프로젝트 규칙)

이 파일은 Claude Code가 매 작업마다 자동으로 읽는 프로젝트 규칙이다.
작업 전 반드시 이 파일과 `/design` 폴더의 시안 이미지, 그리고 **ParkLink B2C 플랫폼 기획안 v8**(대표 제공 PDF, 내부 공유용이라 저장소에는 넣지 않음)을 참고한다.
시안 이미지와 기획안이 다르면 기획안의 화면 스토리보드(S01~S10)와 BI가 우선이다. 단, 숫자·추천 구역은 §5 데이터 규칙이 우선한다.

---

## 1. 제품 개요

- **파크링크(ParkLink)**: AI Vision 기반 실시간 주차정보 서비스
- **이번 목표**: 대학 담당자·투자자에게 스마트폰 브라우저로 보여줄 수 있는 **클릭 가능한 데모 앱**
- **데모 무대**: 성균관대학교 자연과학캠퍼스 제1공학관 주차장 (경기도 수원시 장안구 서부로 2066)
- 실제 서버·AI·카메라 연동 **없음**. 모든 데이터는 목데이터 + 시뮬레이션.

### 핵심 사용자 여정 (Dead End 금지)

```
앱 실행(로딩) → (첫 실행만) 로그인 → 위치 권한 → 지도 홈 → 목적지 선택('제1공학관') → 주차장 Overview
→ 추천 Zone('B구역 · 14면 · 목적지 도보 2분') → 안내받기 → Navigation(Mock 차량 이동)
→ (이동 중) AI 재추천: 추천 구역이 빠르게 차면 다른 구역 제안 → 주차장 모드
→ 주차 완료 → 주차 위치 자동 저장 → 내 차 찾기
```

모든 화면에서 다음 단계 또는 홈으로 가는 버튼이 반드시 있어야 한다.

### 제품 구조

External Map(네이버 지도) + Digital Parking Map + Real-time Vision(시뮬레이션) + Recommendation + Navigation + Parking Memory

---

## 2. 기술 스택

| 항목 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router) + TypeScript |
| 스타일 | Tailwind CSS |
| 상태관리 | Zustand (주차 위치 저장은 localStorage 연동) |
| 애니메이션 | Framer Motion |
| 아이콘 | lucide-react |
| 폰트 | Pretendard (CDN) |
| 외부 지도 | 네이버 지도 JS API v3 (NCP Maps, Dynamic Map) |
| 배포 | Vercel (GitHub main 브랜치 자동 배포) |

- **모바일 퍼스트**: 기준 폭 390px. PC에서 열면 가운데 390px 폰 프레임 안에 표시.
- 지도: **네이버 지도**(`NaverMapView`)가 기본. Client ID가 없거나 로드·인증에 실패하면 **SVG 가상 캠퍼스 지도**(`VirtualMapView`)로 자동 대체한다.
  두 구현체는 같은 `MapView` 인터페이스를 쓰며, 화면 코드는 구현체를 직접 import 하지 않는다.
- 좌표: 앱 데이터는 가상 지도 좌표(`MapPoint`, 1단위 = 1.5m)를 쓰고, 네이버 지도에 그릴 때만 `src/lib/geo.ts`로 위경도 변환한다.
  기준점은 `src/lib/config.ts`의 `map.geoAnchor`. 마커가 실제 위치와 어긋나면 이 값을 조정한다.
- 길안내 경로: 길찾기(Directions) API는 쓰지 않는다. 경유지를 `src/mocks/navRoutes.ts`의 `NAV_ROUTES_GEO`에 실제 위경도로 직접 지정한다
  (네이버 지도에서 우클릭 → 좌표 복사). 회전 안내는 경유지에서 자동 계산된다.
- 데이터 호출은 전부 `src/services/parkingService.ts` 한 곳을 거친다. (추후 실제 Vision API로 교체 대비)

### API 키 규칙

- 네이버 지도 **Client ID**는 브라우저에 공개되는 값이므로 `.env`의 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`에 두고 커밋한다.
- **Client Secret 등 비밀 키는 코드·저장소·`.env`에 절대 넣지 않는다.** 필요해지면 Vercel 환경변수(서버 전용)로만 쓴다.
- 지금은 Secret이 필요한 서버 API(Directions, Geocoding, Static Map 등)를 쓰지 않는다. 도입 전에 먼저 논의한다.
- 네이버 클라우드 콘솔 Application `parklink-prototype`의 Web 서비스 URL에 등록된 도메인에서만 지도가 뜬다.
  현재 등록: `http://localhost`, `https://parklink.vercel.app`. 새 배포 도메인(프리뷰 등)은 콘솔에 추가해야 한다(미등록 시 가상 지도로 표시).

---

## 3. 화면 목록과 시안 매칭

| # | 경로 | 화면 | 시안 |
|---|---|---|---|
| S01 | (앱 실행 시 오버레이) | 로딩: 흰 화면 + 심볼, 1초 이내 | 기획안 S01 |
| S02 | `/login` | 로그인: 카카오·네이버·Apple(데모는 기록만) + 로그인 없이 둘러보기 | 기획안 S02 |
| S03 | `/permission` | 위치 권한 안내: 확인 / 나중에 할게요 (거절해도 검색·안내 가능) | 기획안 S03 |
| 1 | `/` | 지도 홈 (주변 주차장 마커, 필터칩, 목록보기, 하단 탭) | `design/01_map_home.png` |
| 2 | `/` (바텀시트) | 주차장 선택 바텀시트 | `design/02_lot_bottomsheet.png` |
| 3 | `/destination` | 목적지 선택 + 추천 Zone | **시안 없음 — 기존 톤으로 신규 디자인** |
| 4 | `/lot/[id]` | 주차장 상세 | `design/03_lot_detail.png` |
| 5 | `/lot/[id]/status` | 구역별 주차현황 맵 (칸 단위 색상) | `design/04_lot_status.png` |
| 6 | `/navigate/[id]` | 길안내 (Mock 차량 이동) + AI 재추천(S08) + 주차장 모드(S09) | `design/05_navigation.png`, 기획안 S08·S09 |
| 7 | `/parked` | 주차 완료 + 위치 저장 | `design/06_parking_done.png` |
| 8 | `/my-car` | 내 차 찾기 | `design/07_find_my_car.png` |

하단 탭: **주차장**(`/`) · **내 주차**(`/my-car`, 저장된 위치 없으면 빈 상태 안내) · **MY**(`/my`, 로그인 상태 + '처음 화면부터 다시 보기')

- 로그인·위치 권한은 첫 실행에만 보인다(localStorage `parklink:session`). 시연 때는 MY → '처음 화면부터 다시 보기'로 초기화한다.

---

## 4. 디자인 규칙

- 시안의 색·간격·모서리·폰트 크기를 최대한 그대로 따른다.
- 색상 토큰 (`tailwind.config`에 정의, 기획안 06 서비스 BI 기준)
  - primary: `#1E5EEB` (Park Blue)
  - available(여유/비어있음): `#2FAF56` (Link Green)
  - ink(본문): `#111827` / surface(배경): `#F6F8FB` (Mist)
  - busy(혼잡/주차중): `#EF4444` 계열 빨강
  - unknown(정보없음): `#9CA3AF` 회색
  - zone 색: A 초록 / B 파랑 / C 주황 / D 빨강 (04 시안 기준)
- 로고: `src/components/brand/BrandSymbol.tsx` (파랑 P + 초록 기둥, 워드마크 PARK 파랑 + LINK 초록). 앱 아이콘은 파란 바탕에 흰 P.
- 카드: 흰 배경, 큰 라운드(16~20px), 옅은 그림자
- 버튼: 하단 2버튼 구조 (왼쪽 연한 파랑 보조 / 오른쪽 진한 파랑 또는 초록 주요)
- "● AI 실시간 제공" 배지는 초록 점 + 연초록 배경
- 한국어 UI. 날짜·시간은 **현재 시각 기준**으로 표시 (시안의 2024년 날짜 사용 금지)
- 사진 이미지는 `public/images/`에 있는 파일을 쓰고, 없으면 회색 placeholder + 아이콘으로 대체

---

## 5. 데이터 규칙 (시안끼리 숫자가 다를 때 이 규칙이 우선)

- 제1공학관 주차장: **총 640면**, 구역 4개
  - A구역 160면 / B구역 220면 / C구역 120면 / D구역 140면
  - 부가 정보: 장애인 4면, 전기차 8면, 24시간 운영, 방문차량 가능, 높이 2.3m 제한
- **전체 여유면 = 구역별 여유면 합계** (항상 일치해야 함)
- 초기값: A 4 / B 14 / C 6 / D 0 → 합계 24
- 상태 판정 (config에서 조정 가능)
  - 여유: 여유율 ≥ 5% 또는 여유면 ≥ 5
  - 혼잡: 여유면 0~2
  - 그 외: 보통
- 실시간 시뮬레이션: 5~10초마다 임의 구역의 여유면이 ±1~2 변동 (0 미만·총면수 초과 금지), "N초 전 업데이트" 문구 갱신
- 주변 다른 주차장은 목데이터 5~8개 (일부는 "정보없음", 일부는 "실시간")
- 칸 단위 데이터: 각 칸은 `{ id, zone, row, index, status: 'empty' | 'occupied' | 'unknown' }`
- 추천 로직: 목적지(제1공학관)까지 도보 거리가 가깝고 여유면이 많은 구역 우선 → 기본 추천은 **B구역**
  (기획안 예시는 C구역이지만 대표 결정으로 **B구역 유지**)
- AI 재추천 연출(S08): 길안내 진행률 `nav.rerouteAtProgress`에서 목표 구역을 `nav.rerouteLeave`면만 남기고 채운 뒤
  다음 순위 구역(기본 C구역)을 제안한다. 제안일 뿐이며 '유지'를 고르거나 답하지 않으면 기존 구역으로 안내한다.
- 내 주차 위치 예시 표기: `B구역 · 2열 · 5번째 칸`, 차량번호 목데이터 `123가 4567`

---

## 6. 폴더 구조 (권장)

```
src/
  app/            # 라우트(화면)
  components/     # 공통 UI (BottomSheet, ZoneCard, StatusBadge, ParkingMap ...)
    map/          #   MapView 인터페이스 + NaverMapView / VirtualMapView
  mocks/          # 목데이터 JSON/TS
  services/       # parkingService.ts (데이터 접근 단일 창구)
  store/          # Zustand 스토어
  lib/            # 유틸, 상태 판정, 시뮬레이터, geo(좌표 변환), naverMapsLoader
design/           # 시안 이미지 (수정 금지)
public/images/    # 앱에서 쓰는 사진
```

---

## 7. 작업 방식

- 한 단계(화면 1~2개) 단위로 작업하고, 끝나면 `npm run build`가 성공하는지 확인한 뒤 커밋한다.
- 화면을 완성하면 해당 시안과 **다른 점을 스스로 목록으로 보고**한다.
- 시안에 없는 부분이나 판단이 애매한 부분은 추측하지 말고 먼저 질문한다.
- 커밋 메시지는 한국어로 간단히: `feat: 지도 홈 화면 구현`
- `design/` 폴더와 이 `CLAUDE.md`는 요청 없이 수정하지 않는다.
