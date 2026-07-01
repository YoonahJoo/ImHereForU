# History — 개발 히스토리

프로젝트의 주요 결정, 구현, 문제 해결 과정을 날짜 순으로 기록.

---

## 2026-07-01 — 발표 준비: 문서 구조 정리 & 미래 설계 문서

### 배경
발표·면접을 앞두고 레포 문서를 정리하고, 확장 계획을 코드 근거 기반으로 재정리.

### 구현한 것들

**미래 설계 문서 작성** (`385f0b3`)
- `docs/future_plan.md` 신규 — 3단계 확장 로드맵(둘을 잇기 → 캐릭터 생성 → 리깅), 각 단계 프론트/백엔드 범위, 캐릭터 생성 파이프라인의 실패 모드·가드레일, 수익화, 코드 레퍼런스 색인
- 원칙: 추측이 아니라 **현재 코드 위에 쌓는 설계**만 기록 (편지=`useFocusTimer.onComplete`, 실시간=`OverlayApp`의 IPC→WebSocket 교체 등)

**루트 마크다운 정리** (`385f0b3`, `74f3770`)
- 루트의 기획서 md들을 `docs/`로 이동 (`CLAUDE.md`/`AGENTS.md`/`README.md`만 루트 유지)
- 개인·발표용 문서(개념정리·presentation-prep·presentation-script·work·analysis_personal)는 `git rm --cached` + `.gitignore` → **로컬 보존, GitHub 비공개**

**README v2.0.0 최신화** (`74f3770`)
- '현재 상태'를 v2.0.0 배포 완료로 갱신, 책 안/책 밖(데스크탑 메이트) 구현 내역 정리
- 확장 안내를 `docs/v3.0-plan.md` → `docs/future_plan.md`로 교체

---

## 2026-06-30 — v2.0.0 배포 & 데스크탑 완료 연출

### 배경
데스크탑 메이트가 안정화되어 v2.0.0으로 패키징·배포. 책 밖에서의 감정 연출을 책 안과 동등하게 맞춤.

### 구현한 것들

**v2.0.0 배포** (`485b8b6`)
- electron-builder로 macOS `.dmg` 패키징, 배포 메타데이터 설정
- v3.0 기획의 핵심 "책 밖으로 꺼내기"까지 포함해 v2.0.0으로 릴리스

**책 밖 감정 연출 이식**
- 책 밖 Focus 완료 시 축하 연출(smile + 축하 → 선물방 안내 → 복귀) (`4118fc3`)
- 데스크탑 캐릭터 **우클릭으로 귀가**(책 복귀), 집 아이콘 제거 (`3d59582`)
- 책 밖(데스크탑)에서도 방치(idle) 연출이 보이게 — 책/오버레이 중 항상 한 창만 방치를 세도록 조율 (`c36c20e`)
- 귀가 확인창(yes/no) 버튼 색상 통일 (`30c8728`)

---

## 2026-06-29 — [트러블슈팅] 책 밖 포커스 타이머 스로틀링 수정

### 배경
캐릭터를 데스크탑으로 꺼내면 집중 타이머가 **약 4배 느려지는** 문제 (10분간 약 2분만 흐름).

### 원인
캐릭터 외출 시 타이머가 든 책 창을 `hide()`로 숨김 → Chromium이 "안 보이는 창"으로 보고 **백그라운드 스로틀링**(JS 타이머 강제 감속)을 적용.

### 해결 (2단 방어) (`363b9f0`, 앞서 `fd7636e`)
1. `backgroundThrottling: false` — 책 창·오버레이 창 모두 적용, 숨겨져도 타이머가 정상 속도로 흐르게
2. 타이머 재설계: "1초씩 빼기(prev - 1)" → **"종료 시각(endAt) 기준 매 틱 재계산"** (`useFocusTimer`)
   - 틱이 누락돼도(슬립/탭전환) 다음 틱에서 자동 보정, drift 없음

### 결과
| | Before | After |
|---|---|---|
| 캐릭터 외출 시 타이머 | 약 4배 느림 | 정상 속도 |
| 틱 누락(슬립/탭전환) | 영구 손실 | 다음 틱에 자동 보정 |

---

## 2026-06-27 — 포커스 타이머 커스텀 시간 + 방/온보딩 폴리시

