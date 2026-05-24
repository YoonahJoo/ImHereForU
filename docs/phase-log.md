# Phase Log

---

## Phase — 방치 감지 (Idle Behavior) 완성 (2026-05-24)

### 1. 이번 Phase에서 구현한 기능

- **방치 이벤트 2단계 시퀀스 완성**
  - 15분 경과 → `sleepy` 표정 + 랜덤 메시지 출력
  - 3초 후 `"click me if you wanna wake me up!"` 출력
  - 캐릭터 클릭 → `idle` 복귀 + `"hehe!"` 출력
- **방치 이벤트 무한 반복 사이클 구현**
  - 클릭으로 깨어난 시점부터 15분 카운트 재시작
  - 이후 무인터랙션 15분 경과 시 재발동 — 무한 반복
- **[버그 수정] Focus 타이머 실행 중 idle 타이머 영구 소멸 문제 해결**
  - 기존: idle 타이머가 `timerStatus === 'running'` 중 만료되면 early return 후 타이머 사망 → 이후 idle 이벤트 미발생
  - 수정: `timerStatus === 'running'` 진입 시 `pauseIdle()`로 타이머를 명시적 정지, 타이머가 종료/일시정지/리셋될 때 `resetIdle()`로 재시작
- **IDLE_TIMEOUT 10초 → 15분 변경**

---

### 2. 생성/수정한 주요 파일

| 파일 | 변경 내용 |
|---|---|
| `src/hooks/useIdleBehavior.ts` | `pauseIdle()` 추가, `onIdleRef` 업데이트를 useEffect → 렌더 중 직접 할당으로 변경, `timerRef.current = null` 명시적 처리 추가, `IDLE_TIMEOUT` 15분으로 변경 |
| `src/components/YoonahRoom/YoonahRoom.tsx` | idle 콜백에서 `timerStatus === 'running'` early return 제거, `timerStatus` 감지 `useEffect` 추가 (running → pauseIdle, 그 외 → resetIdle) |
| `docs/MVP.md` | Section 4 sleepy 조건, Section 8 전체 재작성 |

---

### 3. 핵심 state / ref

| 이름 | 위치 | 설명 |
|---|---|---|
| `timerRef` | `useIdleBehavior` | 방치 타이머 ID. 만료 후 `null` 처리됨 |
| `idlePromptTimer` | `YoonahRoom` | 3초 후 두 번째 메시지 출력용 타이머 |
| `expression === 'sleepy'` | `YoonahRoom` | 방치 상태 여부 판단 기준 |

---

### 4. 핵심 데이터 흐름

**[방치 이벤트 흐름]**
```
timerStatus !== 'running' 상태에서 15분 경과
  → setExpression('sleepy') + showBubble(랜덤 idleMessage)
  → 3초 후 idlePromptTimer → showBubble("click me if you wanna wake me up!")

캐릭터 클릭 (expression === 'sleepy')
  → clearTimeout(idlePromptTimer)
  → setExpression('idle') + showBubble("hehe!")
  → resetIdle() → 15분 카운트 재시작
```

**[Focus 타이머 연동 흐름]**
```
timerStatus 변화 감지 useEffect
  → 'running' → pauseIdle()   (타이머 정지)
  → 그 외     → resetIdle()   (타이머 재시작)
```

---

### 5. 다음 Phase 전에 조심할 점

- `pauseIdle()` / `resetIdle()`은 `timerStatus` useEffect에서 중앙 관리됨.
  Focus 타이머 관련 코드(`start`, `pause`, `reset`, `handleFocusComplete`) 수정 시
  이 useEffect가 여전히 올바르게 트리거되는지 확인 필요.

- idle 콜백 내부에 `timerStatus === 'running'` 가드가 없음 (의도적 제거).
  타이머가 running 중에는 `pauseIdle()`로 애초에 발동을 막으므로, 콜백 내 가드 불필요.
  만약 추후 콜백 내 guard를 추가할 경우 `resetIdle()` 호출을 함께 넣어야 타이머가 살아남음.

- `idlePromptTimer`는 sleepy 진입 시마다 새로 세팅되고, 클릭 깨우기와 idle 진입 두 경로에서 `clearTimeout`됨.
  새로운 인터랙션 핸들러 추가 시 `idlePromptTimer` 클린업 여부 확인 필요.

---

