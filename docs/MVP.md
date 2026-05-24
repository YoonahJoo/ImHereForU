# Mini Yoonah — MVP 기능 명세

> 현재 구현된 MVP 기준 기능 및 UX 설명 문서입니다.

---

## 1. 개요

**Mini Yoonah**는 데스크탑 브라우저에서 동작하는 감성 캐릭터 동반자 앱입니다.
이모지 기반의 캐릭터 "Yoonah"가 화면에 상주하며, 사용자의 마우스 인터랙션에 반응하고, 집중 타이머 기능과 선물 수집 시스템을 제공합니다.

---

## 2. 앱 구조 (화면 레이아웃)

```
┌─────────────────────────────────┐
│  [Daily / Focus 토글]    [⚙️]   │  ← 상단: 모드 전환 + 설정 버튼
├─────────────────────────────────┤
│                                 │
│       [말풍선]                  │  ← 중간: 캐릭터 스테이지
│         😚                      │
│     "Click me! 🥺"              │  ← 힌트 텍스트 (말풍선 없을 때만 표시)
│                                 │
├─────────────────────────────────┤
│  [🎁 Gift Room]  [Focus Timer]  │  ← 하단: 선물방 버튼 + (Focus 모드 시) 타이머
└─────────────────────────────────┘
```

---

## 3. 모드 시스템

앱은 **Daily Mode**와 **Focus Mode** 두 가지 모드로 동작합니다.

| 항목 | Daily Mode | Focus Mode |
|------|-----------|-----------|
| 기본 힌트 | `Click me! 🥺` | `Let's focus together 📚` |
| 클릭 반응 | 랜덤 일상 메시지 + smile 표정 | 랜덤 집중 응원 메시지 |
| 더블클릭 반응 | smile 표정 + 하트 이펙트 | cheering 표정 + 메시지 |
| 타이머 | 없음 | 25분 타이머 |
| 드래그 표정 | 🤨 `dragging_daily_mode` | 😐 `dragging_focus_mode` |

### 모드 전환 제한

Focus Mode에서 타이머가 **실행 중**일 때 Daily 탭을 누르면:
- `curious` 표정(🥸)으로 전환
- `"where r u going babe? your focus time hasn't done yet!"` 메시지 출력
- 2.5초 후 `"If you wanna go on daily mode, pause the timer!"` 메시지 출력
- 이후 `focus_mode` 표정으로 자동 복귀
- 모드 전환은 **차단**됨

---

## 4. 캐릭터 표정 시스템

캐릭터의 상태는 총 **10가지 표정**으로 표현됩니다.

| Expression | 이모지 | 발생 조건 |
|------------|--------|----------|
| `idle` | 😚 | 기본 상태. 위아래로 float 애니메이션 |
| `smile` | 🥰 | 클릭, 더블클릭, Focus 완료, 시간대 인사 시 |
| `sulky_daily_mode` | 😡 | Daily Mode에서 5초 이상 홀드 시 |
| `sulky_focus_mode` | 😤 | Focus Mode에서 5초 이상 홀드 시 |
| `sleepy` | 😪 | 앱 방치 15분 이상 / 새벽 시간대(0~6시) 진입 시 |
| `focus_mode` | 👩‍💻📚 | Focus 타이머 실행 중 (📚 오버레이 포함) |
| `dragging_daily_mode` | 🤨 | Daily Mode에서 캐릭터 드래그 중 |
| `dragging_focus_mode` | 😐 | Focus Mode에서 캐릭터 드래그 중 |
| `curious` | 🥸 | Focus 타이머 실행 중 Daily 탭 전환 시도 시 |
| `cheering` | 😌 | Focus 타이머 실행 중 더블클릭 시 |

---

## 5. 마우스 인터랙션

### 5-1. 클릭 (단순 클릭)

- **Daily Mode**: `smile` 표정 + 아래 풀에서 랜덤 메시지 출력 (3초 후 `idle` 복귀)
  - `"I miss you babe 🥺"`
  - `"Don't forget to get some sleep 🌙"`
  - `"Mini Yoonah is watching you!"`
  - `"I'd be happy if you text me!"`
  - `"You're amazing!"`
  - `"I'm tiny but I love you big."`
  - + 사용자가 Settings에서 추가한 커스텀 메시지
