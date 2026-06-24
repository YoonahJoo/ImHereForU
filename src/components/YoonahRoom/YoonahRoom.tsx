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
  sulkyMessages,
  sulkyDailyReleaseMessage,
  sulkyFocusModeHoldMessage,
  sulkyFocusModeReleaseMessage,
  idleWakePromptMessage,
  idleWakeResponseMessage,
  timeBasedMessages,
  getRandomMessage,
} from '../../data/messages'
import { useTimeBased } from '../../hooks/useTimeBased'
import { useIdleBehavior } from '../../hooks/useIdleBehavior'
import { useFocusTimer } from '../../hooks/useFocusTimer'
import { getTimeOfDay } from '../../utils/timeUtils'
import { createGiftItem } from '../../data/gifts'
import { saveGifts, loadGifts, saveSettings, loadSettings } from '../../utils/storage'
import bookLight from '../../assets/book-light.png'
import bookDark from '../../assets/book-dark.png'
import sunflower from '../../assets/sunflower.png'
import bouquet from '../../assets/bouquet.png'
import memo from '../../assets/memo.png'
import settingsBtn from '../../assets/settings.png'
import explainLight1 from '../../assets/explain-light-1.png'
import explainLight2 from '../../assets/explain-light-2.png'
import explainLight3 from '../../assets/explain-light-3.png'
import explainDark1 from '../../assets/explain-dark-1.png'
import explainDark2 from '../../assets/explain-dark-2.png'
import explainDark3 from '../../assets/explain-dark-3.png'
import frogExitBtn from '../../assets/frog-exit-button.png'
import './YoonahRoom.css'

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'You',
  partnerNickname: 'Yoonah',
  customMessages: [],
  defaultMode: 'daily',
  theme: 'light',
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
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false)
  const [isGiftRoomOpen, setIsGiftRoomOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [onboardingPage, setOnboardingPage] = useState(0)
  const [settings, setSettings] = useState<UserSettings>(
    () => ({ ...DEFAULT_SETTINGS, ...loadSettings() })
  )
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>(
    () => loadSettings()?.theme ?? 'light'
  )
  const [charOffset, setCharOffset] = useState({ x: 0, y: 0 })
  const [hasClickedChar, setHasClickedChar] = useState(false)
  const [timerPos, setTimerPos] = useState<{ x: number; y: number } | null>(null)
  // v3.0: when true, the character has stepped out onto the desktop overlay.
  const [isCharacterOut, setIsCharacterOut] = useState(false)
  // brief pop-in when she returns into the book
  const [bookCharEntering, setBookCharEntering] = useState(false)

  const roomRef = useRef<HTMLDivElement>(null)
  const timerWindowRef = useRef<HTMLDivElement>(null)
  const timerDragOffset = useRef<{ x: number; y: number } | null>(null)

  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exprTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const newGiftTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modeBlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cheeringReturnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idlePromptTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const greetingActive = useRef(true)

  // ── 말풍선 표시 ──────────────────────────────────────────
  function showBubble(message: string) {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    setBubbleMessage(message)
    setIsBubbleVisible(true)
    bubbleTimer.current = setTimeout(() => setIsBubbleVisible(false), 3000)
  }

  // ── Focus 타이머 창 드래그 ────────────────────────────────
  function handleTimerDragMove(e: MouseEvent) {
    const room = roomRef.current
    const win = timerWindowRef.current
    const offset = timerDragOffset.current
    if (!room || !win || !offset) return
    const roomRect = room.getBoundingClientRect()
    let x = e.clientX - roomRect.left - offset.x
    let y = e.clientY - roomRect.top - offset.y
    const maxX = roomRect.width - win.offsetWidth
    const maxY = roomRect.height - win.offsetHeight
    x = Math.max(0, Math.min(x, maxX))
    y = Math.max(0, Math.min(y, maxY))
    setTimerPos({ x, y })
  }

  function handleTimerDragEnd() {
    timerDragOffset.current = null
    window.removeEventListener('mousemove', handleTimerDragMove)
    window.removeEventListener('mouseup', handleTimerDragEnd)
  }

  function handleTimerDragStart(e: React.MouseEvent) {
    // 닫기 버튼 클릭은 드래그로 처리하지 않음
    if ((e.target as HTMLElement).closest('.focus-timer-window-close')) return
    const room = roomRef.current
    const win = timerWindowRef.current
    if (!room || !win) return
    const roomRect = room.getBoundingClientRect()
    const winRect = win.getBoundingClientRect()
    timerDragOffset.current = { x: e.clientX - winRect.left, y: e.clientY - winRect.top }
    // 현재 위치를 left/top 기준으로 고정
    setTimerPos({ x: winRect.left - roomRect.left, y: winRect.top - roomRect.top })
    window.addEventListener('mousemove', handleTimerDragMove)
    window.addEventListener('mouseup', handleTimerDragEnd)
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
      if (greetingActive.current) return
      showBubble(timeMessage)
      clearTimeMessage()
      setExpression('smile')
      exprTimer.current = setTimeout(() => setExpression('idle'), 3000)
    }, 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 마운트 1회만 실행

  // ── 앱 시작 인삿말 (순차 말풍선) ─────────────────────────
  useEffect(() => {
    const tod = getTimeOfDay()
    setExpression('wave')

    const timers: ReturnType<typeof setTimeout>[] = []
    const after = (ms: number, fn: () => void) => {
      const t = setTimeout(fn, ms)
      timers.push(t)
    }

    if (tod === 'morning' || tod === 'afternoon' || tod === 'evening') {
      // 시간대 인사 → lovely → cozy → bouquet → idle
      const greetingText = timeBasedMessages[tod].text
      after(300,  () => showBubble(greetingText))
      after(2300, () => showBubble("It's lovely to see you here <3"))
      after(4300, () => showBubble("This is my tiny cozy space."))
      after(6300, () => showBubble("Click the bouquet below if you wanna know more about this app!"))
      after(9300, () => { greetingActive.current = false; setExpression('idle') })
    } else if (tod === 'night') {
      // 기본 인사 → cozy → bouquet → sleepy 경고 → idle
      after(300,  () => showBubble("Hey, babe! It's lovely to see you here <3"))
      after(2300, () => showBubble("This is my tiny cozy space."))
      after(4300, () => showBubble("Click the bouquet below if you wanna know more about this app!"))
      after(7500, () => {
        setExpression('sleepy')
        showBubble(timeBasedMessages.night.text)
      })
      after(10500, () => { greetingActive.current = false; setExpression('idle') })
    } else {
      // dawn: 기본 인사 → cozy → bouquet → sulky 경고 → idle
      after(300,  () => showBubble("Hey, babe! It's lovely to see you here <3"))
      after(2300, () => showBubble("This is my tiny cozy space."))
      after(4300, () => showBubble("Click the bouquet below if you wanna know more about this app!"))
      after(7500, () => {
        setExpression('sulky_daily_mode')
        showBubble(timeBasedMessages.dawn.text)
      })
      after(10500, () => { greetingActive.current = false; setExpression('idle') })
    }

    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setPreviewTheme(newSettings.theme)
    saveSettings(newSettings)
    setIsSettingsOpen(false)
    if (newSettings.defaultMode !== mode) {
      onModeChange(newSettings.defaultMode)
    }
  }

  // ── v3.0: 데스크탑으로 나가기 / 귀가 ──────────────────────
  function handleStepOut() {
    if (isCharacterOut) return
    setIsCharacterOut(true)
    window.ipcRenderer.send('book:exit-character', {
      expression,
      isTimerRunning: timerStatus === 'running',
      mode,
      theme: previewTheme,
    })
  }

  // 타이머 상태도 오버레이로 동기화
  useEffect(() => {
    if (isCharacterOut) window.ipcRenderer.send('overlay:set-timer', timerStatus === 'running')
  }, [timerStatus, isCharacterOut])

  // 테마(라이트/다크)도 오버레이로 동기화
  useEffect(() => {
    if (isCharacterOut) window.ipcRenderer.send('overlay:set-theme', previewTheme)
  }, [previewTheme, isCharacterOut])

  // 오버레이에서 귀가하면 책 안 캐릭터를 다시 표시
  useEffect(() => {
    const off = window.ipcRenderer.on('book:character-entered', () => {
      setIsCharacterOut(false)
    })
    return off
  }, [])

  // 귀가 순간(나가있음 → 들어옴) 책 캐릭터가 쏙 들어오는 팝 모션
  const wasOutRef = useRef(false)
  useEffect(() => {
    const wasOut = wasOutRef.current
    wasOutRef.current = isCharacterOut
    if (wasOut && !isCharacterOut) {
      setBookCharEntering(true)
      const t = setTimeout(() => setBookCharEntering(false), 600)
      return () => clearTimeout(t)
    }
  }, [isCharacterOut])

  // ── 인터랙션 핸들러 ───────────────────────────────────────
  function handleClick() {
    // sleepy 상태에서 클릭 → 깨우기 처리 (일반 클릭 반응 생략)
    if (expression === 'sleepy') {
      if (idlePromptTimer.current) clearTimeout(idlePromptTimer.current)
      if (exprTimer.current) clearTimeout(exprTimer.current)
      setExpression('smile')
      showBubble(idleWakeResponseMessage)
      exprTimer.current = setTimeout(() => setExpression('idle'), 3000)
      resetIdle() // 방치 타이머 재시작 → 반복 사이클
      return
    }

    setHasClickedChar(true)
    if (timerStatus !== 'running') resetIdle()
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
    if (timerStatus !== 'running') resetIdle()
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
    if (timerStatus !== 'running') resetIdle()
    if (exprTimer.current) clearTimeout(exprTimer.current)
    if (timerStatus !== 'running') {
      setExpression('sulky_daily_mode')
      showBubble(getRandomMessage(sulkyMessages).text)
    } else {
      setExpression('sulky_focus_mode')
      showBubble(sulkyFocusModeHoldMessage)
    }
  }

  function handleLongPressRelease() {
    if (exprTimer.current) clearTimeout(exprTimer.current)
    if (timerStatus !== 'running') {
      setExpression('smile')
      showBubble(sulkyDailyReleaseMessage)
      exprTimer.current = setTimeout(() => setExpression('idle'), 3000)
    } else {
      setExpression('cheering')
      showBubble(sulkyFocusModeReleaseMessage)
      if (cheeringReturnTimer.current) clearTimeout(cheeringReturnTimer.current)
      cheeringReturnTimer.current = setTimeout(() => setExpression('focus_mode'), 2000)
    }
  }

  const bookBg = previewTheme === 'dark' ? bookDark : bookLight

  return (
    <div
      ref={roomRef}
      className={`yoonah-room theme-${previewTheme}`}
    >
      <img
        className={`book-bg${previewTheme === 'dark' ? ' book-bg--dark' : ''}`}
        src={bookBg}
        alt=""
        draggable={false}
      />
      {/* 클릭 에셋: 해바라기 상단 → focus 모드 + 타이머 창 */}
      <div
        className="sunflower-hit sunflower-hit-top"
        onClick={() => { handleModeChange('focus'); setIsFocusTimerOpen(true) }}
      >
        <img
          className="book-asset asset-sunflower-top"
          src={sunflower}
          alt="focus mode"
          draggable={false}
        />
      </div>

      {/* 클릭 에셋: 해바라기 하단 → daily 모드 */}
      <div
        className="sunflower-hit sunflower-hit-bottom"
        onClick={() => handleModeChange('daily')}
      >
        <img
          className="book-asset asset-sunflower-bottom"
          src={sunflower}
          alt="daily mode"
          draggable={false}
        />
      </div>

      {/* 클릭 에셋: 꽃다발 → 온보딩 */}
      <img
        className="book-asset asset-bouquet"
        src={bouquet}
        alt="app guide"
        draggable={false}
        onClick={() => { setIsGiftRoomOpen(false); setIsSettingsOpen(false); setOnboardingPage(0); setIsOnboardingOpen(true) }}
      />

      {/* 클릭 에셋: 메모 → gift room */}
      <img
        className="book-asset asset-memo"
        src={memo}
        alt="gift room"
        draggable={false}
        onClick={() => { setIsSettingsOpen(false); setIsGiftRoomOpen(true) }}
      />

      {/* 설정 버튼 */}
      <button
        className="settings-btn"
        aria-label="Settings"
        onClick={() => { setIsGiftRoomOpen(false); setIsSettingsOpen(true); setPreviewTheme(settings.theme) }}
      >
        <img src={settingsBtn} alt="" draggable={false} />
      </button>

      {/* v3.0: 데스크탑으로 나가기 버튼 */}
      {!isCharacterOut && (
        <button
          className="step-out-btn"
          aria-label="Send Yoonah to your desktop"
          title="Send Yoonah out onto your desktop"
          onClick={handleStepOut}
        >
          🚪
        </button>
      )}

      {/* 캐릭터 스테이지 (왼쪽 페이지) */}
      <div className={`room-stage${bookCharEntering ? ' book-char-entering' : ''}`}>
        <SpeechBubble message={bubbleMessage} visible={isBubbleVisible} offsetX={charOffset.x} offsetY={charOffset.y} />
        <Character
          mode={mode}
          expression={expression}
          isTimerRunning={timerStatus === 'running'}
          onExpressionChange={(expr) => {
            if (expr === 'dragging_daily_mode') showBubble('where am I going?')
            else if (expr === 'dragging_focus_mode') showBubble('Oops!')
            setExpression(expr)
          }}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onLongPress={handleLongPress}
          onLongPressRelease={handleLongPressRelease}
          onOffsetChange={(x, y) => setCharOffset({ x, y })}
        />
        <HeartEffect hearts={hearts} offsetX={charOffset.x} offsetY={charOffset.y} />

        {!isBubbleVisible && !hasClickedChar && (
          <div className="character-hint">
            {mode === 'daily' ? 'Click me!' : "Let's focus together"}
          </div>
        )}

        {newGift && (
          <div className="gift-notification">
            <span className="gift-notif-congrats">Congrats!</span>
            <span className="gift-notif-sub">you got {newGift.name}!</span>
            <span className="gift-notif-emoji">{newGift.emoji}</span>
          </div>
        )}
      </div>

      {/* Focus 타이머 창 */}
      {isFocusTimerOpen && (
        <div
          className="focus-timer-window"
          ref={timerWindowRef}
          style={timerPos ? { left: timerPos.x, top: timerPos.y, right: 'auto', transform: 'none' } : undefined}
        >
          <div className="focus-timer-window-header" onMouseDown={handleTimerDragStart}>
            <span className="focus-timer-window-title">Focus Timer ⏱</span>
            <button
              className="focus-timer-window-close"
              aria-label="Close"
              onClick={() => setIsFocusTimerOpen(false)}
            >
              ✕
            </button>
          </div>
          <FocusTimer
            status={timerStatus}
            remainingSeconds={remainingSeconds}
            onStart={start}
            onPause={pause}
            onReset={reset}
          />
        </div>
      )}

      {/* 온보딩 오버레이 */}
      {isOnboardingOpen && (() => {
        const lightImgs = [explainLight1, explainLight2, explainLight3]
        const darkImgs  = [explainDark1, explainDark2, explainDark3]
        const imgs = previewTheme === 'dark' ? darkImgs : lightImgs
        return (
          <div className="onboarding-backdrop" onClick={() => setIsOnboardingOpen(false)}>
            <img
              className="onboarding-img"
              src={imgs[onboardingPage]}
              alt={`app guide ${onboardingPage + 1}`}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
            {onboardingPage > 0 && (
              <button
                className="onboarding-arrow onboarding-arrow--left"
                onClick={(e) => { e.stopPropagation(); setOnboardingPage(p => p - 1) }}
                aria-label="이전"
              >‹</button>
            )}
            {onboardingPage < imgs.length - 1 && (
              <button
                className="onboarding-arrow onboarding-arrow--right"
                onClick={(e) => { e.stopPropagation(); setOnboardingPage(p => p + 1) }}
                aria-label="다음"
              >›</button>
            )}
            <div className="onboarding-dots" onClick={(e) => e.stopPropagation()}>
              {imgs.map((_, i) => (
                <span
                  key={i}
                  className={`onboarding-dot ${i === onboardingPage ? 'onboarding-dot--active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setOnboardingPage(i) }}
                />
              ))}
            </div>
            <img
              className="onboarding-frog-btn"
              src={frogExitBtn}
              alt="close"
              draggable={false}
              onClick={(e) => { e.stopPropagation(); setIsOnboardingOpen(false) }}
            />
          </div>
        )
      })()}

      {/* 오버레이 패널 */}
      {isGiftRoomOpen && (
        <div className="panel-backdrop" onClick={() => setIsGiftRoomOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <GiftRoom gifts={gifts} onClose={() => setIsGiftRoomOpen(false)} theme={previewTheme} />
          </div>
        </div>
      )}
      {isSettingsOpen && (
        <div className="panel-backdrop" onClick={() => { setIsSettingsOpen(false); setPreviewTheme(settings.theme) }}>
          <div onClick={(e) => e.stopPropagation()}>
            <Settings
              settings={settings}
              onSave={handleSaveSettings}
              onClose={() => { setIsSettingsOpen(false); setPreviewTheme(settings.theme) }}
              currentTheme={previewTheme}
              onThemePreview={setPreviewTheme}
            />
          </div>
        </div>
      )}
    </div>
  )
}
