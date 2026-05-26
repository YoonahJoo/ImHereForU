# PRD — Mini Yoonah / Yoonah House

**문서 버전**: v1.0  
**작성일**: 2026-05-26  
**상태**: MVP 완료 후 방향성 정리 문서  
**현재 버전**: v0.1.0-mvp

---

## 1. Overview

### 1-1. 프로젝트 배경

장거리 커플은 물리적으로 함께 있지 못하는 시간이 많다. 특히 각자 공부하거나 작업하는 일상적인 시간에는 상대방과 실시간으로 대화하지 않더라도, 상대방이 곁에 있다는 감각을 느끼기 어렵다.

국제 커플의 경우 시차 때문에 이 문제는 더 커진다. 상대방이 자고 있거나, 일하고 있거나, 연락이 어려운 시간에도 사용자는 혼자 작업을 해야 한다.

**Mini Yoonah**는 이러한 장거리 관계의 감정적 거리감을 줄이기 위한 데스크톱 컴패니언 앱이다.

---

### 1-2. 프로젝트 목표

Mini Yoonah는 사용자가 노트북으로 공부하거나 작업할 때, 화면 위에 작은 캐릭터가 함께 있어주는 감각을 제공한다.

이 앱은 단순한 생산성 타이머 앱이 아니며, 단순한 데스크톱 펫 앱도 아니다.

핵심 목표는 다음과 같다.

> 사용자가 혼자 작업하는 시간에도 상대방의 존재감을 느낄 수 있도록 돕는 감정형 desktop companion app을 만든다.

---

### 1-3. 핵심 가치

Mini Yoonah의 핵심 가치는 다음 세 가지다.

1. **Emotional Presence**  
   사용자는 상대방이 화면 속에서 함께 있어주는 듯한 감각을 느낀다.

2. **Soft Productivity**  
   강압적인 생산성 관리가 아니라, 귀엽고 부드러운 방식으로 집중을 도와준다.

3. **Personalized Interaction**  
   클릭, 드래그, 더블클릭, 롱프레스, 방치 상태에 따라 캐릭터가 감정적으로 반응한다.

---

## 2. Problem Statement

### 2-1. 해결하려는 문제

장거리 커플은 각자 떨어져서 시간을 보내는 동안, 특히 공부하거나 작업하는 시간에 상대방의 존재감을 자연스럽게 느끼기 어렵다.

이 앱은 “연락 기능” 자체를 대체하려는 것이 아니라, 사용자의 데스크톱 위에 작은 캐릭터를 배치해 **상대방이 곁에 있는 듯한 감정적 경험**을 제공하는 것을 목표로 한다.

---

### 2-2. 이 앱이 해결하지 않는 문제

Mini Yoonah는 다음 문제를 직접 해결하지 않는다.

- 실시간 채팅
- 장거리 커플 간 일정 공유
- 영상 통화
- 위치 공유
- 실제 커플 동기화
- 강력한 생산성 관리
- 업무 관리 또는 할 일 관리

이 앱의 초점은 커뮤니케이션 도구가 아니라 **감정적 존재감**이다.

---

## 3. Target Users

### 3-1. 주요 사용자

- 장거리 연애 중인 사람
- 국제 연애 중인 사람
- 혼자 공부하거나 작업하는 시간이 많은 사람
- 귀여운 캐릭터 기반 데스크톱 앱을 좋아하는 사람
- 상대방을 떠올리게 하는 작은 위젯이나 companion을 원하는 사람

---

### 3-2. 사용자 상황

사용자는 다음과 같은 상황에서 앱을 사용한다.

- 노트북으로 공부할 때
- 코딩하거나 작업할 때
- 상대방이 보고 싶지만 바로 연락하기 어려울 때
- 혼자 집중해야 하지만 외로움을 느낄 때
- 귀여운 방식으로 작업 루틴을 만들고 싶을 때

---

## 4. Product Positioning

### 4-1. 제품 포지션

Mini Yoonah는 일반적인 desktop pet 또는 pomodoro app과 다르다.

| 구분 | 일반 Desktop Pet | 일반 Pomodoro App | Mini Yoonah |
|---|---|---|---|
| 핵심 목적 | 귀여운 펫 상호작용 | 시간 관리 | 상대방의 존재감 제공 |
| 감정 맥락 | 낮음 | 낮음 | 높음 |
| 주요 대상 | 일반 사용자 | 공부/업무 사용자 | 장거리 커플 |
| 보상 구조 | 펫 성장/아이템 | 집중 시간 기록 | 상대방이 주는 선물 아이템 |
| 메시지 톤 | 일반적 | 생산성 중심 | 연인/companion 중심 |