### 구현한 것들
- **집중 타이머 시간 직접 설정** 기능 + 방(book) UI 에셋 갱신 (`289a2d8`, `de08cef`)
- 온보딩 가이드 4페이지로 확장, 마지막 페이지에서만 개구리 종료 버튼 노출 (`0b48bc7`)
- 방치(idle) 타임아웃 15분 → 10분, 롱프레스 5초 → 3초로 단축 (`8d3efa3`)
- 타이머 편집 중 변경 없이 확정 시 편집창이 다시 열리던 버그 수정 (`ebe8769`)

---

## 2026-06-25 — v3.0 데스크탑 메이트 (책 밖 확장)

### 배경
캐릭터가 책(앱) 안에만 머물던 것을 **바탕화면 전체로 나와 상주하는 "데스크탑 메이트"**로 확장.
웹으로는 불가능한(투명 오버레이·always-on-top·마우스 통과) 형태라 Electron의 강점을 살린 핵심 확장.

### 구현한 것들 (M1~M4)

**M1 — 투명 오버레이 창** (`08fa588`)
- 전체화면 투명·프레임리스·always-on-top 창 생성 (`createOverlayWindow`)
- `setIgnoreMouseEvents(true, { forward: true })`로 **마우스 통과** → 오버레이 아래 앱은 정상 클릭 유지
- 캐릭터 위에 커서가 오면 hit-detection으로 pass-through를 잠깐 꺼 클릭/드래그를 받음

**M2 — step-out 트리거 + 책↔오버레이 동기화** (`9862ea4`)
- 책에서 문 아이콘 클릭 → `book:exit-character` IPC → 오버레이 표시, 책 창 hide
- 타이머·테마·완료 연출을 IPC 채널로 실시간 동기화 (표정은 데스크탑이 로컬 소유)

**M3 — 데스크탑 이동/인터랙션** (`cf39aff` → `dcf6cd3`)
- 초기엔 커서 따라가기 → 라이브 테스트 후 **드래그해 둔 위치에 고정(drag-to-stay)**으로 변경
- 책 안과 동일한 클릭·더블클릭·롱프레스·방치 인터랙션 재사용, 회색 플래시 제거

**M4 — 트랜지션·테마·멀티모니터** (`73c9162`)
- 나오고 들어갈 때 pop 트랜지션, 테마 동기화, **활성 디스플레이에 배치**(멀티모니터 대응)

### 라이브 테스트 후 다듬기
- 책이 닫혀도 캐릭터의 "집"을 유지(필요 시 책 창 재생성) (`5c38a69`)
- 나가면 책을 숨기고, 책 폰트와 맞추고, 귀가 모션 추가 (`89345a0`)
- 귀가 왕복 후 말풍선이 캐릭터에서 분리되던 버그 수정(언마운트로 offset 초기화) (`690e198`)
- step-out 포즈가 실제 focus-timer 상태를 따라가게 (`2000b70`, `0d56e54`)
- 오버레이(utility 창)로 macOS Dock 아이콘이 사라지는 문제 → Dock presence 강제 (`0aacf72`)

### 메모
- 오버레이는 `focusable: false`라 Chromium이 백그라운드로 보고 타이머를 스로틀링함 → `backgroundThrottling: false`로 방어 (`fd7636e`, 이후 06-29 타이머 재설계로 완결)

---

## 2026-06-22 — v2.0 마무리 폴리시 (인터랙션 + 테마 + 인삿말)

### 배경
캐릭터 애니메이션 시스템 완성(`008fc9b`) 이후, 인터랙션 디테일·테마·시작 시퀀스를 집중적으로 다듬어 v2.0을 마무리.

### 구현한 것들

**드래그 인터랙션 개선** (`cc423e0`)
- 드래그 시 말풍선 출력: daily → `"where am I going?"`, focus → `"Oops!"`
- 드래그 애니메이션: 고정 기울기(rotate 5deg) → **pendulum** (-12deg ↔ +12deg, 0.6s)

**패널 오버레이 리워크** (`cc423e0`)
- GiftRoom / Settings: `inset: 0` 전체 덮기 → **blur+darken backdrop** + floating 패널
  - backdrop 클릭으로 닫힘, 패널 클릭은 stopPropagation
  - GiftRoom 500×440px / Settings 420×480px, border-radius 20px

**색상 팔레트 통일** (`cc423e0`)
- GiftRoom / Settings light theme: pink/purple → **warm brown** (타이머 팔레트 기준)
  - 배경: `#faf8f5 → #f3ede6 → #ece6dc`, 강조: `#8a7560`, hover: `#6e5b48`
