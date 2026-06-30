# 기획서 — 책 밖(데스크탑)에서도 캐릭터 방치(idle) 연출이 보이게 하기

**작성일**: 2026-06-30
**상태**: ✅ 구현 완료 (2026-06-30) — `OverlayApp.tsx`에 방치 훅 추가, `YoonahRoom.tsx` 정지 조건에 `isCharacterOut` 추가. tsc·lint 통과(신규 에러 0).
**관련 커밋**: `363b9f0 fix(timer): 캐릭터가 책 밖으로 나가도 포커스 타이머가 정상 속도로 흐르게`
**관련 기획서**: [`docs/focus-timer-throttle-fix.md`](./focus-timer-throttle-fix.md)
**증상**: 캐릭터를 데스크탑으로 꺼낸 뒤 10분간 안 건드려도 데스크탑 캐릭터는 졸지(sleepy) 않는다. 방치 연출이 화면에 **안 보인다**.

> **검증 메모 (2026-06-30)**: 현재 코드 기준 줄 번호 확인 완료. `useIdleBehavior`는 [`YoonahRoom.tsx:267`](../src/components/YoonahRoom/YoonahRoom.tsx)에서만 사용, 방치 일시정지는 [`YoonahRoom.tsx:281-287`](../src/components/YoonahRoom/YoonahRoom.tsx)에서 `timerStatus === 'running'`만 보고 `isCharacterOut`은 보지 않음. 오버레이([`OverlayApp.tsx`](../src/overlay/OverlayApp.tsx))에는 방치 타이머가 **전혀 없음**. `sleepy` 표정은 공유 `Character`가 렌더 가능([`Character.tsx:23,258`](../src/components/Character/Character.tsx)).

---

## 1. 한 줄 요약

> 방치 타이머(`useIdleBehavior`)는 **책 창에만** 살아있고, 발동 시 **숨겨진 책 캐릭터**만 졸게 만든다.
> 정작 사용자가 보는 **오버레이(데스크탑) 캐릭터**에는 방치 로직이 없어서, 책 밖에 나가 있을 땐 방치 연출이 보이지 않는다.

**비유**: 알람시계(방치 타이머)가 "책"이라는 방 안에만 있다. 캐릭터를 데스크탑으로 산책 보낸 뒤 그 방의 **불을 끄면(`win.hide()`)**, 알람은 그 어두운 빈 방에서 혼자 울린다. 밖에 나와 있는 캐릭터(와 그걸 보는 사용자)는 알람 소리를 못 듣는다.

---

## 2. 현재 동작 분석 (코드 근거)

### 2-1. 방치 타이머는 "책 창"에만 있다

[`src/hooks/useIdleBehavior.ts:3`](../src/hooks/useIdleBehavior.ts) — 10분 무반응이면 `onIdle()` 발동

```ts
const IDLE_TIMEOUT = 10 * 60 * 1000 // 10분
```

이 훅은 [`YoonahRoom.tsx:267-277`](../src/components/YoonahRoom/YoonahRoom.tsx)에서 **딱 한 곳**만 쓴다. 발동 콜백은 책 캐릭터를 조작한다:

```ts
const { resetIdle, pauseIdle } = useIdleBehavior(() => {
  setExpression('sleepy')                       // ← 책 캐릭터를 졸게
  showBubble(getRandomMessage(idleMessages).text)
  idlePromptTimer.current = setTimeout(() => {
    showBubble(idleWakePromptMessage)           // 3초 뒤 "click me if you wanna wake me up"
  }, 3000)
})
```

오버레이([`OverlayApp.tsx`](../src/overlay/OverlayApp.tsx))에는 `useIdleBehavior`가 **없다**. 여기서 `idle`은 그냥 기본 표정 이름일 뿐, 방치 감지 타이머가 아니다.

### 2-2. 책 밖으로 나가면 책 창을 숨긴다

[`electron/main.ts:126`](../electron/main.ts) — `book:exit-character` 핸들러 마지막 줄

```ts
win?.hide() // 캐릭터가 데스크탑에 나가는 순간 책 창이 숨겨진다
```

책 창은 **숨겨질 뿐 살아있어서**(언마운트 아님) `useIdleBehavior`의 `setTimeout`은 계속 돈다. 직전 커밋 `363b9f0`이 책 창에 `backgroundThrottling: false`를 넣은 덕분에 **숨겨진 상태에서도 정확히 10분에 발동**한다. → **타이밍은 멀쩡한데, 발동 효과가 안 보이는 캐릭터에 적용되는 게 문제.**