---

### 4-2. 차별점

Mini Yoonah의 차별점은 다음과 같다.

- 장거리 커플 맥락에 맞춘 감정형 UX
- 상대방이 말하는 듯한 말풍선
- Focus 완료 시 “선물”을 받는 감정적 보상 구조
- 클릭, 더블클릭, 롱프레스, 드래그, idle 상태에 따른 캐릭터 반응
- 사용자가 직접 커스텀 메시지를 추가할 수 있는 구조

---

## 5. Current MVP Scope

현재 MVP는 v0.1.0-mvp 기준으로 완성된 상태다.

### 5-1. MVP 핵심 기능 3가지

MVP의 핵심 기능은 다음 세 가지다.

1. **작은 companion 캐릭터가 앱 창 안에 나타난다.**
   - Electron 기반 작은 데스크톱 앱 창에서 Mini Yoonah 캐릭터가 표시된다.
   - 캐릭터는 단순 이미지가 아니라 상호작용 가능한 companion으로 동작한다.

2. **캐릭터가 사용자 행동에 반응한다.**
   - 클릭
   - 더블클릭
   - 드래그
   - 5초 이상 롱프레스
   - 방치 상태
   - 시간대 자동 인사

3. **Focus Mode에서 함께 집중하는 경험을 제공한다.**
   - Daily / Focus Mode 전환
   - 25분 Focus Timer
   - 타이머 완료 시 칭찬 메시지
   - 랜덤 선물 지급
   - Gift Room에 선물 저장

---

## 6. User Stories

| # | User Story | 우선순위 | 상태 |
|---|---|---|---|
| US-01 | 사용자로서 앱을 실행하면 작은 Mini Yoonah 캐릭터를 볼 수 있다 | 높음 | 완료 |
| US-02 | 사용자로서 캐릭터를 클릭하면 랜덤 말풍선을 볼 수 있다 | 높음 | 완료 |
| US-03 | 사용자로서 캐릭터를 더블클릭하면 하트 이펙트를 볼 수 있다 | 높음 | 완료 |
| US-04 | 사용자로서 캐릭터를 드래그해서 위치를 옮길 수 있다 | 높음 | 완료 |
| US-05 | 사용자로서 캐릭터를 오래 누르면 삐진 반응을 볼 수 있다 | 높음 | 완료 |
| US-06 | 사용자로서 앱을 방치하면 캐릭터가 먼저 반응하는 것을 볼 수 있다 | 높음 | 완료 |
| US-07 | 사용자로서 Daily Mode와 Focus Mode를 전환할 수 있다 | 높음 | 완료 |
| US-08 | 사용자로서 Focus Mode에서 25분 타이머를 사용할 수 있다 | 높음 | 완료 |
| US-09 | 사용자로서 Focus 완료 후 랜덤 선물을 받을 수 있다 | 높음 | 완료 |
| US-10 | 사용자로서 Gift Room에서 받은 선물 목록을 확인할 수 있다 | 중간 | 완료 |
| US-11 | 사용자로서 Settings에서 커스텀 메시지를 추가할 수 있다 | 중간 | 완료 |
| US-12 | 사용자로서 앱 재실행 후에도 선물과 설정이 유지되길 원한다 | 중간 | 부분 완료 (선물·커스텀 메시지는 유지됨. defaultMode는 재시작 시 미반영 — 버그) |

---

## 7. Functional Requirements

## 7-1. App Window

| 기능 | 세부 요구사항 |
|---|---|
| 데스크톱 앱 창 | Electron 기반 앱 창으로 실행 |
| 창 크기 | MVP 기준 작은 고정 창으로 사용 |
| 앱 제목 | Mini Yoonah |
| DevTools | 개발 중에는 활성화 가능, 최종 배포 시 비활성화 |
| 창 UI | 일반 웹사이트가 아니라 작은 데스크톱 앱 창처럼 보이도록 구성 |

---

## 7-2. Mode System

앱은 두 가지 모드를 가진다.

### Daily Mode

