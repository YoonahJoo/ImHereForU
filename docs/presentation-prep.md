# ImHereForU — 발표 준비 자료

**작성일**: 2026-06-25
**대상**: 프로젝트 발표
**기준 커밋**: v3.0 착수 전 `b179b95` ↔ 현재 `0d56e54` (`main`)

---

## 0. 한 줄 소개

> 장거리 연애 중에도 "상대방이 곁에 있는 감각"을 주는 **감성형 macOS 데스크톱 컴패니언 앱**.
> 책(앱) 안에 살던 캐릭터가 **책 밖 데스크탑 위로 나와** 사용자 곁에 머무는 "데스크탑 메이트"로 확장됨(v3.0).

---

## 1. v3.0 구현 전 ↔ 현재 비교

### 1-1. 무엇이 달라졌나

| 항목 | v2.0 (구현 전, `b179b95`) | v3.0 (현재, `0d56e54`) |
|---|---|---|
| 캐릭터 활동 범위 | 책 창 **안**(왼쪽 페이지) | **데스크탑 전체 화면** |
| 윈도우 구조 | `BrowserWindow` **1개** (책) | `BrowserWindow` **2개** (책 + 투명 오버레이) |
| 렌더러 엔트리 | `index.html` 1개 | `index.html` + `overlay.html` (멀티 엔트리) |
| 마우스 처리 | 책 창 내부 DOM 이벤트만 | OS 레벨 **per-pixel 마우스 통과** |
| 창 간 통신 | IPC 1채널 (`resize-window`) | IPC **8+ 채널** (양방향 동기화) |
| 존재감 | 앱(책)을 열어야 보임 | **책을 닫아도** 캐릭터는 데스크탑에 유지 |
| 멀티 모니터 | 해당 없음 | 책이 있는 디스플레이에 오버레이 배치 |

### 1-2. 변경된 파일 (체크포인트 대비)

```
신규  overlay.html                    오버레이 렌더러 HTML 엔트리
신규  src/overlay/overlay-main.tsx    오버레이 React 진입점
신규  src/overlay/OverlayApp.tsx      데스크탑 캐릭터 렌더러 (핵심)
신규  src/overlay/Overlay.css         오버레이 스타일
수정  electron/main.ts                오버레이 창 생성 + IPC + 마우스통과 + 디스플레이
수정  electron/preload.ts             IPC 브리지 개선(on→unsubscribe 반환)
수정  electron/electron-env.d.ts      타입 안전 IpcRendererBridge
수정  vite.config.ts                  멀티 엔트리(rollupOptions.input)
수정  src/components/YoonahRoom/*     나가기 버튼 + 책↔오버레이 동기화 + 귀가 모션
```

> 코드 규모: **+827 / −94 라인** (11개 파일).

---

## 2. 기술 스택 — 무엇이 바뀌었나

### 2-1. 핵심 결론

> **새로 추가한 npm 의존성은 0개.** `package.json`은 v3.0에서 한 줄도 바뀌지 않았다.
> 데스크탑 메이트 확장은 **기존 Electron이 네이티브로 제공하는 API만으로** 구현했다.

### 2-2. 라이브러리 스택 (v2.0 = v3.0, 변화 없음)

| 역할 | 기술 | 비고 |
|---|---|---|
| 데스크탑 런타임 | Electron 30 | 변화 없음 |
| UI | React 18 + TypeScript 5 | 변화 없음 |
| 번들러 | Vite 5 + vite-plugin-electron | 변화 없음 |
| 상태 관리 | `useState` / `useRef` | 외부 라이브러리 **없음** (유지) |
| 스타일 | 컴포넌트별 `.css` | CSS 라이브러리 **없음** (유지) |
| 영속성 | `localStorage` | 변화 없음 |

### 2-3. 달라진 것 = "라이브러리"가 아니라 "사용한 Electron API / 아키텍처"

