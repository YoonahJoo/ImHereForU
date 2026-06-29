# 기획서 — 캐릭터를 책 밖으로 꺼내면 포커스 타이머가 느려지는 버그 수정

**작성일**: 2026-06-26
**재검증**: 2026-06-29 — 현재 코드 기준 줄 번호·원인 재확인 완료 (아래 표기 줄 번호 모두 일치)
**상태**: 분석 완료 / 수정 승인 대기
**관련 커밋**: `fd7636e fix(overlay): disable backgroundThrottling so JS timers run unfocused`
**증상 보고**: 3:33 기준 23:17 남음 → 실제 10분 후(3:43) 확인 시 21:00 남음 (10분 동안 약 2:17만 감소 ≈ **4배 느림**)

> **재검증 메모 (2026-06-29)**: `useFocusTimer.ts`의 `setInterval`은 현재 **39행**, `win?.hide()`는 `main.ts` **122행**, 책 창 `webPreferences`는 **38–41행**(여전히 `backgroundThrottling` 미설정), 오버레이의 `backgroundThrottling: false`는 **80행**으로 확인됨. 원인 진단은 변동 없음.

---

## 1. 한 줄 요약

> 포커스 타이머는 **책 창** 안에서만 돌아가는데, 캐릭터를 꺼낼 때 그 **책 창을 숨겨버려서**(`win.hide()`),
> 브라우저(Chromium)가 "안 보이는 창"의 타이머를 강제로 느리게 돌리는 **백그라운드 스로틀링(background throttling)** 에 걸린 것이다.

**비유**: 타이머 시계는 "책"이라는 방 안에 걸려 있다. 캐릭터를 데스크탑으로 산책 보내면서 그 방의 **불을 꺼버린다**. 운영체제는 "아무도 안 보는 방"이라고 판단해 그 방 시계의 초침을 **천천히 흔들리게** 만든다. 그래서 밖에 나가 있는 동안 시계가 느리게 간다.

---

## 2. 원인 분석 (코드 근거)

### 2-1. 타이머는 "책 창"에서만 돈다

[`src/hooks/useFocusTimer.ts:34`](../src/hooks/useFocusTimer.ts)

```ts
intervalRef.current = setInterval(() => {
  setRemainingSeconds(prev => prev <= 1 ? 0 : prev - 1)
}, 1000)
```

- 이 `setInterval`은 **책 창(`win`)의 React 렌더러** 안에서 1초마다 1씩 깎는 방식이다.
- 오버레이 창([`src/overlay/OverlayApp.tsx`](../src/overlay/OverlayApp.tsx))은 카운트다운 로직이 **없다**. `isTimerRunning`(돌고 있냐/아니냐)만 IPC로 받아 표정에만 쓴다.
- 즉 **남은 시간 계산의 주인은 100% 책 창**이다.

### 2-2. 캐릭터를 꺼내면 책 창을 숨긴다

[`electron/main.ts:122`](../electron/main.ts) — `book:exit-character` 핸들러 마지막 줄

```ts
win?.hide() // 캐릭터가 데스크탑에 나가는 순간 책이 "사라진다"
```

→ 타이머가 들어있는 바로 그 창이 화면에서 사라진다.

### 2-3. 숨겨진 책 창은 스로틀링을 끄지 않았다

[`electron/main.ts:38-41`](../electron/main.ts) — 책 창 생성

```ts
webPreferences: {
  preload: path.join(__dirname, 'preload.mjs'),
  devTools: true,
  // ← backgroundThrottling 설정이 없음 = 기본값(true, 스로틀링 켜짐)
},
```

반면 오버레이 창은 [`main.ts:80`](../electron/main.ts) 에서 `backgroundThrottling: false`로 **이미 꺼두었다**.

> **결정적 모순**: 직전 커밋 `fd7636e`가 스로틀링 문제를 고쳤지만 **오버레이 창에만** 적용했다.
> 정작 타이머가 도는 **책 창은 그대로** 남아 이 버그가 발생한다.

### 2-4. Chromium 백그라운드 스로틀링이란

브라우저는 배터리/CPU 절약을 위해, 보이지 않는(hidden) 페이지의 `setInterval`/`setTimeout`을
원래 주기보다 훨씬 드물게 실행한다(점점 더 느려지는 "intensive throttling"까지 있음).