### 2-3. 방치 일시정지 조건이 `isCharacterOut`을 빠뜨렸다

[`YoonahRoom.tsx:281-287`](../src/components/YoonahRoom/YoonahRoom.tsx)

```ts
useEffect(() => {
  if (timerStatus === 'running') {
    pauseIdle()      // 포커스 중엔 방치 정지
  } else {
    resetIdle()      // 그 외엔 방치 재시작
  }
}, [timerStatus, pauseIdle, resetIdle])
```

→ `isCharacterOut`은 고려하지 않는다. 그래서 **"책 밖 + 포커스 미실행"** 구간에서 책 창의 방치 타이머가 살아있고, 보이지 않는 책 캐릭터에 졸음 연출이 적용된다.

### 2-4. (숨은 버그) 방치 타이머가 "엉뚱한 곳의 무반응"을 센다

방치의 본뜻은 "**사용자가 캐릭터를 10분 동안 안 건드렸다**"이다. 그런데 책 밖에 있을 땐 사용자가 만지는 대상은 **오버레이 캐릭터**다([`OverlayApp.tsx:279` handleClick 등](../src/overlay/OverlayApp.tsx)). 이 클릭들은 **책 창에 전달되지 않아** 책의 방치 타이머를 리셋하지 못한다.

→ 즉, 사용자가 데스크탑 캐릭터를 열심히 쓰다듬고 있어도 책의 방치 타이머는 무심히 카운트다운한다. **"무반응 감지"가 정작 반응이 일어나는 창을 안 보고 있다.**

### 2-5. (부수 효과) 귀가 시 졸린 채로 등장

책 밖에서 방치가 발동해 숨은 책 캐릭터가 `sleepy`가 된 뒤 귀가하면([`book:character-entered`, YoonahRoom.tsx:353-366](../src/components/YoonahRoom/YoonahRoom.tsx)) `isCharacterOut=false`로 책 캐릭터를 다시 보여주는데, 이때 **이미 sleepy 상태**라 들어오자마자 졸고 있을 수 있다(축하 연출이 없는 경우). 귀가 시 표정/방치 리셋이 없다.

---

## 3. 설계 방향 — 두 가지 접근

| | A안: 책이 주인, 이벤트만 전파 | B안: 오버레이가 자기 방치를 소유 ✅ |
|---|---|---|
| 방치 타이머 위치 | 책 창 1개(기존 유지) | 책 안=책 창 / 책 밖=오버레이 창 |
| 책 밖에서 발동 시 | 책→main→오버레이 IPC로 "졸아라" 전파 | 오버레이가 자체 타이머로 직접 졸음 |
| 오버레이 클릭으로 깨우기 | 오버레이→책 IPC로 `resetIdle` 역전파 필요 | 오버레이가 자기 타이머 리셋(IPC 불필요) |
| 2-4 버그(엉뚱한 무반응) | 오버레이 클릭마다 책으로 리셋 IPC 보내야 해결 | 자동 해결(반응이 일어나는 창이 직접 셈) |
| 코드 구조 | IPC 왕복 다수, 두 창 상태 결합 | 기존 패턴과 일치, 창별 독립 |
| 기존 주석과의 정합성 | — | [`OverlayApp.tsx:45-47`](../src/overlay/OverlayApp.tsx) "표정/인터랙션은 오버레이가 로컬 소유" 원칙과 맞음 |

> **결론: B안 권장.** A안은 말 그대로 "상태 전파"지만, 깨우기·무반응 카운트까지 챙기려면 **IPC를 양방향으로 더 깔아야** 한다. B안은 이미 있는 `useIdleBehavior` 훅을 오버레이에서 한 번 더 쓰는 것으로, **IPC 추가 없이** 더 정확해진다. (오버레이가 자기 표정과 클릭을 이미 로컬로 소유하는 현재 구조와도 일치.)

---

## 4. 권장안(B) 상세 설계

핵심 아이디어: **방치 감지는 "지금 캐릭터가 사는 창"이 한다.** 책 안이면 책이, 책 밖이면 오버레이가.

### 4-1. 책 창: 나가 있는 동안 방치 정지, 귀가 시 재개

[`YoonahRoom.tsx:281-287`](../src/components/YoonahRoom/YoonahRoom.tsx)의 조건에 `isCharacterOut` 추가:

```ts
useEffect(() => {
  if (timerStatus === 'running' || isCharacterOut) {
    pauseIdle()    // 포커스 중이거나 '책 밖'이면 책의 방치는 멈춘다
  } else {
    resetIdle()    // 책 안 + 포커스 미실행일 때만 책이 방치를 센다
  }
}, [timerStatus, isCharacterOut, pauseIdle, resetIdle])
```

- 나갈 때: `isCharacterOut`이 true가 되며 책 방치 정지.
- 귀가 시: `isCharacterOut`이 false로 돌아오며 `resetIdle()`로 깨끗하게 재시작 → **2-5 부수 효과도 함께 해결**(졸린 채 등장 방지).

### 4-2. 오버레이 창: 자체 방치 타이머 추가

[`OverlayApp.tsx`](../src/overlay/OverlayApp.tsx)에서 기존 훅을 재사용한다(신규 로직 X, 메시지도 기존 것 재사용):

```ts
import { useIdleBehavior } from '../hooks/useIdleBehavior'
import { idleMessages, idleWakePromptMessage, idleWakeResponseMessage, getRandomMessage } from '../data/messages'

const { resetIdle, pauseIdle } = useIdleBehavior(() => {
  setExpression('sleepy')
  showBubble(getRandomMessage(idleMessages).text)
  // 3초 뒤 깨우기 안내 (book과 동일한 연출)
  idlePromptTimer.current = setTimeout(() => showBubble(idleWakePromptMessage), 3000)
})
```

**방치를 멈춰야 하는 구간**(아래 중 하나라도면 `pauseIdle`, 모두 아니면 `resetIdle`):

```ts
useEffect(() => {
  const busy = !visible            // 책 안으로 들어가 숨은 상태
    || isTimerRunning              // 포커스 세션 진행 중
    || celebratingRef.current      // 완료 축하 연출 중
    || confirmFlowRef.current      // "Want me to go back?" 확인 플로우 중
  if (busy) pauseIdle()
  else resetIdle()
}, [visible, isTimerRunning, pauseIdle, resetIdle])
// celebrating/confirm은 ref라 의존성에 못 넣음 → 해당 플로우 종료 지점에서 resetIdle() 직접 호출
```