| 영역 | v2.0 | v3.0에서 새로 도입 |
|---|---|---|
| 창 | 단일 `BrowserWindow` | 두 번째 `BrowserWindow`(투명/프레임리스/alwaysOnTop/focusable:false/skipTaskbar) |
| 마우스 | DOM 이벤트 | `setIgnoreMouseEvents(true, { forward: true })` — 특정 픽셀만 받고 나머지는 아래 앱으로 통과 |
| 화면 | — | `screen` 모듈: `getDisplayMatching`(멀티모니터), `getCursorScreenPoint` |
| 창 동작 | — | `setVisibleOnAllWorkspaces`, `setAlwaysOnTop('screen-saver')`, `setActivationPolicy('regular')` |
| 투명도 | 창 `transparent` | + `backgroundColor:'#00000000'`(회색 리페인트 방지) |
| 빌드 | 단일 HTML 엔트리 | Vite `rollupOptions.input` 멀티 엔트리 |
| IPC | 1채널 | 8+채널 + preload `on()`이 **구독 해제 함수 반환**(누수 방지), 타입 안전 브리지 |

> **발표 한 줄**: "새 라이브러리 추가 없이, Electron의 `setIgnoreMouseEvents(forward:true)` 한 기능을 축으로 멀티 윈도우 아키텍처를 설계해 데스크탑 메이트를 구현했다."

---

## 3. 프로젝트 구조

### 3-1. 디렉터리

```
ImHereForU/
├── electron/
│   ├── main.ts            메인 프로세스: 두 창 생성, IPC, 마우스통과, 디스플레이
│   ├── preload.ts         contextBridge IPC 브리지 (양 창 공용)
│   └── electron-env.d.ts  렌더러용 window.ipcRenderer 타입
├── index.html             책 창 엔트리
├── overlay.html           오버레이 창 엔트리            ← v3.0
├── src/
│   ├── main.tsx           책 렌더러 진입점
│   ├── App.tsx            BookIntro → YoonahRoom 전환
│   ├── components/
│   │   ├── BookIntro/     책 펼치기 인트로
│   │   ├── YoonahRoom/    메인 씬 + 모든 패널 오케스트레이션 + 나가기/귀가
│   │   ├── Character/      캐릭터(표정 crossfade/blink) · SpeechBubble · HeartEffect
│   │   ├── FocusMode/     포모도로 타이머
│   │   ├── GiftRoom/ Settings/ ModeToggle/
│   ├── overlay/                                        ← v3.0
│   │   ├── overlay-main.tsx   오버레이 진입점
│   │   ├── OverlayApp.tsx     데스크탑 캐릭터(드래그/통과/반응/귀가)
│   │   └── Overlay.css
│   ├── hooks/    useFocusTimer · useIdleBehavior · useTimeBased
│   ├── data/     messages.ts(말풍선 풀) · gifts.ts
│   ├── utils/    storage.ts(localStorage) · timeUtils.ts
│   └── types/    공통 타입(Expression, AppMode …)
└── public/
```

### 3-2. 프로세스 / 윈도우 구조

```
                    Electron Main Process (main.ts)
                    ├─ bookWindow      500×750, 투명, 프레임리스, 이동 가능
                    │    └─ index.html → App → (BookIntro | YoonahRoom)
                    └─ overlayWindow   디스플레이 전체, 투명, alwaysOnTop,
                         │              focusable:false, skipTaskbar, 기본 숨김
                         └─ overlay.html → OverlayApp → Character(재사용)
                    (두 창은 preload IPC 브리지로 통신)
```

---

## 4. 전체적 데이터 흐름

### 4-1. 앱 시작
```
app.whenReady
 → createWindow(book) + createOverlayWindow(hidden)
 → (macOS) setActivationPolicy('regular') + dock.show()   ← Dock 아이콘 보장
 → 책: BookIntro(펼치기 애니메이션) → resize-window IPC → YoonahRoom
```

### 4-2. 책 안 인터랙션 (v2.0 핵심)
```
Character(클릭/더블/롱프레스/드래그)
 → YoonahRoom 핸들러(handleClick 등)
 → setExpression / showBubble / 하트
 → React 리렌더 (표정은 2레이어 crossfade)
타이머/방치/시간대는 hooks(useFocusTimer/useIdleBehavior/useTimeBased)가 트리거
```