- 관찰값: 실제 600초 동안 타이머는 137초만 감소 → 약 **23% 속도(≈4.4배 느림)**.
- 1초마다 깎여야 할 카운트가 ~4.4초에 한 번꼴로만 깎인 것과 일치한다. → **스로틀링이 원인임을 정량적으로 뒷받침**.

### 2-5. (2차 기여 요인) 캐릭터 CSS 필터 + 무한 애니메이션의 repaint 부하

> ⚠️ **주의**: 이건 주 원인이 아니라 **악화 요인**이다. ①(스로틀링 끄기)만 적용해도 버그는 사라진다. 다만 스로틀링이 살아있는 동안 체감 끊김을 더 키운다.

[`src/components/Character/Character.css:58`](../src/components/Character/Character.css)

```css
.char-img {
  filter: brightness(1) contrast(0.92) saturate(0.96); /* 책 에셋과 톤 맞춤 */
}
```

[`Character.css:95`](../src/components/Character/Character.css) — idle 상태에서 무한 반복되는 float 애니메이션

```css
.character-inner.float {
  animation: float 3.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}
```

- `transform`/`opacity`는 GPU가 처리(=메인 스레드 안 건드림)하지만, `filter`는 **매 프레임 픽셀을 다시 그리는(repaint)** 작업이라 메인 스레드를 점유한다.
- 여기에 `float` 무한 애니메이션이 겹치면 **매 프레임 필터 재계산**이 돌아 메인 스레드가 바빠진다.
- 타이머 콜백(`setInterval`)도 같은 메인 스레드에서 실행되므로, 스로틀링으로 이미 드물어진 틱이 **더 밀릴(jank)** 수 있다.

**비유**: 시계 초침(타이머)과 캐릭터 칠하기(필터 repaint)가 **한 명의 일꾼(메인 스레드)** 손에 맡겨져 있다. 칠하기가 끊임없이 일을 시키면, 가뜩이나 졸고 있는(스로틀링) 일꾼이 초침 밀기를 더 자주 깜빡한다.

> **개선 아이디어(선택)**: 정적인 톤 보정이라면 빌드 시 이미지에 톤을 굽거나(에셋 자체 보정), 굳이 런타임 `filter`가 필요하면 `will-change`/별도 레이어 분리로 repaint 범위를 줄인다. 우선순위는 낮다(①·②가 끝나면 검토).

---

## 3. "책 안에 있을 때도 그러냐?" — 가설과 테스트

### 가설

| 상황 | 책 창 상태 | 스로틀링 | 타이머 |
|---|---|---|---|
| 책 안 (앱이 앞에 보임) | visible | ❌ 안 걸림 | ✅ 정상 |
| 책 안인데 다른 앱으로 **완전히 가림**(occlusion) | hidden 판정 | ⚠️ 걸릴 수 있음 | ⚠️ 느려질 수 있음 |
| 책 안인데 **최소화** | hidden | ✅ 걸림 | ❌ 느려짐 |
| 캐릭터 꺼냄 (현재 버그) | `hide()` 됨 | ✅ 걸림 | ❌ 느려짐 |

→ **예상 답**: 책이 정상적으로 화면에 보일 때는 정확하다. 단, 책을 가리거나 최소화하면 같은 증상이 나올 수 있다.

### 테스트 절차 (수동, 5분 단축 버전 권장)

> 정밀 검증을 위해 임시로 타이머를 1분(또는 30초)으로 두고 테스트하면 10분 기다릴 필요가 없다.

1. **A. 책 앞에 둔 채(visible)**: 타이머 시작 → 시계로 1분 측정 → 남은 시간이 정확히 60초 줄었는지 확인. (정상 예상)
2. **B. 책을 다른 앱으로 완전히 가림**: 타이머 시작 → 큰 창으로 책을 덮음 → 1분 후 다시 책을 앞으로 → 60초 줄었는지 확인. (느려지면 occlusion도 영향)
3. **C. 책 최소화(Dock으로)**: 타이머 시작 → 최소화 → 1분 후 복원 → 확인. (느려질 것으로 예상)
4. **D. 캐릭터 꺼냄(현재 버그 재현)**: 타이머 시작 → 캐릭터 데스크탑으로 → 1분 후 귀가 → 확인. (느려질 것으로 예상)

> 측정 팁: 앱 시계가 아니라 **휴대폰/벽시계 등 외부 시계**로 실제 경과 시간을 재야 정확하다.