- **Focus Mode**: 랜덤 집중 응원 메시지 출력 (표정 변화 없음)
  - `"Yoonah is watching you. Focus on!"`
  - `"No doom scrolling 👀"`
  - `"You're doing good, babe."`
  - `"Stay with it for a lit bit more."`
  - `"Almost there! Don't give up."`
  - `"You got this!"`

### 5-2. 더블클릭

- **타이머 실행 중 (Focus Mode)**:
  - `cheering` 표정(😌) + `"I know you miss me babe, but its time to lock in."` 출력
  - 2초 후 `focus_mode` 복귀
- **그 외 (Daily Mode 또는 타이머 미실행)**:
  - `smile` 표정 + 하트 이펙트(3~5개) 화면 위로 떠오름
  - 3초 후 `idle` 복귀

### 5-3. 드래그 (캐릭터 자유 이동)

- 마우스 5px 이상 이동 시 드래그로 인식
- 화면 어디든 자유롭게 이동 가능
- 드래그 중 표정:
  - Daily Mode → `dragging_daily_mode` (🤨)
  - Focus Mode → `dragging_focus_mode` (😐)
- 마우스를 놓으면 드래그 이전 표정으로 자동 복귀

### 5-4. 5초 이상 홀드 (Long Press)

캐릭터를 마우스로 잡고 **5초 이상 놓지 않으면** 모드에 따라 반응이 달라집니다.
드래그 중에도 동일하게 작동합니다.

**Daily Mode:**
- 5초 도달 시: `sulky_daily_mode` 표정(😡) + `"let me goooo"` 말풍선
- 마우스를 놓으면: `idle` 표정 복귀 + `"yeay!"` 말풍선

**Focus Mode:**
- 5초 도달 시: `sulky_focus_mode` 표정(😤) + `"babeee focussss!!"` 말풍선
- 마우스를 놓으면:
  - 타이머 실행 중 → `focus_mode` 복귀
  - 타이머 미실행 → `idle` 복귀
  - `"you got this!! almost there!!"` 말풍선

> 홀드 후 마우스를 놓을 때 일반 클릭 반응은 실행되지 않습니다.
> 캐릭터 바깥에서 마우스를 놓아도 release 처리가 정상 동작합니다.

---

## 6. 말풍선 시스템

- 메시지는 캐릭터 위쪽에 말풍선 형태로 표시됩니다.
- 말풍선은 **3초 후 자동으로 사라집니다.**
- 캐릭터를 드래그해 위치를 이동해도 말풍선이 캐릭터를 따라갑니다.
- 새 메시지가 출력되면 이전 말풍선이 즉시 교체됩니다.
- 말풍선이 없을 때는 힌트 텍스트가 대신 표시됩니다.

---

## 7. 시간대 자동 인사

앱 최초 로드 시, 현재 시각에 따라 **자동으로 인사 말풍선**이 출력됩니다.

| 시간대 | 범위 | 메시지 | 추가 동작 |
|--------|------|--------|----------|
| 아침 | 06:00 ~ 11:59 | `Good morninggg☀️` | smile 표정 |
| 오후 | 12:00 ~ 17:59 | `Have you eaten babe?` | smile 표정 |
| 저녁 | 18:00 ~ 21:59 | `Good evening!` | smile 표정 |
| 밤 | 22:00 ~ 23:59 | `Time to go to sleep babe!` | smile 표정 |
| 새벽 | 00:00 ~ 05:59 | `BABE YOU SHOULD SLEEP!!!!` | sleepy 표정으로 시작 |

---

## 8. 방치 감지 (Idle Behavior)

마지막 인터랙션으로부터 **15분**이 경과하면 자동 발동됩니다.

### 8-1. 발동 조건

- 클릭 / 더블클릭 / 롱프레스 중 마지막 인터랙션으로부터 15분 경과 시 발동
- **Focus 타이머 실행 중(`running`)에는 방치 감지가 일시 정지됩니다.**
  - 타이머가 일시정지 / 완료 / 리셋되는 순간 15분 카운트 재시작