| 기능 | 세부 요구사항 |
|---|---|
| 기본 목적 | 감정적 companion 경험 제공 |
| 기본 힌트 | `Click me! 🥺` |
| 클릭 반응 | 랜덤 일상 메시지 + smile 표정 |
| 더블클릭 반응 | 하트 이펙트 |
| 드래그 반응 | Daily 전용 dragging 표정 |
| 롱프레스 반응 | Daily 전용 sulky 반응 |

### Focus Mode

| 기능 | 세부 요구사항 |
|---|---|
| 기본 목적 | 부드러운 집중 보조 |
| 기본 힌트 | `Let's focus together 📚` |
| 클릭 반응 | 집중 응원 메시지 |
| 더블클릭 반응 | 타이머 실행 중 cheering 메시지 |
| 타이머 | 25분 카운트다운 |
| 완료 보상 | 랜덤 선물 지급 |

---

## 7-3. Character Expression System

캐릭터는 상태에 따라 다른 expression을 가진다.

| Expression | 의미 |
|---|---|
| `idle` | 기본 상태 |
| `smile` | 클릭, 더블클릭, Focus 완료, 시간대 인사 |
| `sulky_daily_mode` | Daily Mode 롱프레스 |
| `sulky_focus_mode` | Focus Mode 롱프레스 |
| `sleepy` | 방치 상태 또는 새벽 시간대 |
| `focus_mode` | Focus Timer 실행 중 |
| `dragging_daily_mode` | Daily Mode 드래그 중 |
| `dragging_focus_mode` | Focus Mode 드래그 중 |
| `curious` | Focus Timer 실행 중 Daily 전환 시도 |
| `cheering` | Focus Timer 실행 중 더블클릭 |

---

## 7-4. Mouse Interaction

### 클릭

| 조건 | 동작 |
|---|---|
| Daily Mode | smile 표정 + 랜덤 daily 메시지 |
| Focus Mode | 랜덤 focus 메시지 |

### 더블클릭

| 조건 | 동작 |
|---|---|
| Focus Timer 실행 중 | cheering 표정 + focus 유지 메시지 |
| 그 외 | smile 표정 + 하트 이펙트 |

### 드래그

| 조건 | 동작 |
|---|---|
| 5px 이상 이동 | 드래그로 인식 |
| Daily Mode | `dragging_daily_mode` |
| Focus Mode | `dragging_focus_mode` |
| 마우스 release | 이전 표정 또는 모드에 맞는 표정으로 복귀 |

### 롱프레스

| 조건 | 동작 |
|---|---|
| 5초 이상 홀드 | 모드별 sulky 반응 |
| Daily Mode | `"let me goooo"` |
| Focus Mode | `"babeee focussss!!"` |
| Daily release 시 | `"yeay!"` |
| Focus release 시 | `"you got this!! almost there!!"` (타이머 running이면 `focus_mode`로, 아니면 `idle`로 복귀) |

### Focus 중 Daily 전환 차단

Focus Timer가 running 상태일 때 Daily 탭으로 전환을 시도하면 모드 전환이 차단된다.

| 단계 | 동작 |
|---|---|
| 전환 시도 즉시 | `curious` 표정 + `"where r u going babe? your focus time hasn't done yet!"` |
| 2.5초 후 | `"If you wanna go on daily mode, pause the timer!"` |
| 2초 후 | `focus_mode` 표정으로 복귀 |

---

## 7-5. Speech Bubble

| 기능 | 세부 요구사항 |
|---|---|
| 위치 | 캐릭터 위쪽 |
| 지속 시간 | 기본 3초 |
| 교체 방식 | 새 메시지가 출력되면 기존 말풍선 교체 |
| 드래그 연동 | 캐릭터 이동 시 말풍선도 함께 이동 |
| 힌트 텍스트 | 말풍선이 없을 때만 표시 |

---

## 7-6. Time-Based Greeting

앱 최초 로드 시 현재 시간에 따라 자동 메시지를 1초 지연 후 출력한다.

| 시간대 | 범위 | 메시지 성격 |
|---|---|---|
| Morning | 06:00 ~ 11:59 | 아침 인사 |
| Afternoon | 12:00 ~ 17:59 | 식사/안부 |
| Evening | 18:00 ~ 21:59 | 저녁 인사 |
| Night | 22:00 ~ 23:59 | 수면 유도 |
| Dawn | 00:00 ~ 05:59 | 수면 경고 + sleepy |

Dawn 시간대일 경우 앱 초기 로드 시점부터 (메시지 출력 전에도) 캐릭터 표정이 `sleepy`로 초기화된다.