## Phase — Focus Mode 인터랙션 버그 수정 (2026-05-20)

### 1. 이번 Phase에서 구현한 기능

- **새 Expression 2종 추가** — `curious (🥸)`, `cheering (💗)`
- **[Issue 1] 타이머 실행 중 Daily 탭 전환 차단**
  - `🥸` 표정 + 순차 메시지 2개 표시 후 `👩‍💻` 복귀
  - 모드 전환 자체를 막음 (타이머 일시정지 시에는 정상 전환 가능)
- **[Issue 2] 타이머 실행 중 더블클릭 반응 변경**
  - 기존 `🥰` + 하트 + `😚` 복귀 → `💗` + cheering 메시지 + `👩‍💻` 복귀로 교체
- **[버그 수정] cheering 연속 클릭 시 복귀 타이머 무한 리셋 문제 해결**
  - 마지막 클릭 시점 기준 2초 후 `👩‍💻` 복귀로 동작하도록 수정

---

### 2. 생성/수정한 주요 파일

| 파일 | 변경 내용 |
|---|---|
| `src/types/index.ts` | `Expression` 유니온에 `'curious'`, `'cheering'` 추가 |
| `src/components/Character/Character.tsx` | `EMOJI` 레코드에 `curious: '🥸'`, `cheering: '💗'` 추가 |
| `src/data/messages.ts` | `focusCuriousMessages` (2개), `focusCheeringMessages` (1개) 배열 추가 |
| `src/components/YoonahRoom/YoonahRoom.tsx` | 아래 상세 참고 |

**YoonahRoom.tsx 변경 상세:**
- `modeBlockTimer` ref 추가 — Daily 탭 차단 시퀀스용
- `cheeringReturnTimer` ref 추가 — cheering 복귀 타이머 전용
- `handleModeChange` 함수 신규 추가 — `<ModeToggle>`에 연결
- `handleDoubleClick` 수정 — `timerStatus === 'running'` 분기 추가
- `handleClick` 수정 — cheering 상태 단일 클릭 시 복귀 타이머 리셋 추가

---

### 3. 핵심 state

| state | 위치 | 설명 |
|---|---|---|
| `expression` | `YoonahRoom` | 캐릭터 현재 표정. `'curious'`, `'cheering'` 추가됨 |
| `timerStatus` | `useFocusTimer` hook | `'idle' \| 'running' \| 'completed' \| 'cancelled'` |

---

### 4. 핵심 데이터 흐름

**[Daily 탭 차단 흐름]**
```
ModeToggle 클릭
  → handleModeChange(newMode)
    → timerStatus === 'running' && newMode === 'daily' ?
        → setExpression('curious') + showBubble(msg1)
        → 2500ms 후 showBubble(msg2)
        → 2000ms 후 setExpression('focus')
      : onModeChange(newMode) (정상 전환)
```

**[cheering 흐름]**
```
더블클릭 → handleDoubleClick()
  → timerStatus === 'running' ?
      → setExpression('cheering') + showBubble(cheeringMsg)
      → cheeringReturnTimer: 2000ms 후 setExpression('focus')
    : 기존 smile + 하트 + idle 복귀

단일 클릭 중 cheering 상태 → handleClick()
  → expression === 'cheering' && timerStatus === 'running' ?
      → cheeringReturnTimer 리셋 (마지막 클릭 기준 2초 후 focus 복귀)
```

---

### 5. 다음 Phase 전에 조심할 점

- `exprTimer`와 `cheeringReturnTimer`는 역할이 분리되어 있음.
  `cheering` 복귀 로직은 반드시 `cheeringReturnTimer`만 사용해야 함.
  `exprTimer`를 건드리면 cheering 연속 클릭 버그가 재발함.

- `modeBlockTimer`는 중첩 setTimeout 구조 (2500ms → 2000ms 순차).
  해당 로직 수정 시 두 타이머 모두 클린업되는지 확인 필요.

- `handleModeChange`는 `timerStatus === 'running'`일 때만 차단함.
  `'cancelled'`(일시정지) 상태에서는 정상 전환되어야 하며, 현재 그렇게 동작함.

- Focus 타이머 완료(`'completed'`) 시 표정 처리는 `handleFocusComplete`에서 별도 관리됨.
  `useEffect`의 `timerStatus` 동기화 로직과 충돌하지 않도록 주의.
