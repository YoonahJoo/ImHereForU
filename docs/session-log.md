# Session Log — 2026-05-24

## 개요

방치 감지(Idle Behavior) 기능의 시퀀스 완성 및 반복 사이클 버그 수정 세션.
Focus 타이머와 idle 타이머 간의 연동 문제를 근본적으로 해결하고,
IDLE_TIMEOUT을 15분으로 변경 후 MVP.md 동기화.

---

## 요청 및 수행 작업 요약

### Step 1 — 현황 파악 및 기획서 작성

**요청:** 방치 감지 기능 구현 상태 파악 + 수정 기획서 작성 (코드 수정 없음)

**파악 결과:**
- 10초 타이머, sleepy 전환, 랜덤 메시지, "click me..." 메시지, 클릭 깨우기, "hehe!" 메시지 — 모두 구현 완료
- 방치 이벤트가 1회 발생 후 반복되지 않는 버그 존재

**기획서 구성 (Section 1~6):**
- Section 1: useIdleBehavior 훅 재검토
- Section 2~4: 이미 구현 완료된 시퀀스
- Section 5: 반복 사이클 버그 수정 (핵심)
- Section 6: 엣지 케이스 처리

---

### Step 2 — 1차 수정 시도 (`useIdleBehavior.ts`)

**시도한 수정:**
- `onIdleRef` 업데이트를 `useEffect` (비동기) → 렌더 중 직접 할당 (동기)으로 변경
- 타이머 만료 후 `timerRef.current = null` 명시적 처리 추가

**결과:** 여전히 Focus Mode → 타이머 시작 → 일시정지 → idle 대기 시나리오에서 재발동 안 됨

---

### Step 3 — 버그 원인 재분석

**실제 버그 원인 확정:**

idle 타이머가 `timerStatus === 'running'` 도중 만료되면 콜백 내 early return 후 아무도 `resetIdle()`을 호출하지 않아 타이머가 영구 소멸하는 것이 근본 원인.

```
클릭 → resetIdle() → 10초 타이머 시작
  → (10초 이내) Focus 타이머 시작
  → (10초 경과) idle 타이머 만료 → if (timerStatus === 'running') return
  → timerRef.current = null, 타이머 사망
  → 이후 어떤 상황에서도 idle 이벤트 미발생
```

1차 수정(onIdleRef 동기화 방식 변경)은 이 문제를 건드리지 않았음.

---

### Step 4 — 2차 수정 (`useIdleBehavior.ts` + `YoonahRoom.tsx`)

**수정 1 — `useIdleBehavior.ts`에 `pauseIdle()` 추가:**
- Focus 타이머 실행 구간에 idle 타이머를 명시적으로 정지시키는 함수
- `clearTimeout` + `timerRef.current = null`

**수정 2 — `YoonahRoom.tsx`에 `timerStatus` 감지 useEffect 추가:**
- `timerStatus === 'running'` → `pauseIdle()` : 타이머 정지
- `timerStatus !== 'running'` → `resetIdle()` : 타이머 재시작
- idle 콜백 내 `if (timerStatus === 'running') return` 가드 제거 (불필요해짐)

**결과:** 모든 시나리오에서 반복 사이클 정상 동작 확인

---

### Step 5 — IDLE_TIMEOUT 15분으로 변경

**요청:** 방치 감지 시간 10초 → 15분

**수정:**
- `src/hooks/useIdleBehavior.ts` — `IDLE_TIMEOUT = 10_000` → `15 * 60 * 1000`

---

### Step 6 — MVP.md 동기화

**수정 항목:**
- Section 4 표정 테이블: `sleepy` 조건 "15분 이상"으로 수정
- Section 8 전체 재작성:
  - 8-1. 발동 조건 (15분, Focus running 중 일시정지 명시)
  - 8-2. 방치 이벤트 시퀀스 (2단계 메시지 → 클릭 깨우기)
  - 8-3. 반복 사이클 (ASCII 다이어그램 포함)

---

## 수정한 파일 목록

| 파일 | 변경 내용 |
|---|---|
| `src/hooks/useIdleBehavior.ts` | `pauseIdle()` 추가, `onIdleRef` 동기 업데이트, `timerRef null` 처리, `IDLE_TIMEOUT` 15분 |
| `src/components/YoonahRoom/YoonahRoom.tsx` | idle 콜백 가드 제거, `timerStatus` 감지 useEffect 추가 |
| `docs/MVP.md` | Section 4, Section 8 업데이트 |
| `docs/phase-log.md` | 신규 Phase 항목 추가 |

---

