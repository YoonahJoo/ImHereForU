// ============================================================
// Mini Yoonah — 공통 타입 정의
// PRD 9번 데이터 구조 기반
// ============================================================

// ────────────────────────────────────────────────────────────
// 캐릭터 상태
// ────────────────────────────────────────────────────────────

export type Expression =
  | 'idle'                 // 기본 상태, float 애니메이션
  | 'wave'                 // 손 흔들기 (앱 시작 인삿말)
  | 'smile'                // 기쁜 표정 (클릭, 더블클릭, 선물 지급 시)
  | 'sulky_daily_mode'     // 삐진 표정 (5초+ 롱프레스 - daily mode)
  | 'sulky_focus_mode'     // 삐진 표정 (5초+ 롱프레스 - focus mode)
  | 'sleepy'               // 졸린 표정 (방치 15분 또는 새벽 시간대)
  | 'focus_mode'           // 노트북 포즈 (Focus Mode 활성화 시)
  | 'dragging_daily_mode'  // 드래그 중 (daily mode)
  | 'dragging_focus_mode'  // 드래그 중 (focus mode)
  | 'curious'              // 타이머 실행 중 daily 탭 전환 시도 시
  | 'cheering'             // 타이머 실행 중 더블클릭 시

export interface CharacterState {
  currentExpression: Expression
  positionX: number
  positionY: number
  isBubbleVisible: boolean
  currentBubbleMessage: string
}

// ────────────────────────────────────────────────────────────
// 앱 모드
// ────────────────────────────────────────────────────────────

export type AppMode = 'daily' | 'focus'

// ────────────────────────────────────────────────────────────
// Focus Session
// ────────────────────────────────────────────────────────────

export type SessionStatus = 'idle' | 'running' | 'completed' | 'cancelled'

export interface FocusSession {
  duration: number        // 분 단위 (기본값: 25)
  status: SessionStatus
  startedAt: string | null   // ISO 날짜 문자열
  endedAt: string | null
  rewardId: string | null
}

// ────────────────────────────────────────────────────────────
// 선물 아이템
// ────────────────────────────────────────────────────────────

export type Rarity = 'common' | 'uncommon' | 'rare'

export interface GiftItem {
  id: string
  name: string
  emoji: string
  rarity: Rarity
  receivedAt: string    // ISO 날짜 문자열
}

// ────────────────────────────────────────────────────────────
// 메시지 (말풍선)
// ────────────────────────────────────────────────────────────

export type MessageType =
  | 'daily'       // Daily Mode 랜덤 말풍선
  | 'focus'       // Focus Mode 응원 말풍선
  | 'idle'        // 방치 상태 말풍선
  | 'time-based'  // 시간대별 자동 멘트
  | 'sulky'       // 롱프레스 삐진 말풍선
  | 'complete'    // Focus 완료 메시지

export interface Message {
  id: string
  text: string
  type: MessageType
}

// ────────────────────────────────────────────────────────────
// 사용자 설정 (localStorage 저장)
// ────────────────────────────────────────────────────────────

export interface UserSettings {
  userName: string           // 기본값: "You"
  partnerNickname: string    // 기본값: "Yoonah"
  customMessages: string[]   // 사용자가 직접 추가한 말풍선 문구
  defaultMode: AppMode       // 기본값: "daily"
  theme: 'light' | 'dark'   // 기본값: "light"
}

// ────────────────────────────────────────────────────────────
// 시간대
// ────────────────────────────────────────────────────────────

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'dawn'
