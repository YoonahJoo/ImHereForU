# Work — 현재 작업 현황

**최종 업데이트**: 2026-06-15

---

## 현재 단계: 책 UI 디자인 리워크

MVP 기능 구현 완료 후, 전체 UI를 책 에셋 기반으로 교체하는 작업 진행 중.

---

## 완료된 작업

### MVP 기능 (~ 2026-06-01)
- [x] 캐릭터 표정 시스템 (10종)
- [x] 마우스 인터랙션 (클릭 / 더블클릭 / 드래그 / 롱프레스)
- [x] 말풍선 시스템
- [x] Daily / Focus 모드 전환
- [x] Focus 타이머 (25분 포모도로)
- [x] Focus 타이머 실행 중 모드 전환 차단 + "where u going" 메시지
- [x] 방치 감지 Idle Behavior (15분)
- [x] 시간대 자동 인사
- [x] 선물 시스템 (희귀도 가중치)
- [x] Gift Room UI
- [x] Settings (이름, 기본 모드, 커스텀 메시지)
- [x] 라이트 / 다크 테마
- [x] localStorage 영속성

### 책 UI 디자인 리워크 (2026-06-15 ~)
- [x] Transparent frameless Electron 윈도우 적용
- [x] 책 열리는 인트로 애니메이션 (BookIntro 컴포넌트)
  - 인트로 창 500×750 (세로) → 메인 창 900×639 (가로) IPC 리사이즈
  - 책 표지(book-outside.jpeg) fade in → 3D flip → 책 내지(book-light/dark.png)
- [x] book-light.png / book-dark.png 메인 배경 적용
- [x] 캐릭터 에셋 교체 (yoonah-v2.0.png)
- [x] 인터랙티브 에셋 오버레이 Figma 좌표 기반 절대 위치 배치
  - sunflower 상단 (focus mode) — x:253, y:77, rotate:175.87deg
  - sunflower 하단 (daily mode) — x:190, y:457
  - bouquet (온보딩) — x:711, y:410, rotate:-18.43deg
  - memo (gift room) — x:565, y:44
- [x] 설정 버튼 → heart PNG 교체
- [x] 더블클릭 하트 이펙트 → 구겨진 종이 heart PNG 교체
- [x] 앱 시작 순차 인삿말 (말풍선 3개 순차 출력)
- [x] 말풍선 스타일 변경 (Fog Mist 베이지 배경 + 에스프레소 브라운 글씨)
- [x] bouquet 클릭 → 앱 온보딩 오버레이 (explain-light.png + frog 닫기 버튼)

---

## 진행 중

- [ ] 상단 sunflower → Focus 타이머 start/pause 연결
  - 현재: 모드 전환만 동작
  - 목표: 클릭마다 timer start/pause 토글 + 모드 전환 통합

---

## 다음 작업 (우선순위 순)

- [ ] 상단 sunflower 타이머 연동 완료
- [ ] explain-dark.png 온보딩 (다크 모드용 오버레이)
- [ ] book-light/dark.png에서 에셋 겹치는 부분 제거한 클린 버전으로 교체
- [ ] focus 타이머 UI 위치/스타일 재정비 (오른쪽 페이지 영역)
- [ ] Settings 패널 책 UI에 맞게 스타일 업데이트
- [ ] Gift Room 책 UI에 맞게 스타일 업데이트
- [ ] 다크 모드 전체 에셋 위치 확인 및 조정
