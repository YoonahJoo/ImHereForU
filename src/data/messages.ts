// ============================================================
// Mini Yoonah — 말풍선 메시지 풀
// PRD 8-2 인터랙션 시스템 기반
// ============================================================

import type { Message, TimeOfDay } from '../types'

// ────────────────────────────────────────────────────────────
// A. Daily Mode 랜덤 말풍선 (클릭 시)
// ────────────────────────────────────────────────────────────

export const dailyMessages: Message[] = [
  { id: 'd1', text: 'I miss you babe', type: 'daily' },
  { id: 'd2', text: "Show me your to-do list!", type: 'daily' },
  { id: 'd3', text: "You're sooooo cute <3", type: 'daily' },
  { id: 'd4', text: "I'd be happy if you text meee", type: 'daily' },
  { id: 'd5', text: "You have no idea how much I LOVE you", type: 'daily' },
  { id: 'd6', text: "I'm tiny but I love you big >_< !!!", type: 'daily' },
]

// ────────────────────────────────────────────────────────────
// B. 시간대별 자동 멘트
// ────────────────────────────────────────────────────────────

export const timeBasedMessages: Record<TimeOfDay, Message> = {
  morning: {
    id: 'tb-morning',
    text: 'Good morninggg☀️ how did you sleep?',
    type: 'time-based',
  },
  afternoon: {
    id: 'tb-afternoon',
    text: 'Good afternoon!',
    type: 'time-based',
  },
  evening: {
    id: 'tb-evening',
    text: "Good evening! Did you have dinner?",
    type: 'time-based',
  },
  night: {
    id: 'tb-night',
    text: "It's getting late tho! Aren't you sleepy?",
    type: 'time-based',
  },
  dawn: {
    id: 'tb-dawn',
    text: "Wait wait, its too late! Go get some sleep babeee >:(",
    type: 'time-based',
  },
}

// ────────────────────────────────────────────────────────────
// C. 롱프레스 삐진 말풍선 (5초+ 누름)
// ────────────────────────────────────────────────────────────

export const sulkyMessages: Message[] = [
  { id: 's1', text: 'Let me goooo', type: 'sulky' },
  { id: 's2', text: 'Babeee Im dizzy', type: 'sulky' },
]

// ────────────────────────────────────────────────────────────
// C-2. 5초+ 홀드 / 릴리즈 고정 메시지 (mode별)
// ────────────────────────────────────────────────────────────

export const sulkyDailyHoldMessage = 'let me goooo'
export const sulkyDailyReleaseMessage = 'Thanks!'
export const sulkyFocusModeHoldMessage = 'babeee focussss!!'
export const sulkyFocusModeReleaseMessage = 'you got this!! almost there!!'

// ────────────────────────────────────────────────────────────
// C-3. 방치 감지 웨이크업 메시지
// ────────────────────────────────────────────────────────────

export const idleWakePromptMessage = 'click me if you wanna wake me up'
export const idleWakeResponseMessage = "Oh you didn't forget me! I missed u"

// ────────────────────────────────────────────────────────────
// D. 방치 상태 말풍선 (15분 이상 인터랙션 없음)
// ────────────────────────────────────────────────────────────

export const idleMessages: Message[] = [
  { id: 'i1', text: 'Hmm I need attention..zzz', type: 'idle' },
  { id: 'i2', text: "Babe I'm falling asleepppp...zzz", type: 'idle' },
]

// ────────────────────────────────────────────────────────────
// E. Focus Mode 응원 말풍선
// ────────────────────────────────────────────────────────────

export const focusMessages: Message[] = [
  { id: 'f1', text: "I'm watching you, lock in!", type: 'focus' },
  { id: 'f2', text: "Who's doing doom scrolling 👀 !!", type: 'focus' },
  { id: 'f3', text: "You're doing great, babe.", type: 'focus' },
  { id: 'f4', text: "My hard working babe, I'm in love again hehe", type: 'focus' },
  { id: 'f5', text: "Almost there! Don't give up!!", type: 'focus' },
  { id: 'f6', text: "You've got this!", type: 'focus' },
]

// ────────────────────────────────────────────────────────────
// F. Focus 완료 메시지
// ────────────────────────────────────────────────────────────

export const completeMessages: Message[] = [
  {
    id: 'c1',
    text: 'You did a great job, sweet heart <3',
    type: 'complete',
  },
  { id: 'c2', text: "You made it! I'm soooo proud of you <3", type: 'complete' },
  { id: 'c3', text: "You're amazing, wanna give you a big hug <3", type: 'complete' },
]

// ────────────────────────────────────────────────────────────
// 유틸: 배열에서 랜덤 메시지 1개 반환
// ────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────
// G. Focus 중 daily 전환 시도 시 반응 메시지 (curious)
// ────────────────────────────────────────────────────────────

export const focusCuriousMessages: Message[] = [
  { id: 'fc1', text: "where r u going babe? your focus time hasn't done yet!", type: 'focus' },
  { id: 'fc2', text: "If you wanna go on daily mode, pause the timer!", type: 'focus' },
]

// ────────────────────────────────────────────────────────────
// H. Focus 중 더블클릭 시 반응 메시지 (cheering)
// ────────────────────────────────────────────────────────────

export const focusCheeringMessages: Message[] = [
  { id: 'fch1', text: "I know you miss me babe, but its time to lock in.", type: 'focus' },
]

// ────────────────────────────────────────────────────────────
// 유틸: 배열에서 랜덤 메시지 1개 반환
// ────────────────────────────────────────────────────────────

export function getRandomMessage(messages: Message[]): Message {
  const index = Math.floor(Math.random() * messages.length)
  return messages[index]
}