### 8-2. 방치 이벤트 시퀀스

1. `sleepy` 표정(😪)으로 전환 + 아래 메시지 중 **랜덤** 출력:
   - `"I need attention babe..😢"`
   - `"Helloooo? I'm here???"`
2. 3초 후 (첫 번째 말풍선 소멸 직후) 두 번째 메시지 출력:
   - `"click me if you wanna wake me up!"`
3. 이 상태에서 캐릭터를 클릭하면:
   - `idle` 표정(😚)으로 복귀
   - `"hehe!"` 말풍선 출력
   - **15분 카운트 재시작** → 다시 15분 무인터랙션 시 방치 이벤트 재발동

### 8-3. 반복 사이클

방치 이벤트는 1회성이 아니라 **무한 반복**됩니다.

```
[15분 경과] → sleepy 😪 + 랜덤 메시지
                   ↓ 3초 후
           "click me if you wanna wake me up!"
                   ↓ 캐릭터 클릭
           idle 😚 + "hehe!" + 15분 카운트 재시작
                   ↓ 다시 15분 경과
           sleepy 😪  (반복)
```

---

## 9. Focus Mode 타이머

- **25분** 포모도로 타이머
- 하단에 `MM:SS` 형식으로 잔여 시간 표시
- 상태별 버튼:
  - `idle` → ▶ (시작)
  - `running` → ⏸ (일시정지)
  - `cancelled` → ▶ (재개) + ↺ (리셋)
  - `completed` → `Done! 🎉` 표시 + ↺ (리셋)
- 타이머 실행 중: 캐릭터가 `focus_mode` 표정(👩‍💻📚)으로 유지됩니다.

### 타이머 완료 시

- `smile` 표정(🥰) + 아래 메시지 중 랜덤 출력:
  - `"You did a great job! Wanna get some rest, babe? 🥰"`
  - `"I'm so proud of you 🥰"`
  - `"You're amazing Take some break, babe 🥰"`
- 선물 1개 즉시 지급 (우측 하단에 알림 카드 4초간 표시)
- 5초 후 `idle` 복귀

---

## 10. 선물 시스템

Focus 타이머 완료 시 희귀도 가중치에 따라 선물 1개를 랜덤으로 획득합니다.

### 희귀도별 확률

| 희귀도 | 확률 | 아이템 |
|--------|------|--------|
| Common | 60% | Cupcake 🧁 / Water 💧 / Jelly 🍬 / Bread 🍞 / Strawberry Milk 🥛 |
| Uncommon | 30% | Tiny Letter 💌 / Flower 🌸 / Heart 💖 |
| Rare | 10% | Ribbon 🎀 |

### Gift Room

- 하단 `🎁 Gift Room` 버튼으로 진입
- 획득한 선물 전체 목록을 그리드 형태로 표시
- 각 카드에 이모지, 이름, 획득 시각 표시
- 희귀도별 카드 스타일 구분
- 선물 없을 시 안내 메시지 표시
- 선물 목록은 **localStorage에 영구 저장**됩니다.

---

## 11. 설정 (Settings)

우측 상단 ⚙️ 버튼으로 진입합니다.

| 설정 항목 | 기본값 | 설명 |
|----------|--------|------|
| My Name | `You` | 사용자 이름 (현재 UI 표시에 직접 사용 안 됨) |
| Partner's Name | `Yoonah` | 캐릭터 이름 (현재 UI 표시에 직접 사용 안 됨) |
| Default Mode | `Daily` | 앱 시작 시 기본 모드 설정 |
| Custom Message | — | Daily Mode 클릭 시 말풍선에 출력될 커스텀 문구 추가/삭제 |

- 설정은 **localStorage에 영구 저장**됩니다.
- Save 버튼으로 저장, ✕ 버튼으로 닫기

---

## 12. 데이터 영속성

| 데이터 | 저장 방식 |
|--------|----------|
| 획득한 선물 목록 | `localStorage` |
| 사용자 설정 | `localStorage` |
| 캐릭터 위치 | 세션 내 메모리 (새로고침 시 초기화) |
| 타이머 상태 | 세션 내 메모리 (새로고침 시 초기화) |