---

## 7-7. Idle Behavior

| 기능 | 세부 요구사항 |
|---|---|
| 발동 조건 | 마지막 인터랙션 후 15분 경과 |
| Focus Timer running 중 | idle 감지 일시 정지 |
| 첫 메시지 | sleepy 표정 + 관심 요청 메시지 (풀: `"I need attention babe..😢"` / `"Helloooo? I'm here???"` 중 랜덤) |
| 두 번째 메시지 | `"click me if you wanna wake me up!"` |
| 클릭 시 | idle 복귀 + `"hehe!"` 메시지 |
| 반복성 | 1회성이 아니라 반복 가능해야 함 |

---

## 7-8. Focus Timer

| 기능 | 세부 요구사항 |
|---|---|
| 기본 시간 | 25분 |
| 표시 방식 | MM:SS |
| 상태 | idle / running / cancelled / completed |
| 버튼 | 시작 / 일시정지 / 재개 / 리셋 |
| 실행 중 표정 | `focus_mode` |
| 완료 시 | 완료 메시지 + 선물 지급 |

---

## 7-9. Gift System

| 기능 | 세부 요구사항 |
|---|---|
| 지급 조건 | Focus Timer 완료 |
| 지급 방식 | 가중치 기반 랜덤 |
| Common | 60% |
| Uncommon | 30% |
| Rare | 10% |
| 저장 방식 | localStorage |
| 알림 | 선물 획득 시 4초간 카드 표시 |

### Gift Items

| 희귀도 | 아이템 |
|---|---|
| Common | Cupcake, Water, Jelly, Bread, Strawberry Milk |
| Uncommon | Tiny Letter, Flower, Heart |
| Rare | Ribbon |

---

## 7-10. Gift Room

| 기능 | 세부 요구사항 |
|---|---|
| 진입 방식 | 하단 Gift Room 버튼 |
| 표시 방식 | 그리드 카드 |
| 표시 정보 | 이모지, 이름, 획득 시각 |
| 빈 상태 | 선물이 없을 때 안내 메시지 |
| 저장 연동 | localStorage의 gift list를 표시 |

---

## 7-11. Settings

| 설정 항목 | 설명 |
|---|---|
| My Name | 사용자 이름 |
| Partner's Name | 캐릭터/파트너 이름 |
| Default Mode | 앱 시작 시 기본 모드 |
| Custom Message | Daily Mode 클릭 시 추가될 커스텀 메시지 |

### Settings 요구사항

- 설정은 localStorage에 저장된다.
- Save 버튼으로 저장한다.
- 닫기 버튼으로 패널을 닫을 수 있다.
- Custom Message는 추가/삭제할 수 있다.
- Custom Message는 Daily Mode 메시지 풀에 합산된다.

---

## 8. Data Model

### 8-1. Expression

```ts
type Expression =
  | 'idle'
  | 'smile'
  | 'sulky_daily_mode'
  | 'sulky_focus_mode'
  | 'sleepy'
  | 'focus_mode'
  | 'dragging_daily_mode'
  | 'dragging_focus_mode'
  | 'curious'
  | 'cheering'
```

---

### 8-2. AppMode / TimeOfDay

```ts
type AppMode = 'daily' | 'focus'

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'dawn'
```

---

### 8-3. Message

```ts
type MessageType =
  | 'daily'
  | 'focus'
  | 'idle'
  | 'time-based'
  | 'sulky'
  | 'complete'

interface Message {
  id: string
  text: string
  type: MessageType
}
```

---

### 8-4. FocusSession

```ts
type SessionStatus = 'idle' | 'running' | 'cancelled' | 'completed'
// 'cancelled'는 일시정지(paused) 상태로도 사용됨

interface FocusSession {
  duration: number        // 분 단위 (기본값: 25)
  status: SessionStatus
  startedAt: string | null
  endedAt: string | null
  rewardId: string | null
}
```

---

### 8-5. GiftItem

```ts
type Rarity = 'common' | 'uncommon' | 'rare'

interface GiftItem {
  id: string
  name: string
  emoji: string
  rarity: Rarity
  receivedAt: string    // ISO 날짜 문자열
}
```

---

### 8-6. UserSettings

```ts
interface UserSettings {
  userName: string           // 기본값: "You"
  partnerNickname: string    // 기본값: "Yoonah"
  customMessages: string[]
  defaultMode: AppMode       // 기본값: "daily"
}
```