---

## 4. 수정 방안

두 가지를 **함께** 적용하는 것을 권장한다. ①은 "증상 즉시 차단", ②는 "근본 치료(어떤 상황에서도 정확)".

### ① (즉효) 책 창도 backgroundThrottling 끄기

[`electron/main.ts`](../electron/main.ts) `createWindow()`의 `webPreferences`에 오버레이와 동일하게 추가:

```ts
webPreferences: {
  preload: path.join(__dirname, 'preload.mjs'),
  devTools: true,
  backgroundThrottling: false, // 책이 숨겨져도 포커스 타이머가 정상 속도로 돈다
},
```

- **장점**: 한 줄, 오버레이와 일관됨, 현재 버그 즉시 해결.
- **한계**: 시스템 절전/슬립이나 OS의 타이머 병합(coalescing)까지 100% 막진 못한다. `setInterval` 누적 방식 자체의 미세 오차(drift)도 남는다.

### ② (근본) 타이머를 "벽시계 기준"으로 재설계

지금은 1초마다 1씩 **세는(counting)** 방식 → 틱이 누락되면 그만큼 시간이 사라진다.
대신 **목표 종료 시각(endTime)을 저장**하고, 매 틱마다 "지금 시각 vs 종료 시각" 차이로 남은 시간을 **계산**한다.

[`src/hooks/useFocusTimer.ts`](../src/hooks/useFocusTimer.ts) 개념 변경:

```ts
// start 시점에 종료 목표 시각을 박아둔다
const endAtRef = useRef<number>(0)

const start = () => {
  endAtRef.current = Date.now() + remainingSeconds * 1000
  setStatus('running')
  intervalRef.current = setInterval(() => {
    const left = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000))
    setRemainingSeconds(left)
    if (left <= 0) { /* 완료 처리 */ }
  }, 1000)
}
```

- **장점**: 틱이 몇 번 누락되든(스로틀링/슬립/탭 전환) **다음 틱에서 자동으로 정확한 값으로 보정**된다. drift도 사라진다.
- pause/reset도 "남은 시간"을 기준으로 endTime을 다시 계산하면 동일 로직으로 동작.

> **왜 둘 다?** ②만 있으면 값은 정확하지만, 숨겨진 동안 화면 갱신이 뚝뚝 끊긴다(틱 자체가 느리니까). ①이 화면을 매끄럽게 1초 간격으로 유지해 준다. ①+② = **정확하고 매끄럽다**.

### (선택) 완료 처리 점검

`handleFocusComplete`(꽃/선물/표정 전환)는 책 창에서 실행된다. 캐릭터가 밖에 있을 때 세션이 끝나면 ①이 적용돼야 제때 발화한다. ② 적용 시 `left <= 0` 분기에서 완료가 한 번만 호출되도록 가드 필요.

---

## 5. 권장 결론

| 우선순위 | 작업 | 파일 | 효과 |
|---|---|---|---|
| 1순위 (필수) | 책 창 `backgroundThrottling: false` | `electron/main.ts` | 현재 버그 즉시 해결 |
| 2순위 (권장) | 타이머 endTime 기준 재설계 | `src/hooks/useFocusTimer.ts` | 슬립/가림/드리프트까지 근본 해결 |
| 3순위 (확인) | 완료 콜백 중복/지연 점검 | `useFocusTimer.ts` / `YoonahRoom.tsx` | 세션 종료 이벤트 정확성 |
| 4순위 (선택) | 캐릭터 `filter` repaint 부하 완화 | `Character.css` | 끊김(jank) 체감 추가 개선, 주 원인 아님 |

---

## 6. 면접에서 써먹을 포인트

- **"브라우저는 안 보이는 탭의 타이머를 일부러 느리게 돌린다(background throttling)"** — 절전 최적화. Electron에선 `webPreferences.backgroundThrottling`으로 끌 수 있다.
- **카운트다운은 `setInterval`로 세지 말고 "종료 시각(timestamp) 기준으로 계산"하라** — 틱 누락/시스템 슬립/탭 비활성에도 정확. 프론트엔드 타이머의 정석 패턴.
- **버그의 본질은 "상태(타이머)가 사는 곳과, 그 창의 생명주기(hide)가 충돌"** 한 것 — 멀티 윈도우 아키텍처에서 "누가 진실의 원천(source of truth)인가"를 묻는 좋은 사례.