- GiftRoom / Settings / Timer 창 dark theme: blue/navy → **warm chocolate brown**
  - 배경: `#2e1a0d → #3a2010 → #4a2a18`, 텍스트: `#d4b896`, 버튼: `#a07848`
  - Timer 창 dark mode 신규 추가 (`.theme-dark .focus-timer-window` 등)

**온보딩 캐러셀** (`cc423e0`)
- explain 이미지 1장 → light 3장 + dark 3장 (총 6개 에셋)
- 좌/우 화살표 버튼, 하단 dot 인디케이터, 페이지 초기화(열릴 때마다 0으로)

**시작 인삿말 시간대별 분기** (`20697ad`)
- morning/afternoon/evening: 시간대 인사 → "It's lovely to see you here" → cozy → bouquet → idle
- night: 기본 인사 → cozy → bouquet → `character_sleepy` + 야간 경고 → idle
- dawn: 기본 인사 → cozy → bouquet → `character_sulky_daily` + 새벽 경고 → idle
- 타이머 배열 방식으로 관리, 각 분기별 clearTimeout 보장

**말풍선 폰트 사이즈** (`20697ad`)
- 12.5px → 15.5px

### 메모
- dark theme는 `.theme-dark` 클래스가 `.yoonah-room`에 붙는 구조 → 모든 dark 규칙은 이 클래스로 범위 지정
- explain-dark.png(구 단일 파일)는 유지, 새 에셋은 explain-dark-1/2/3.png

---

## 2026-06-22 — v2.0 캐릭터 애니메이션 시스템

### 배경
v2.0 책 UI 리워크의 핵심 기술 과제. 기존 단일 이미지 캐릭터를 12개 표정 이미지 기반의 애니메이션 시스템으로 전환.

### 구현한 것들

**캐릭터 에셋 전략 결정** — GPT 이미지 생성, Method A
- 레이어 방식 포기 → 표정별 완성 이미지 12장 (AI 생성 모델은 픽셀 정렬 보장 불가)
- 에셋: character_idle/idle_blink/wave/smile/focus/sleepy/sulky_daily/sulky_focus/dragging_daily/dragging_focus/curious/cheering
- 공통 조건: 1110×1417px, 투명 PNG, 캐릭터 위치 전 이미지 동일

**Character 컴포넌트 전면 재작성** (`008fc9b`)
- 두 레이어 crossfade: layerA(normal flow) / layerB(absolute overlay), 0.25s opacity 전환
  - `activeLayerRef`로 stale closure 방지
- idle blink: 별도 overlay 이미지(`char-blink`), 3~5초 간격, 150ms 지속, crossfade 없음
- movement 애니메이션: float(idle), sway(sleepy), bounce(클릭), shake(롱프레스), pendulum(드래그)
- `isTimerRunning` prop 추가: focus/daily 표정 분기의 단일 기준으로 사용
  - 기존 `mode === 'focus'` 조건 제거 → `timerStatus === 'running'` 하나로 통일

**버그 수정**
- Focus 타이머 pause → resume 후 dragging/sulky가 daily로 적용되는 버그
  - 원인: `mode` 비교가 타이밍에 따라 'daily'로 남을 수 있음
  - 해결: `mode` 조건 제거, `isTimerRunningRef.current` 단독 사용

### 메모
- `pause()`는 내부적으로 `setStatus('cancelled')` — 'paused' 상태 없음
- `start()`는 `remainingSeconds`에서 이어서 재개

---

## 2026-06-22 — v2.0 타이머/세팅/표정 폴리시

### 배경
캐릭터 시스템 완성 후 Focus 타이머 창, Settings, 표정 세부 동작을 다듬음.

### 구현한 것들 (`bffc0e5`)

- Focus 타이머 창: 헤더 드래그로 위치 이동, 컨테이너 경계 clamp
- Focus 타이머 색상: 말풍선 팔레트(크림 `rgba(232,224,213)` / 탄 / 브라운 `#1C100A`) 통일
- Settings: ⚙️ 이모지 → `settings.png` 아이콘, Default Mode 토글 제거
- 캐릭터 힌트 텍스트: 이모지 제거
- 롱프레스 해제 표정:
  - daily → `smile` (3초 후 idle)
  - focus → `cheering` (2초 후 focus_mode)

---

## 2026-06-15 — 책 UI 디자인 리워크

### 배경
MVP 완성 후 기존의 단순한 div 기반 UI(400×500px)를 책 에셋 기반으로 전면 교체.
사용자가 앱을 열면 책 표지가 펼쳐지는 경험을 주는 것이 목표.

### 구현한 것들

