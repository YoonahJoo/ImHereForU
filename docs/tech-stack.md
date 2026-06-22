# Mini Yoonah — Tech Stack

v2.0 완성본 기준 (2026-06-22)

---

## 핵심 기술

| 역할 | 기술 | 버전 |
|---|---|---|
| 데스크탑 런타임 | Electron | ^30.0.1 |
| UI 프레임워크 | React | ^18.2.0 |
| 언어 | TypeScript | ^5.2.2 |
| 번들러 | Vite | ^5.1.6 |
| Electron-Vite 연결 | vite-plugin-electron | ^0.28.6 |

---

## 프로젝트 구조

```
ImHereForU/
├── electron/
│   ├── main.ts        # Electron 메인 프로세스
│   └── preload.ts     # IPC 브릿지
├── src/
│   ├── components/    # UI 컴포넌트
│   ├── hooks/         # 커스텀 훅
│   ├── data/          # 정적 메시지 데이터
│   ├── utils/         # 유틸 함수
│   └── types/         # TypeScript 타입 정의
└── public/
```

---

## 컴포넌트 구성

| 컴포넌트 | 역할 |
|---|---|
| `BookIntro` | 앱 시작 시 책 표지 → 3D 플립 인트로 애니메이션 |
| `YoonahRoom` | 메인 씬: 책 배경 + 에셋 배치 + 모든 패널 오케스트레이션 |
| `Character` | 캐릭터 렌더링 (표정 crossfade, blink, movement 애니메이션) |
| `SpeechBubble` | 말풍선 (fade 전환, 꼬리 포함) |
| `FocusMode` | Focus 타이머 창 (드래그 이동, 25분 포모도로) |
| `GiftRoom` | 선물 컬렉션 패널 |
| `Settings` | 설정 패널 |
| `ModeToggle` | Daily / Focus 모드 토글 (현재 미사용) |

---

## 커스텀 훅

| 훅 | 역할 |
|---|---|
| `useCharacterInteraction` | 클릭/더블클릭/드래그/롱프레스 이벤트 처리, 표정 전환 로직 |
| `useFocusTimer` | 타이머 상태 관리 (start/pause/reset, 남은 시간 카운트다운) |
| `useIdleBehavior` | 15분 방치 감지, sleepy 표정 및 wake prompt |
| `useTimeBased` | 시간대별 자동 말풍선 (1시간 주기) |

---

## 상태 관리

별도 상태 관리 라이브러리 없음. React `useState` + `useRef` + prop drilling으로 처리.

- `timerStatus` (`'idle' | 'running' | 'cancelled'`): focus/daily 표정 분기의 단일 기준
- `isTimerRunningRef`: 이벤트 핸들러의 stale closure 방지용 ref
- `activeLayerRef`: 캐릭터 crossfade 레이어 추적

---

## Electron IPC

| 채널 | 방향 | 용도 |
|---|---|---|
| `resize-window` | Renderer → Main | BookIntro 완료 시 창 크기 변경 (500×750 → 900×639) |

---

## 스타일링

- CSS Modules 없이 **컴포넌트별 `.css` 파일** 사용
- 라이트/다크 테마: `.theme-dark` 클래스를 `.yoonah-room` 루트 엘리먼트에 토글 → 자식 컴포넌트는 `.theme-dark .component` 셀렉터로 오버라이드
- 창 드래그: `-webkit-app-region: drag` / `no-drag` (Electron 전용 CSS 속성)

### 컬러 팔레트 (v2.0)

| 역할 | 라이트 | 다크 |
|---|---|---|
| 배경 | 책 PNG (베이지/크림 계열) | 책 PNG (다크 브라운 계열) |
| 패널 배경 | `#faf8f5 → #ece6dc` | `#2e1a0d → #4a2a18` |
| 말풍선 | `rgba(232,224,213,0.95)` | 동일 |
| 텍스트 | `#1C100A` | `#d4b896` |
| 강조 | `#8a7560` | `#a07848` |

---

## 영속성

`localStorage` — 다음 항목 저장:

- 테마 (light/dark)
- 기본 모드 (daily/focus)
- 선물 수집 현황

---

## 에셋

| 종류 | 포맷 | 설명 |
|---|---|---|
| 책 배경 | PNG (900×639) | `book-light.png`, `book-dark.png` |
| 캐릭터 표정 | PNG (1110×1417, 투명) | 12종 완성 이미지 (GPT 생성 + 배경 제거) |
| 인터랙티브 에셋 | PNG (투명) | sunflower, bouquet, memo, settings, heart 등 |
| 온보딩 이미지 | PNG | `explain-light-1/2/3.png`, `explain-dark-1/2/3.png` |

---

## 빌드 / 배포

```bash
npm run dev      # Vite dev server + Electron 동시 실행
npm run build    # tsc → vite build → electron-builder 패키징
```

- `electron-builder` ^24.13.3 으로 macOS `.app` 패키징
- 빌드 결과물: `release/` (gitignore 처리됨)