### 4-3. 캐릭터 "나오기" (책 → 데스크탑)
```
YoonahRoom 🚪 버튼 → handleStepOut
 → IPC: book:exit-character { isTimerRunning, theme }
 → main:  ① 책이 있는 디스플레이 계산(getDisplayMatching)
          ② overlay.setBounds(디스플레이 전체)
          ③ setIgnoreMouseEvents(true,{forward:true}) 재무장
          ④ overlay.showInactive()  (포커스 뺏지 않음)
          ⑤ overlay:show 전송
          ⑥ book.hide()            (책이 사라짐)
 → OverlayApp: 타이머 상태에 따라 idle/focus 포즈로 pop-in
```

### 4-4. 마우스 통과 (v3.0 핵심 기술)
```
OverlayApp window 'mousemove'
 → 커서가 캐릭터(또는 🏠) 위인지 hit-test (인셋 박스)
 → 진입/이탈 변화 시에만 IPC:
      cursor-on-character  → main: setIgnoreMouseEvents(false)   (클릭 받음)
      cursor-off-character → main: setIgnoreMouseEvents(true,forward) (아래 앱으로 통과)
 → 드래그 중에는 토글을 freeze (마우스 스트림 유지)
```

### 4-5. 동기화 (책 → 오버레이, main 경유 릴레이)
```
YoonahRoom: 타이머/테마 변경 → IPC overlay:set-timer / overlay:set-theme
 → main 릴레이 → overlay.webContents.send
 → OverlayApp: 포즈/말풍선 테마 반영
(표정은 데스크탑에서 로컬 소유 — 책의 임의 표정을 덮어쓰지 않음)
```

### 4-6. "귀가" (데스크탑 → 책)
```
OverlayApp 🏠 버튼 → pop-out 애니메이션(340ms)
 → IPC: overlay:enter-character + setVisible(false)(Character 언마운트→상태 리셋)
 → main: book.show() + book:character-entered 전송 + overlay.hide()
         (책 창이 없으면 createWindow로 재생성)
 → YoonahRoom: isCharacterOut=false → 책 안 캐릭터 pop-in 애니메이션
```

---

## 5. 기술 스택 (현재 최종)

| 계층 | 기술 | 핵심 사용 포인트 |
|---|---|---|
| 런타임 | **Electron 30** | 멀티 `BrowserWindow`, `setIgnoreMouseEvents(forward)`, `screen`, `contextBridge` |
| UI | **React 18 + TypeScript 5** | 함수형 컴포넌트, 커스텀 훅, 엄격 타입 |
| 번들러 | **Vite 5** + `vite-plugin-electron` | 멀티 HTML 엔트리, HMR, main/preload 빌드 |
| 상태 | `useState` / `useRef` | 외부 상태 라이브러리 없음(prop drilling + ref) |
| 통신 | Electron **IPC** (`contextBridge`) | 책↔오버레이 양방향, 통과 토글, 동기화 |
| 스타일 | 순수 **CSS** (컴포넌트별) | CSS 트랜지션/애니메이션, `.theme-dark` 토글, `-webkit-app-region` |
| 영속성 | **localStorage** | 테마/모드/선물 |
| 패키징 | **electron-builder** | macOS `.app` |

---

## 6. 핵심 기능

### 6-1. v2.0 (기반)
- **책 세계관 UI**: 투명·프레임리스 창, 책 펼치기 3D 인트로
- **표정 시스템 12종**: 2레이어 **crossfade**(깜빡임 없는 전환) + 자동 blink
- **감정 인터랙션**: 클릭(말풍선)·더블클릭(하트)·롱프레스(삐짐)·드래그(pendulum)
- **Focus 타이머**: 25분 포모도로, 창 드래그 이동, 완료 시 선물 지급
- **부가 패널**: GiftRoom·Settings·온보딩 캐러셀
- **분위기 로직**: 라이트/다크 테마, 시간대별 인삿말, 15분 방치 감지(sleepy)