**투명 창 + 책 배경**
- `transparent: true, frame: false` Electron 윈도우 → 배경 없이 책 이미지만 떠 있는 느낌
- `book-light.png` / `book-dark.png`를 메인 배경으로 적용 (900×639px)
- `-webkit-app-region: drag` 로 창 전체를 드래그 가능하게, 클릭 요소에만 `no-drag` 처리

**책 열리는 인트로 애니메이션**
- `BookIntro` 컴포넌트 신규 생성
- CSS 3D flip: `transform-style: preserve-3d`, `backface-visibility: hidden`, `rotateY(-180deg)`
- 인트로 창(500×750 세로) → 메인 창(900×639 가로) IPC 리사이즈로 해결
  - `ipcMain.on('resize-window')` + `window.ipcRenderer.send('resize-window', { width, height })`

**인터랙티브 에셋 오버레이**
- sunflower / bouquet / memo / settings / frog-exit 등 PNG 에셋을 절대 위치로 배치
- Figma에서 book-light.png(900×639) 위에 에셋 올린 후 X/Y/W/H 읽어 CSS에 직접 적용
- 각 에셋 rotate 값도 Figma 패널 기준으로 CSS `transform: rotate(Ndeg)` 적용

**캐릭터 + 인터랙션 개선**
- 캐릭터 이미지 `yoonah-v2.0.png` 교체
- 더블클릭 하트 이펙트: 이모지(💖) → 구겨진 종이 heart PNG
- 하트가 캐릭터 위치를 따라다니도록 `offsetX`, `offsetY` prop 추가
- 말풍선 스타일: Fog Mist(#E8E0D5) 배경 + 에스프레소 브라운(#1C100A) 텍스트
- 말풍선 너비 `max-width` → `width` 고정 (드래그 시 말풍선 세로로 찌그러지는 버그 수정)
- 설정 버튼 ⚙️ → heart.png PNG 교체

**온보딩 오버레이**
- bouquet 클릭 → 배경 블러(backdrop-filter: blur) + explain-light.png 오버레이
- frog-exit-button.png 클릭 시 닫힘 (x:672, y:462, rotate:-16.74deg)

**앱 시작 인삿말**
- YoonahRoom 마운트 시 말풍선 3개 순차 출력 (300ms / 2300ms / 4300ms)
- `greetingActive` ref로 인삿말 중 시간대 자동 인사가 끼어드는 버그 방지

### 해결한 기술적 문제들

| 문제 | 원인 | 해결 |
|---|---|---|
| 클릭 인터랙션 안 됨 | `-webkit-app-region: drag`가 mousedown 가로챔 | 클릭 요소에 `no-drag` 추가 |
| 하트가 항상 같은 자리에서 뜸 | HeartEffect에 캐릭터 위치 전달 안 됨 | `offsetX/Y` prop 추가 |
| 하트가 잘림 | `.heart-effect`에 `overflow: hidden` | `overflow: visible`로 변경 |
| 말풍선이 드래그 시 좁아짐 | `max-width`는 컨테이너 가장자리 기준 | `width` 고정값으로 변경 |
| 인트로가 창보다 큼 | 인트로(세로)와 메인(가로) 창 크기 충돌 | IPC 리사이즈로 창 크기 분리 |
| 시간대 인사가 인삿말과 겹침 | timeMessage가 1초 후 실행 | `greetingActive` ref 가드 추가 |

---

## 2026-06-01 — MVP 완성 (라이트/다크 테마 포함)

- 라이트 / 다크 테마 전환 구현
- localStorage로 설정 영속성 확보
- Widget MVP 전체 기능 완성
- git 커밋: `e732650 feat: add light/dark theme support and complete widget MVP`

---

## 2026-05-26 — 버그 수정 + 문서화

- sulky daily 모드에서 랜덤 메시지 적용
- PRD.md 작성 (프로젝트 기획서)
- Reference 이미지 추가

---

## 2026-05-24 — MVP 초기 구현 완성

- Electron + React + Vite + TypeScript 초기 세팅
- 캐릭터 표정 시스템 (10종), 마우스 인터랙션 (클릭/더블클릭/드래그/롱프레스)
- Daily / Focus 모드 전환
- Focus 타이머 (25분 포모도로)
- 방치 감지 Idle Behavior (15분)
  - Focus 타이머 실행 중 idle 타이머 소멸 버그 수정 (pauseIdle/resetIdle 분리)
- Focus 타이머 실행 중 Daily 모드 전환 차단 + "where u going" 메시지
- 선물 시스템 + Gift Room UI
- Settings 패널
- 시간대 자동 인사
