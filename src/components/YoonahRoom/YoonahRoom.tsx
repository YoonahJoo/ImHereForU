import { useState, useRef, useEffect } from 'react'
import type { AppMode, Expression, GiftItem, Message, UserSettings } from '../../types'
import type { Heart } from '../Character/HeartEffect'
import { ModeToggle } from '../ModeToggle/ModeToggle'
import { Character } from '../Character/Character'
import { SpeechBubble } from '../Character/SpeechBubble'
import { HeartEffect } from '../Character/HeartEffect'
import { FocusTimer } from '../FocusMode/FocusTimer'
import { GiftRoom } from '../GiftRoom/GiftRoom'
import { Settings } from '../Settings/Settings'
import {
  dailyMessages,
  focusMessages,
  idleMessages,
  completeMessages,
  focusCheeringMessages,
  focusCuriousMessages,
  sulkyDailyHoldMessage,
  sulkyDailyReleaseMessage,
  sulkyFocusModeHoldMessage,
  sulkyFocusModeReleaseMessage,
  idleWakePromptMessage,
  idleWakeResponseMessage,
  getRandomMessage,
} from '../../data/messages'
import { useTimeBased } from '../../hooks/useTimeBased'
import { useIdleBehavior } from '../../hooks/useIdleBehavior'
import { useFocusTimer } from '../../hooks/useFocusTimer'
import { getTimeOfDay } from '../../utils/timeUtils'
import { createGiftItem } from '../../data/gifts'
import { saveGifts, loadGifts, saveSettings, loadSettings } from '../../utils/storage'
import './YoonahRoom.css'

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'You',
  partnerNickname: 'Yoonah',
  customMessages: [],
  defaultMode: 'daily',
}

interface YoonahRoomProps {
  mode: AppMode
  onModeChange: (mode: AppMode) => void
}

