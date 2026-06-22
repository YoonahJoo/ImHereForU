# Work — 현재 작업 현황

**최종 업데이트**: 2026-06-22

---

## 현재 단계: v2.0 완료 → v3.0 준비

v2.0(책 UI 리워크)이 마무리되었다. 캐릭터 애니메이션 시스템, 온보딩 캐러셀,
패널 오버레이, 드래그 가능한 Focus 타이머, 테마 통일, 시간대별 인삿말까지 완료.
다음은 v3.0 — **캐릭터가 책 밖으로 나오는** 데스크톱 메이트 확장.

> v3.0 기획서: [v3.0-plan.md](v3.0-plan.md)

---

## 완료된 작업

### MVP 기능 (~ 2026-06-01)
- [x] 캐릭터 표정 시스템, 마우스 인터랙션 (클릭/더블클릭/드래그/롱프레스)
- [x] 말풍선 시스템 / Daily·Focus 모드 / Focus 타이머(25분)
- [x] 방치 감지 Idle Behavior(15분) / 시간대 자동 인사
- [x] 선물 시스템 + Gift Room / Settings / 라이트·다크 테마 / localStorage 영속성

### v2.0 — 책 UI 리워크 (2026-06-15 ~ 2026-06-22) ✅ 완료

**책 UI 기반**
- [x] Transparent frameless Electron 윈도우
- [x] 책 열리는 인트로 애니메이션(BookIntro) + IPC 창 리사이즈
- [x] book-light/dark.png 메인 배경, 캐릭터 일러스트 교체
- [x] 인터랙티브 에셋(sunflower/bouquet/memo/settings) Figma 좌표 절대 배치

**캐릭터 애니메이션 시스템**
- [x] 표정 이미지 12종 (GPT 생성, 완성 이미지 방식)
- [x] 두 레이어 crossfade (opacity 0.25s 전환)
- [x] idle blink (3~5초 간격, 150ms, 별도 overlay)
- [x] movement 애니메이션: float / sway / bounce / shake / pendulum(드래그)
- [x] 캐릭터 크기 180px → 210px
- [x] 드래그 시 말풍선: "where am I going?" (daily) / "Oops!" (focus)

**Focus 타이머**
- [x] 타이머 창 헤더 드래그로 위치 이동 (경계 clamp)
- [x] 타이머 색상: 말풍선 팔레트(크림/탄/브라운)에 통일
- [x] pause → resume 후 dragging/sulky 표정 버그 수정 (isTimerRunning 단독 기준)

**패널 오버레이**
- [x] GiftRoom / Settings: blur+darken backdrop + floating 패널 (500×440 / 420×480)
- [x] backdrop 클릭 닫힘, 패널 내부 클릭 stopPropagation
- [x] GiftRoom / Settings light theme: warm brown 팔레트 통일 (타이머 색상 기준)
- [x] GiftRoom / Settings / Timer 창 dark theme: warm chocolate brown (`#2e1a0d` 계열)

**온보딩**
- [x] 캐러셀 3페이지 (라이트 3장 + 다크 3장)
- [x] 좌/우 화살표, 하단 dot 인디케이터, 열릴 때마다 0페이지 초기화

**인삿말 시퀀스**
- [x] 시간대별 시작 인삿말 분기 (morning/afternoon/evening/night/dawn)
- [x] morning~evening: 시간 인사 → "It's lovely to see you here" → cozy → bouquet
- [x] night: 인삿말 후 character_sleepy + 야간 경고
- [x] dawn: 인삿말 후 character_sulky_daily + 새벽 경고

**기타 폴리시**
- [x] 말풍선 폰트 12.5px → 15.5px
- [x] 말풍선 드래그 추종
- [x] Settings ⚙️ 이모지 → settings.png, Default Mode 토글 제거
- [x] 캐릭터 힌트 텍스트 이모지 제거
- [x] 롱프레스 해제: daily → smile(3초 후 idle), focus → cheering(2초 후 focus_mode)

---

## 다음 작업: v3.0 — 캐릭터가 책 밖으로

상세는 [v3.0-plan.md](v3.0-plan.md) 참고. 먼저 확정 필요 사항(트리거/행동/범위) 결정 후 착수.

- [ ] 확정 필요 사항 5종 결정 (트리거, 데스크톱 행동, 책 접힘 시 동작, 모니터 범위, 완료 정의)
- [ ] M1 — 캐릭터 전용 투명 오버레이 윈도우 PoC (클릭 통과 포함)
- [ ] M2 — 책 ↔ 오버레이 상태 동기화(IPC) + "밖으로 나오기" 트리거
- [ ] M3 — 데스크톱 이동/행동(이동, 마우스 추적, 방치 시 귀가)
- [ ] M4 — 전환 연출 + 다크/라이트 폴리시