**모든 인터랙션에서 방치 리셋** — 책의 핸들러와 동일하게 [`handleClick`/`handleDoubleClick`/`handleLongPress`/`handleRightClick`](../src/overlay/OverlayApp.tsx#L279)·드래그 시작 지점에 `resetIdle()` 한 줄씩 추가.

**sleepy 상태에서 클릭하면 깨우기** — 책의 [`handleClick` sleepy 분기(YoonahRoom.tsx:383-391)](../src/components/YoonahRoom/YoonahRoom.tsx)와 동일하게:

```ts
function handleClick() {
  if (expression === 'sleepy') {
    if (idlePromptTimer.current) clearTimeout(idlePromptTimer.current)
    setExpression('smile')
    showBubble(idleWakeResponseMessage)   // "Oh you didn't forget me! I missed u"
    revertSoon(3000)
    resetIdle()                            // 방치 사이클 재시작
    return
  }
  // ...기존 일반 클릭 로직...
}
```

### 4-3. 타이머 상태 변할 때 정리

- 포커스가 **시작**되면 → `pauseIdle`(4-2 effect가 처리).
- 포커스가 **끝나** 축하 연출이 돌면 → 축하 종료 후 `resetIdle`.
- 귀가(`goHome`)로 `visible=false`가 되면 → `pauseIdle`(4-2 effect가 처리) + 언마운트 클린업([`OverlayApp.tsx:269-276`](../src/overlay/OverlayApp.tsx))에 `idlePromptTimer` 정리 추가.

---

## 5. 변경 파일 요약

| 우선순위 | 작업 | 파일 | 효과 |
|---|---|---|---|
| 1순위 (필수) | `useIdleBehavior` 추가 + 인터랙션마다 `resetIdle` + sleepy 깨우기 분기 | `src/overlay/OverlayApp.tsx` | 책 밖 방치 연출이 **보이게** 됨 |
| 1순위 (필수) | 방치 정지 조건에 `isCharacterOut` 추가 | `src/components/YoonahRoom/YoonahRoom.tsx` | 책 밖 동안 책 방치 정지 + 귀가 시 깔끔 재시작(2-5 해결) |
| 2순위 (권장) | `idlePromptTimer` 언마운트 클린업 | `OverlayApp.tsx` | 타이머 누수 방지 |
| 참고 | 신규 IPC 채널 **불필요** | — | 오버레이가 자기 방치를 로컬로 소유하므로 |

> **메시지·표정 에셋은 추가 작업 없음**: `idleMessages`/`idleWakePromptMessage`/`idleWakeResponseMessage`는 [`messages.ts:75,76,82-85`](../src/data/messages.ts)에 이미 있고, `sleepy` 표정도 공유 `Character`가 렌더한다([`Character.tsx:23,258`](../src/components/Character/Character.tsx)).

---

## 6. 엣지 케이스 점검

1. **포커스 도중 나갔다가 도중에 귀가** — 책 밖에서도 `isTimerRunning`이면 오버레이 방치는 정지(4-2). 책도 정지(4-1). 양쪽 모두 안 졸음. ✅
2. **방치로 졸던 중에 우클릭("go back") 또는 더블클릭** — `confirmFlowRef`/인터랙션이 `resetIdle`을 부르므로 졸음 해제 후 정상 플로우. 단, sleepy 상태 우클릭이 깨우기보다 우선인지 정책 결정 필요(권장: 우클릭=귀가 우선, 좌클릭=깨우기).
3. **나가 있는 동안 포커스가 끝나 축하 연출** — `celebratingRef`로 방치 정지(4-2). 축하 끝나면 `resetIdle`. ✅
4. **책으로 귀가 직후** — 책의 4-1 effect가 `isCharacterOut=false`를 보고 `resetIdle` → 졸린 채 등장 방지. ✅
5. **'책 안'과 '책 밖' 양쪽 방치가 동시에 돌까?** — 안 된다. 책은 `isCharacterOut`일 때 정지(4-1), 오버레이는 `!visible`일 때 정지(4-2). 항상 **한 창만** 방치를 센다. ✅

---

## 7. 테스트 절차 (수동, 단축 검증 권장)

> 임시로 `IDLE_TIMEOUT`을 30초로 낮춰 두면 10분 기다릴 필요 없다. (검증 후 원복)

1. **A. 책 밖 방치 발동**: 캐릭터를 데스크탑으로 → 아무것도 안 누르고 대기 → 30초 후 **오버레이 캐릭터가 sleepy + 졸음 말풍선**이 뜨는지. (기대: 뜬다)
2. **B. 책 밖 깨우기**: A 상태에서 데스크탑 캐릭터 클릭 → "Oh you didn't forget me!" 뜨고 표정 복귀 + 방치 재시작되는지.
3. **C. 인터랙션 리셋**: 데스크탑에서 25초마다 클릭 반복 → 졸지 않는지(리셋 동작 확인).
4. **D. 포커스 중 안 졸기**: 포커스 시작 후 데스크탑으로 → 대기 → 졸지 않는지.
5. **E. 귀가 직후 멀쩡**: 책 밖에서 졸게 만든 뒤 귀가 → 책 캐릭터가 **졸린 채 등장하지 않고** 정상(idle)인지(2-5 회귀 확인).
6. **F. 동시 방치 없음**: 귀가 후 책 안에서도 방치가 정상 1회만 도는지(중복 발동 없음).

---

## 8. 면접에서 써먹을 포인트

- **"상태가 사는 곳과 그 상태가 반응해야 할 입력이 다른 창에 있으면 버그가 난다"** — 방치(무반응) 타이머는 책 창에 있는데, 정작 사용자의 반응(클릭)은 오버레이 창에서 일어났다. 멀티 윈도우/멀티 컨텍스트 설계에서 "**관심사를, 그 관심사의 입력이 발생하는 곳에 둬라**"는 교훈.
- **"이벤트를 전파(A안)할까, 책임을 이전(B안)할까"** — 상태를 한 곳에 두고 IPC로 쏘는 방식은 직관적이지만, 깨우기·리셋까지 챙기면 양방향 결합이 늘어난다. "보이는 창이 자기 상태를 소유"하게 책임을 옮기면 IPC 없이 더 단순·정확해진다. SSOT(single source of truth)를 **무조건 한 곳**으로 모으는 게 늘 정답은 아니라는 사례.
- **훅 재사용으로 중복 없이 일관성 확보** — `useIdleBehavior`를 두 창에서 그대로 재사용해, 같은 10분 규칙·같은 메시지·같은 깨우기 UX를 한 벌의 로직으로 유지한다(DRY).
