// ============================================================
// Mini Yoonah — 말풍선 메시지 풀
// PRD 8-2 인터랙션 시스템 기반
// ============================================================

import type { Message, TimeOfDay } from '../types'

// ────────────────────────────────────────────────────────────
// A. Daily Mode 랜덤 말풍선 (클릭 시)
// ────────────────────────────────────────────────────────────

export const dailyMessages: Message[] = [
  { id: 'd1', text: 'I miss you babe 🥺', type: 'daily' },
  { id: 'd2', text: "Don't forget to get some sleep 🌙", type: 'daily' },
  { id: 'd3', text: 'Mini Yoonah is watching you!', type: 'daily' },
  { id: 'd4', text: "I'd be happy if you text me!", type: 'daily' },
  { id: 'd5', text: "You're amazing!", type: 'daily' },
  { id: 'd6', text: "I'm tiny but I love you big.", type: 'daily' },
]

// ────────────────────────────────────────────────────────────
// B. 시간대별 자동 멘트
// ────────────────────────────────────────────────────────────

export const timeBasedMessages: Record<TimeOfDay, Message> = {
  morning: {
    id: 'tb-morning',
    text: 'Good morninggg☀️',
    type: 'time-based',
  },
  afternoon: {
    id: 'tb-afternoon',
    text: 'Have you eaten babe?',
    type: 'time-based',
  },
  evening: {
    id: 'tb-evening',
    text: 'Good evening!',
    type: 'time-based',
  },
  night: {
    id: 'tb-night',
    text: 'Time to go to sleep babe!',
    type: 'time-based',
  },
  dawn: {
    id: 'tb-dawn',
    text: 'BABE YOU SHOULD SLEEP!!!!',
    type: 'time-based',
  },
}

// ────────────────────────────────────────────────────────────
// C. 롱프레스 삐진 말풍선 (5초+ 누름)
// ────────────────────────────────────────────────────────────

export const sulkyMessages: Message[] = [
  { id: 's1', text: 'Let me goooo😭', type: 'sulky' },
  { id: 's2', text: 'Where am I going???', type: 'sulky' },
  { id: 's3', text: 'Ahhhhhh Im dizzy', type: 'sulky' },
]

// ────────────────────────────────────────────────────────────
// C-2. 5초+ 홀드 / 릴리즈 고정 메시지 (mode별)
// ────────────────────────────────────────────────────────────

export const sulkyDailyHoldMessage = 'let me goooo'
export const sulkyDailyReleaseMessage = 'yeay!'
export const sulkyFocusModeHoldMessage = 'babeee focussss!!'
export const sulkyFocusModeReleaseMessage = 'you got this!! almost there!!'

// ────────────────────────────────────────────────────────────
// C-3. 방치 감지 웨이크업 메시지
// ────────────────────────────────────────────────────────────

export const idleWakePromptMessage = 'click me if you wanna wake me up!'
export const idleWakeResponseMessage = 'hehe!'

// ────────────────────────────────────────────────────────────
// D. 방치 상태 말풍선 (15분 이상 인터랙션 없음)
// ────────────────────────────────────────────────────────────

export const idleMessages: Message[] = [
  { id: 'i1', text: 'I need attention babe..😢', type: 'idle' },
  { id: 'i2', text: "Helloooo? I'm here???", type: 'idle' },
]

// ────────────────────────────────────────────────────────────
// E. Focus Mode 응원 말풍선
// ────────────────────────────────────────────────────────────

export const focusMessages: Message[] = [
  { id: 'f1', text: 'Yoonah is watching you. Focus on!', type: 'focus' },
  { id: 'f2', text: 'No doom scrolling 👀', type: 'focus' },
  { id: 'f3', text: "You're doing good, babe.", type: 'focus' },
  { id: 'f4', text: 'Stay with it for a lit bit more.', type: 'focus' },
  { id: 'f5', text: "Almost there! Don't give up.", type: 'focus' },
  { id: 'f6', text: 'You got this!', type: 'focus' },
]

// ────────────────────────────────────────────────────────────
// F. Focus 완료 메시지
// ────────────────────────────────────────────────────────────

export const completeMessages: Message[] = [
  {
    id: 'c1',
    text: 'You did a great job! Wanna get some rest, babe? 🥰',
    type: 'complete',
  },
  { id: 'c2', text: "I'm so proud of you 🥰", type: 'complete' },
  { id: 'c3', text: "You're amazing Take some break, babe 🥰", type: 'complete' },
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