export function YoonahRoom({ mode, onModeChange }: YoonahRoomProps) {
  // 새벽이면 초기 expression을 'sleepy'로
  const [expression, setExpression] = useState<Expression>(() =>
    getTimeOfDay() === 'dawn' ? 'sleepy' : 'idle'
  )
  const [bubbleMessage, setBubbleMessage] = useState('')
  const [isBubbleVisible, setIsBubbleVisible] = useState(false)
  const [hearts, setHearts] = useState<Heart[]>([])
  const [gifts, setGifts] = useState<GiftItem[]>(() => loadGifts())
  const [newGift, setNewGift] = useState<GiftItem | null>(null)
  const [isGiftRoomOpen, setIsGiftRoomOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<UserSettings>(
    () => loadSettings() ?? DEFAULT_SETTINGS
  )
  const [charOffset, setCharOffset] = useState({ x: 0, y: 0 })

  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exprTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const newGiftTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modeBlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cheeringReturnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idlePromptTimer = useRef<ReturnType<typeof setTimeout> | null>(null) // Section 3, 4, 5에서 사용

  // ── 말풍선 표시 ──────────────────────────────────────────
  function showBubble(message: string) {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    setBubbleMessage(message)
    setIsBubbleVisible(true)
    bubbleTimer.current = setTimeout(() => setIsBubbleVisible(false), 3000)
  }

  // ── Focus 완료 처리 ───────────────────────────────────────
  function handleFocusComplete() {
    showBubble(getRandomMessage(completeMessages).text)
    if (exprTimer.current) clearTimeout(exprTimer.current)
    setExpression('smile')
    exprTimer.current = setTimeout(() => setExpression('idle'), 5000)

    const gift = createGiftItem()
    setGifts(prev => {
      const updated = [gift, ...prev]
      saveGifts(updated)
      return updated
    })

    if (newGiftTimer.current) clearTimeout(newGiftTimer.current)
    setNewGift(gift)
    newGiftTimer.current = setTimeout(() => setNewGift(null), 4000)
  }

  // ── Focus 타이머 훅 ──────────────────────────────────────
  const { status: timerStatus, remainingSeconds, start, pause, reset } =
    useFocusTimer(25, handleFocusComplete)

  // ── Focus 타이머 → 표정 동기화 ───────────────────────────
  useEffect(() => {
    if (timerStatus === 'running') {
      setExpression('focus_mode')
    } else if (timerStatus === 'idle' || timerStatus === 'cancelled') {
      setExpression('idle')
    }
    // 'completed'는 handleFocusComplete에서 처리
  }, [timerStatus])

  // ── 시간대 메시지 ─────────────────────────────────────────
  const { timeMessage, clearTimeMessage } = useTimeBased()

  useEffect(() => {
    if (!timeMessage) return
    const t = setTimeout(() => {
      showBubble(timeMessage)
      clearTimeMessage()
      setExpression('smile')
      exprTimer.current = setTimeout(() => setExpression('idle'), 3000)
    }, 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 마운트 1회만 실행

  // ── 방치 타이머 ──────────────────────────────────────────
  const { resetIdle, pauseIdle } = useIdleBehavior(() => {
    if (exprTimer.current) clearTimeout(exprTimer.current)
    if (idlePromptTimer.current) clearTimeout(idlePromptTimer.current)
    setExpression('sleepy')
    showBubble(getRandomMessage(idleMessages).text)
    // 첫 번째 메시지(3초)가 사라진 직후 두 번째 메시지 출력
    idlePromptTimer.current = setTimeout(() => {
      showBubble(idleWakePromptMessage)
    }, 3000)
    // 자동 idle 복귀 없음 — 클릭으로만 깨어남
  })

  // Focus 타이머 실행 중에는 idle 타이머 정지, 그 외엔 재시작
  // → 타이머가 running 중에 만료되어 영구 소멸하는 버그 방지
  useEffect(() => {
    if (timerStatus === 'running') {
      pauseIdle()
    } else {
      resetIdle()
    }
  }, [timerStatus, pauseIdle, resetIdle])

  // ── modeBlockTimer 언마운트 클린업 ──────────────────────────
  useEffect(() => () => {
    if (modeBlockTimer.current) clearTimeout(modeBlockTimer.current)
    if (cheeringReturnTimer.current) clearTimeout(cheeringReturnTimer.current)
    if (idlePromptTimer.current) clearTimeout(idlePromptTimer.current)
  }, [])

  // ── 모드 전환 핸들러 (타이머 실행 중 daily 전환 차단) ────────
  function handleModeChange(newMode: AppMode) {
    if (timerStatus === 'running' && newMode === 'daily') {
      if (exprTimer.current) clearTimeout(exprTimer.current)
      if (modeBlockTimer.current) clearTimeout(modeBlockTimer.current)

      setExpression('curious')
      showBubble(focusCuriousMessages[0].text)

      modeBlockTimer.current = setTimeout(() => {
        showBubble(focusCuriousMessages[1].text)
        modeBlockTimer.current = setTimeout(() => {
          setExpression('focus_mode')
        }, 2000)
      }, 2500)

      return
    }
    onModeChange(newMode)
  }

  // ── Settings 저장 ─────────────────────────────────────────
  function handleSaveSettings(newSettings: UserSettings) {
    setSettings(newSettings)
    saveSettings(newSettings)
    if (newSettings.defaultMode !== mode) {
      onModeChange(newSettings.defaultMode)
    }
  }

  // ── 인터랙션 핸들러 ───────────────────────────────────────
  function handleClick() {
    // sleepy 상태에서 클릭 → 깨우기 처리 (일반 클릭 반응 생략)
    if (expression === 'sleepy') {
      if (idlePromptTimer.current) clearTimeout(idlePromptTimer.current)
      if (exprTimer.current) clearTimeout(exprTimer.current)
      setExpression('idle')
      showBubble(idleWakeResponseMessage)
      resetIdle() // 방치 타이머 재시작 → 반복 사이클
      return
    }

    resetIdle()
    if (exprTimer.current) clearTimeout(exprTimer.current)

    if (mode === 'daily') {
      // 커스텀 메시지가 있으면 dailyMessages 풀에 합쳐서 랜덤 선택
      const customMsgs: Message[] = settings.customMessages.map((text, i) => ({
        id: `custom-${i}`,
        text,
        type: 'daily',
      }))
      const pool = [...dailyMessages, ...customMsgs]
      showBubble(getRandomMessage(pool).text)
      setExpression('smile')
      exprTimer.current = setTimeout(() => setExpression('idle'), 3000)
    } else {
      showBubble(getRandomMessage(focusMessages).text)
      if (expression === 'cheering' && timerStatus === 'running') {
        if (cheeringReturnTimer.current) clearTimeout(cheeringReturnTimer.current)
        cheeringReturnTimer.current = setTimeout(() => setExpression('focus_mode'), 2000)
      }
    }
  }

  function handleDoubleClick() {
    resetIdle()
    if (exprTimer.current) clearTimeout(exprTimer.current)

    if (timerStatus === 'running') {
      setExpression('cheering')
      showBubble(getRandomMessage(focusCheeringMessages).text)
      if (cheeringReturnTimer.current) clearTimeout(cheeringReturnTimer.current)
      cheeringReturnTimer.current = setTimeout(() => setExpression('focus_mode'), 2000)
    } else {
      setExpression('smile')

      const count = 3 + Math.floor(Math.random() * 3)
      const newHearts: Heart[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 80,
        delay: Math.random() * 0.35,
      }))
      setHearts(newHearts)
      setTimeout(() => setHearts([]), 1500)

      exprTimer.current = setTimeout(() => setExpression('idle'), 3000)
    }
  }

  function handleLongPress() {
    resetIdle()
    if (exprTimer.current) clearTimeout(exprTimer.current)
    if (mode === 'daily') {
      setExpression('sulky_daily_mode')
      showBubble(sulkyDailyHoldMessage)
    } else {
      setExpression('sulky_focus_mode')
      showBubble(sulkyFocusModeHoldMessage)
    }
    // Character 컴포넌트가 mouseup 시 onLongPressRelease()로 복귀 처리
  }

  function handleLongPressRelease() {
    if (exprTimer.current) clearTimeout(exprTimer.current)
    if (mode === 'daily') {
      setExpression('idle')
      showBubble(sulkyDailyReleaseMessage)
    } else {
      const returnExpr = timerStatus === 'running' ? 'focus_mode' : 'idle'
      setExpression(returnExpr)
      showBubble(sulkyFocusModeReleaseMessage)
    }
  }

  return (
    <div className="yoonah-room">
      {/* 상단 */}
      <div className="room-top">
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        <button
          className="settings-btn"
          aria-label="Settings"
          onClick={() => { setIsGiftRoomOpen(false); setIsSettingsOpen(true) }}
        >
          ⚙️
        </button>
      </div>

      {/* 중간 — 캐릭터 스테이지 */}
      <div className="room-stage">
        <SpeechBubble message={bubbleMessage} visible={isBubbleVisible} offsetX={charOffset.x} offsetY={charOffset.y} />
        <Character
          mode={mode}
          expression={expression}
          onExpressionChange={setExpression}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onLongPress={handleLongPress}
          onLongPressRelease={handleLongPressRelease}
          onOffsetChange={(x, y) => setCharOffset({ x, y })}
        />
        <HeartEffect hearts={hearts} />

        {/* 힌트 텍스트: 말풍선 없을 때만 표시 */}
        {!isBubbleVisible && (
          <div className="character-hint">
            {mode === 'daily' ? 'Click me! 🥺' : "Let's focus together 📚"}
          </div>
        )}

        {/* 선물 알림 카드 */}
        {newGift && (
          <div className="gift-notification">
            <span className="gift-notif-emoji">{newGift.emoji}</span>
            <div className="gift-notif-text">
              <span className="gift-notif-name">{newGift.name}</span>
              <span className="gift-notif-sub">를 받았어요!</span>
            </div>
          </div>
        )}
      </div>

      {/* 하단 */}
      <div className="room-bottom">
        <button
          className="gift-btn"
          onClick={() => { setIsSettingsOpen(false); setIsGiftRoomOpen(true) }}
        >
          🎁 Gift Room
        </button>
        {mode === 'focus' && (
          <FocusTimer
            status={timerStatus}
            remainingSeconds={remainingSeconds}
            onStart={start}
            onPause={pause}
            onReset={reset}
          />
        )}
      </div>

      {/* 오버레이 패널 */}
      {isGiftRoomOpen && (
        <GiftRoom gifts={gifts} onClose={() => setIsGiftRoomOpen(false)} />
      )}
      {isSettingsOpen && (
        <Settings
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  )
}