## 현재 상태

- 방치 감지 전체 플로우 정상 동작
- Focus 타이머와 idle 타이머 연동 정상
- 반복 사이클 무한 동작 확인

## 다음 작업 계획

- 미정 (사용자 요청 대기)

---

# Session Log — 2026-05-20

## 개요

Focus Mode 타이머 실행 중 캐릭터 인터랙션 관련 버그 2건을 수정하고,
새로운 Expression 타입 2종과 메시지 데이터를 추가한 세션.

---

## 요청 및 수행 작업 요약

### Step 1 — 새 Expression 타입 및 이모지 등록

**요청:** `curious`, `cheering` 두 Expression을 타입과 EMOJI 레코드에 추가

**수행:**
- `src/types/index.ts` — `Expression` 유니온에 `'curious'`, `'cheering'` 추가
- `src/components/Character/Character.tsx` — `EMOJI` 레코드에 `curious: '🥸'`, `cheering: '💗'` 추가

---

### Step 2 — 새 메시지 데이터 추가

**요청:** curious / cheering 반응용 메시지 배열 추가

**수행:**
- `src/data/messages.ts` 하단에 두 배열 추가
  - `focusCuriousMessages` — Daily 탭 전환 차단 시 표시할 메시지 2개
  - `focusCheeringMessages` — 타이머 중 더블클릭 시 표시할 메시지 1개

---

### Step 3 — handleDoubleClick 수정 (Issue 2 해결)

**버그:** 타이머 실행 중 더블클릭 시 `smile` + 하트 + `idle` 복귀로 동작

**수정:**
- `src/components/YoonahRoom/YoonahRoom.tsx`의 `handleDoubleClick`에서
  `timerStatus === 'running'` 분기를 추가
- running 상태면 `cheering` 표정 + cheering 메시지 → 2.5초 후 `focus` 복귀
- running 상태가 아니면 기존 smile + 하트 + idle 복귀 동작 유지

---

### Step 4 — handleModeChange 추가 (Issue 1 해결)

**버그:** 타이머 실행 중 Daily 탭 클릭 시 바로 모드 전환됨

**수정:**
- `src/components/YoonahRoom/YoonahRoom.tsx`에 `handleModeChange` 함수 신규 추가
- `timerStatus === 'running'` + `newMode === 'daily'`일 경우 모드 전환 차단
- `curious` 표정 + 첫 번째 메시지 → 2500ms 후 두 번째 메시지 → 2000ms 후 `focus` 복귀
- `modeBlockTimer` ref 신규 추가 및 언마운트 클린업
- `<ModeToggle onModeChange={handleModeChange}>` 로 교체

---

### Step 5 — cheering 연속 클릭 버그 수정

**버그:** `💗` 상태에서 단일 클릭 시 `handleClick`이 `exprTimer`를 clear하여
복귀 타이머가 날아가고, 영구적으로 `💗`에 머무름

**원인:** cheering 복귀 타이머가 `exprTimer`를 공유하고 있었고,
`handleClick` 최상단의 `clearTimeout(exprTimer.current)`에 의해 매번 초기화됨

**수정:**
- `cheeringReturnTimer` ref 신규 추가 및 언마운트 클린업
- `handleDoubleClick`: cheering 복귀 타이머를 `exprTimer` → `cheeringReturnTimer` (2000ms)로 교체
- `handleClick`: `expression === 'cheering'` + `timerStatus === 'running'` 조건에서
  `cheeringReturnTimer`를 리셋 — 마지막 클릭 기준 2초 후 `focus` 복귀

---

## 수정한 파일 목록

| 파일 | 변경 내용 |
|---|---|
| `src/types/index.ts` | `Expression`에 `'curious'`, `'cheering'` 추가 |
| `src/components/Character/Character.tsx` | `EMOJI` 레코드에 `curious`, `cheering` 추가 |
| `src/data/messages.ts` | `focusCuriousMessages`, `focusCheeringMessages` 추가 |
| `src/components/YoonahRoom/YoonahRoom.tsx` | `handleModeChange`, `handleDoubleClick`, `handleClick` 수정, ref 2개 추가 |
| `CLAUDE.md` | 프로젝트 루트에 신규 생성 — 코드 수정 전 승인 필수, 미요청 시 코드 수정 금지 규칙 설정 |

---

## 현재 상태

- 모든 버그 수정 완료 및 테스트 통과
- 기존 동작(daily 더블클릭, 타이머 정지 상태 더블클릭 등) 회귀 없음

## 다음 작업 계획

- 미정 (사용자 요청 대기)