### 6-2. v3.0 (데스크탑 메이트 — 이번 확장)
- **투명 오버레이 창**: 화면 전체를 덮되 완전 투명, 캐릭터만 보임
- **per-pixel 마우스 통과**: 캐릭터만 클릭, 나머지는 아래 앱으로 그대로 전달
- **나오기/귀가 연출**: 🚪로 나가면 책이 사라지고 캐릭터 pop-in / 🏠로 부르면 책이 다시 열리며 캐릭터 pop-in
- **드래그 고정**: 원하는 위치로 끌어 고정(따라다니지 않음 — 작업 방해 없음)
- **상태 동기화**: 책의 focus 타이머/테마가 데스크탑 캐릭터에 반영
- **책 닫아도 유지**: 두 창 독립 → 책을 닫아도 캐릭터는 곁에 남음
- **멀티 모니터**: 책이 있는 디스플레이에 오버레이 배치

---

## 7. 발표 포인트 (강조할 것)

1. **하나의 기술 과제로 전체를 설명**
   > "전체 화면 투명 창에서 **캐릭터만 클릭을 받고 나머지는 아래 앱으로 통과**시키기" — 이 한 문장이 창 구조·IPC·이벤트 설계 전반을 결정했다.
   - 해법: `setIgnoreMouseEvents(true, { forward: true })` 기본 + 커서 hit-test → IPC로 동적 토글.

2. **추가 의존성 0 (가벼움/이식성)**
   - 새 라이브러리 없이 기존 React 자산(Character·말풍선·CSS 애니메이션)을 **변경 없이 재사용**.
   - "왜 Tauri/네이티브가 아니라 Electron인가"에 대한 근거(아래 8번)가 곧 설계 정당화.

3. **두 창 분리 아키텍처 결정**
   - 책 창은 기존 크기/이동성 유지, 오버레이는 전체 화면·통과 전용 → 책 UI 재설계 불필요, 생명주기 독립.

4. **감성 컨셉 → 기술로 연결**
   - "장거리 연애 컴패니언"이라는 감성 목표가 "책을 닫아도 곁에 남는다"는 기술 요구로 이어짐.

5. **디테일 품질**
   - 깜빡임 없는 2레이어 crossfade, 드래그 중 마우스 스트림 freeze, 투명 창 회색 플래시 차단(`backgroundColor:'#00000000'`), Dock 활성화 정책 보정 등 "실제로 써보며 잡은" 디테일.

6. **마일스톤 단위 커밋 → 안전한 반복**
   - M1~M4 + 피드백 수정이 각각 커밋 → 언제든 특정 시점으로 롤백(`checkpoint-before-book-fade` 태그 등).

---

## 8. 예상 질문 & 답변

**Q1. 왜 Electron인가? Tauri는?**
A. 핵심 기능인 per-pixel 마우스 통과(`setIgnoreMouseEvents(forward:true)`)를 Electron `BrowserWindow`가 네이티브로 안정 지원한다. Tauri는 동일 기능이 현재 안정 버전 미지원이고 Rust 레이어 수정이 필요하며, 기존 React 자산 이식 비용이 크다.

**Q2. 마우스 통과는 정확히 어떻게 동작하나?**
A. 오버레이 창은 기본적으로 `setIgnoreMouseEvents(true,{forward:true})` — 이벤트를 무시하되 OS로 포워딩해 아래 앱이 정상 동작. 렌더러가 `mousemove`로 커서가 캐릭터 위인지 판단해, 위면 IPC로 `false`(클릭 받음), 벗어나면 다시 `true,forward`로 토글한다.

**Q3. 전체 화면 투명 창인데 성능/부하는?**
A. 평소엔 이벤트를 통과시켜 렌더 부하가 거의 없고, 캐릭터는 2D 이미지 + CSS 트랜지션(GPU 가속)으로만 움직인다. 커서 폴링 같은 상시 루프는 없앴고(드래그 고정 방식), hit-test도 진입/이탈 변화 시에만 IPC를 보낸다.

**Q4. 두 창은 어떻게 통신하나? 렌더러끼리 직접?**
A. 렌더러끼리 직접 통신하지 않고 **메인 프로세스를 경유**한다. preload의 `contextBridge`로 노출한 `ipcRenderer`로 책→main→오버레이 릴레이. `on()`이 구독 해제 함수를 반환하도록 개선해 리스너 누수를 막았다.

**Q5. 상태 관리 라이브러리(Zustand 등) 없이 괜찮나?**
A. 공유 상태가 표정·모드·타이머·테마 정도로 적고 단방향·이벤트성이라 `useState`/`useRef` + IPC로 충분하다. 라이브러리 도입은 번들·학습 비용만 늘린다.

**Q6. 보안(Electron)은?**
A. `contextBridge`로 최소한의 IPC 표면만 노출하고 렌더러에 Node 통합을 열지 않는다(컨텍스트 격리 전제의 preload 브리지 패턴).

**Q7. 표정 전환이 매끄러운 이유는?**
A. 2개 이미지 레이어를 두고 새 표정을 비활성 레이어에 깔아 opacity crossfade → 흰 플래시/깜빡임 없이 전환. idle일 때만 blink 오버레이.

**Q8. 멀티 모니터/풀스크린 앱 위에서도 뜨나?**
A. 나갈 때 책이 있는 디스플레이로 오버레이를 배치(`getDisplayMatching`)하고, `alwaysOnTop('screen-saver')` + `setVisibleOnAllWorkspaces(visibleOnFullScreen)`로 다른 Space/풀스크린 위에도 유지한다. (모니터 간 실시간 이동 추적은 향후 과제.)

**Q9. 왜 캐릭터가 커서를 따라다니지 않나?**
A. 초기엔 마우스 추적을 넣었으나 작업 중 방해가 되어, 사용자 피드백을 받아 "드래그로 고정" 방식으로 변경했다. (실사용 기반 의사결정 사례.)

**Q10. 책을 닫으면 캐릭터는?**
A. 두 창이 독립적이라 책을 닫아도 오버레이 캐릭터는 남는다. 귀가 시 책 창이 없으면 자동 재생성해 "돌아갈 집"을 보장한다.

---

## 9. 데모 시나리오 (발표 시연 순서 제안)

1. 앱 실행 → 책 펼치기 인트로 → 책 안 캐릭터 클릭/더블클릭(하트)/롱프레스
2. Focus 타이머 시작 → 표정이 집중 모드로
3. 🚪 클릭 → **책이 사라지고 캐릭터가 데스크탑으로** (focus 중이면 노트북 포즈)
4. 캐릭터 옆 빈 공간에서 **브라우저/터미널 정상 클릭**(통과) 시연
5. 캐릭터 드래그로 위치 고정, 클릭/더블클릭 반응
6. 🏠 클릭 → **책이 다시 열리며 캐릭터가 쏙 들어가는** 연출

---

## 부록: 커밋 타임라인 (v3.0)

| 커밋 | 내용 |
|---|---|
| `b179b95` | 체크포인트(v3.0 착수 전) |
| `08fa588` | M1 투명 오버레이 + 마우스 통과 |
| `9862ea4` | M2 나가기 트리거 + 책↔오버레이 동기화 |
| `cf39aff` | M3 데스크탑 이동/드래그 (구버전 추적 포함) |
| `73c9162` | M4 전환 연출 + 테마 + 디스플레이 배치 |
| `dcf6cd3` | 피드백: 추적 제거(드래그 고정) + 인터랙션 복원 + 회색 플래시 수정 |
| `89345a0` | 폰트 통일 + 나갈 때 책 숨김 + 귀가 모션 |
| `690e198` | 말풍선이 캐릭터를 따라오지 않던 버그 수정 |
| `2000b70` → `0d56e54` | 나갈 때 포즈를 타이머 상태에 맞게 보정 + Dock 아이콘 보장 |
