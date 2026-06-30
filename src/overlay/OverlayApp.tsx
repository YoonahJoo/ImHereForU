import { useEffect, useRef, useState } from 'react'
import type { AppMode, Expression } from '../types'
import { Character } from '../components/Character/Character'
import { SpeechBubble } from '../components/Character/SpeechBubble'
import { ConfirmBubble } from '../components/Character/ConfirmBubble'
import { HeartEffect, type Heart } from '../components/Character/HeartEffect'
import {
  dailyMessages,
  focusMessages,
  focusCheeringMessages,
  sulkyMessages,
  sulkyDailyReleaseMessage,
  sulkyFocusModeHoldMessage,
  sulkyFocusModeReleaseMessage,
  idleMessages,
  idleWakePromptMessage,
  idleWakeResponseMessage,
  getRandomMessage,
} from '../data/messages'
import { useIdleBehavior } from '../hooks/useIdleBehavior'

interface ExitPayload {
  expression?: Expression
  isTimerRunning?: boolean
  mode?: AppMode
  theme?: 'light' | 'dark'
}

interface FocusCompletePayload {
  congratsText?: string
}

const GIFT_ROOM_HINT = 'If you wanna see what gift you got, check the gift room!'
const GO_BACK_QUESTION = 'Want me to go back?'
const BYE_MESSAGE = 'Bye babe!'
const STAY_MESSAGE = 'I knew that you wanted to be w me more hehe'
const CONFIRM_REPLY_MS = 2000 // yes/no 선택 후 표정·말풍선 유지 시간

type FxPhase = 'enter' | 'shown' | 'leaving'
const LEAVE_MS = 340 // matches the pop-out transition in Overlay.css
const HIT_INSET = 0.18 // shrink the clickable box toward the visible body

/**
 * OverlayApp — renderer for the transparent, full-screen desktop-mate window.
 *
 * The desktop character stays where you drag her (no cursor-following) and
 * reacts to clicks just like she does inside the book. Right-clicking her opens
 * a "Want me to go back?" yes/no bubble that sends her home. Expression is owned
 * locally so desktop interactions aren't overridden by the book; only timer +
 * theme are synced in.
 */
export function OverlayApp() {
  const [visible, setVisible] = useState(false)
  const [expression, setExpression] = useState<Expression>('idle')
  const [mode] = useState<AppMode>('daily')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [phase, setPhase] = useState<FxPhase>('enter')

  const [bubbleMessage, setBubbleMessage] = useState('')
  const [bubbleVisible, setBubbleVisible] = useState(false)
  const [hearts, setHearts] = useState<Heart[]>([])
  const [charOffset, setCharOffset] = useState({ x: 0, y: 0 })
  // "Want me to go back?" yes/no 확인창 표시 여부
  const [confirmOpen, setConfirmOpen] = useState(false)
  // Fixed anchor position (top-left of the 240px box). She stays here unless
  // dragged; dragging moves her via Character's own offset (charOffset).
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const anchorRef = useRef<HTMLDivElement>(null)
  const confirmRef = useRef<HTMLDivElement>(null)
  const wasOverRef = useRef(false)
  const isTimerRunningRef = useRef(false)
  const confirmOpenRef = useRef(false)
  // 확인 플로우(질문창이 열린 시점 ~ yes/no 후 2초 연출이 끝날 때까지)가
  // 진행 중인 동안 타이머가 끝나면 축하 연출을 보류했다가, 플로우가 끝난 뒤
  // 실행한다. (보류할 축하 문구를 담아둠 / 없으면 null)
  const confirmFlowRef = useRef(false)
  const pendingCongratsRef = useRef<string | null>(null)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exprTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heartTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 방치 발동 후 3초 뒤 "click me if you wanna wake me up" 안내 말풍선 타이머
  const idlePromptTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Focus 완료 축하 연출 진행 중 표시 — set-timer(false)로 인한 idle 덮어쓰기 방지
  const celebratingRef = useRef(false)
  const completeStep2Timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    isTimerRunningRef.current = isTimerRunning
  }, [isTimerRunning])

  useEffect(() => {
    confirmOpenRef.current = confirmOpen
  }, [confirmOpen])

  // Resting pose follows the actual focus-timer state: focus_mode while a
  // session runs, idle otherwise. (We don't inherit the book's transient
  // expressions like cheering — only the running/not-running fact.)
  const restExpression = (): Expression => (isTimerRunningRef.current ? 'focus_mode' : 'idle')

  // Keep the resting pose in sync if the timer flips while she's out
  // (e.g. the focus session completes on the desktop).
  useEffect(() => {
    if (isTimerRunning) {
      // 새 세션 시작 → 진행 중이던 축하 연출은 취소하고 집중 포즈로
      celebratingRef.current = false
      if (completeStep2Timer.current) clearTimeout(completeStep2Timer.current)
      setExpression('focus_mode')
    } else if (!celebratingRef.current) {
      // 축하 연출 중에는 set-timer(false)가 와도 idle로 덮어쓰지 않는다
      setExpression('idle')
    }
  }, [isTimerRunning])

  function showBubble(message: string) {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    setBubbleMessage(message)
    setBubbleVisible(true)
    bubbleTimer.current = setTimeout(() => setBubbleVisible(false), 3000)
  }

  function revertSoon(ms: number) {
    if (exprTimer.current) clearTimeout(exprTimer.current)
    exprTimer.current = setTimeout(() => setExpression(restExpression()), ms)
  }

  // ── 방치(idle) 감지 — 책 밖(데스크탑)에 있는 동안엔 오버레이가 담당 ──
  // 책 안 연출(YoonahRoom)과 동일한 훅·메시지·표정을 재사용한다.
  const { resetIdle, pauseIdle } = useIdleBehavior(() => {
    if (exprTimer.current) clearTimeout(exprTimer.current)
    if (idlePromptTimer.current) clearTimeout(idlePromptTimer.current)
    setExpression('sleepy')
    showBubble(getRandomMessage(idleMessages).text)
    // 첫 메시지(3초)가 사라진 직후 깨우기 안내 — 책 안 연출과 동일
    idlePromptTimer.current = setTimeout(() => {
      showBubble(idleWakePromptMessage)
    }, 3000)
  })

  // 화면에 떠 있고(visible) 포커스 미실행일 때만 방치를 센다.
  // 책 안으로 들어가 숨거나(!visible) 포커스 중이면 멈춘다. → 책/오버레이
  // 중 항상 한 창만 방치를 세므로 중복 발동이 없다.
  useEffect(() => {
    if (!visible || isTimerRunning) pauseIdle()
    else resetIdle()
  }, [visible, isTimerRunning, pauseIdle, resetIdle])

  // Focus 완료 축하 연출 (책 안에서의 완료 연출을 데스크탑 버전으로 재생):
  // smile + 축하 말풍선 → 2초 뒤 선물방 안내 말풍선 → 5초 뒤 idle 복귀.
  function playFocusComplete(congratsText: string) {
    if (exprTimer.current) clearTimeout(exprTimer.current)
    if (completeStep2Timer.current) clearTimeout(completeStep2Timer.current)

    celebratingRef.current = true
    pauseIdle() // 축하 연출 중엔 방치가 끼어들지 않게 정지
    setExpression('smile')
    showBubble(congratsText || 'You did a great job, sweet heart <3')

    // 2초 뒤 두 번째 말풍선(선물방 안내)으로 교체
    completeStep2Timer.current = setTimeout(() => showBubble(GIFT_ROOM_HINT), 2000)

    // 5초 뒤 축하 연출 종료 → 현재 타이머 상태에 맞는 기본 포즈로 복귀
    exprTimer.current = setTimeout(() => {
      celebratingRef.current = false
      setExpression(restExpression())
      resetIdle() // 축하 끝났으니 방치 카운트 재시작
    }, 5000)
  }

  // ── Hit-detection: pass-through toggles off only over the character or the
  //    open confirm bubble; frozen mid-press so a drag never loses its mouse
  //    stream ──
  useEffect(() => {
    let interacting = false

    function overInteractive(x: number, y: number) {
      const charEl = anchorRef.current?.querySelector('.character-wrapper')
      const cr = charEl?.getBoundingClientRect()
      let over = false
      if (cr && cr.width > 0) {
        const ix = cr.width * HIT_INSET
        const iy = cr.height * HIT_INSET
        over =
          x >= cr.left + ix && x <= cr.right - ix && y >= cr.top + iy && y <= cr.bottom - iy
      }
      // 확인창(yes/no)이 떠 있으면 그 영역도 인터랙티브로 쳐서 버튼이 눌리게 한다.
      if (!over && confirmOpenRef.current && confirmRef.current) {
        const br = confirmRef.current.getBoundingClientRect()
        if (br && br.width > 0) {
          over = x >= br.left && x <= br.right && y >= br.top && y <= br.bottom
        }
      }
      return over
    }

    function evaluate(x: number, y: number) {
      const isOver = visible && overInteractive(x, y)
      if (isOver !== wasOverRef.current) {
        wasOverRef.current = isOver
        window.ipcRenderer.send(
          isOver ? 'overlay:cursor-on-character' : 'overlay:cursor-off-character',
        )
      }
    }

    function onMove(e: MouseEvent) {
      if (interacting) return // keep events flowing for the whole drag
      evaluate(e.clientX, e.clientY)
    }
    function onDown() {
      if (wasOverRef.current) interacting = true
    }
    function onUp(e: MouseEvent) {
      interacting = false
      evaluate(e.clientX, e.clientY)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [visible])

  // ── IPC from the main process / book ──────────────────────────────────
  useEffect(() => {
    const offShow = window.ipcRenderer.on('overlay:show', (_e, payload?: ExitPayload) => {
      // Step out reflecting the focus-timer state (focus_mode if a session is
      // running, idle otherwise) — but ignore the book's transient expressions.
      const running = payload?.isTimerRunning === true
      setIsTimerRunning(running)
      if (idlePromptTimer.current) clearTimeout(idlePromptTimer.current) // 직전 방치 잔여 정리
      setExpression(running ? 'focus_mode' : 'idle')
      if (payload?.theme) setTheme(payload.theme)
      setCharOffset({ x: 0, y: 0 })
      setConfirmOpen(false) // 새로 나올 땐 확인창/보류 상태 초기화
      confirmFlowRef.current = false
      pendingCongratsRef.current = null
      wasOverRef.current = false // start fresh; not hovering until proven otherwise
      setPhase('enter') // restart the pop-in on every step-out
      setVisible(true)
    })
    const offHide = window.ipcRenderer.on('overlay:hide', () => setVisible(false))
    const offTimer = window.ipcRenderer.on('overlay:set-timer', (_e, running: boolean) =>
      setIsTimerRunning(running),
    )
    const offComplete = window.ipcRenderer.on(
      'overlay:focus-complete',
      (_e, payload?: FocusCompletePayload) => {
        const text = payload?.congratsText || 'You did a great job, sweet heart <3'
        // 확인 플로우 진행 중이면 축하 연출을 보류 → 플로우 종료 후 실행.
        if (confirmFlowRef.current) {
          pendingCongratsRef.current = text
        } else {
          playFocusComplete(text)
        }
      },
    )
    const offTheme = window.ipcRenderer.on('overlay:set-theme', (_e, t: 'light' | 'dark') =>
      setTheme(t),
    )
    return () => {
      offShow()
      offHide()
      offTimer()
      offComplete()
      offTheme()
    }
    // playFocusComplete만 의존성에서 제외 — 내부에서 ref/상태 setter만 쓰므로
    // 첫 렌더 클로저로 호출해도 안전하다(구독은 1회만 등록).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Place her in the lower-right when she first steps out (and on resize).
  useEffect(() => {
    const place = () =>
      setPos({
        x: Math.max(0, window.innerWidth - 240 - 60),
        y: Math.max(0, window.innerHeight - 240 - 80),
      })
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [])

  // Drive the pop-in: flip 'enter' → 'shown' on the next frame.
  useEffect(() => {
    if (visible && phase === 'enter') {
      const raf = requestAnimationFrame(() => setPhase('shown'))
      return () => cancelAnimationFrame(raf)
    }
  }, [visible, phase])

  // Cleanup timers on unmount.
  useEffect(() => {
    return () => {
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
      if (exprTimer.current) clearTimeout(exprTimer.current)
      if (heartTimer.current) clearTimeout(heartTimer.current)
      if (completeStep2Timer.current) clearTimeout(completeStep2Timer.current)
      if (idlePromptTimer.current) clearTimeout(idlePromptTimer.current)
    }
  }, [])

  // ── Interactions — same vibe as the book ──────────────────────────────
  function handleClick() {
    // sleepy 상태에서 클릭 → 깨우기 (일반 클릭 반응 생략) — 책 안 연출과 동일
    if (expression === 'sleepy') {
      if (idlePromptTimer.current) clearTimeout(idlePromptTimer.current)
      if (exprTimer.current) clearTimeout(exprTimer.current)
      setExpression('smile')
      showBubble(idleWakeResponseMessage)
      revertSoon(3000)
      resetIdle() // 방치 사이클 재시작
      return
    }
    resetIdle() // 상호작용했으니 방치 카운트 리셋
    if (isTimerRunningRef.current) {
      showBubble(getRandomMessage(focusMessages).text)
      setExpression('cheering')
      revertSoon(2000)
    } else {
      showBubble(getRandomMessage(dailyMessages).text)
      setExpression('smile')
      revertSoon(3000)
    }
  }

  function handleDoubleClick() {
    resetIdle() // 상호작용했으니 방치 카운트 리셋
    if (exprTimer.current) clearTimeout(exprTimer.current)
    if (isTimerRunningRef.current) {
      setExpression('cheering')
      showBubble(getRandomMessage(focusCheeringMessages).text)
      revertSoon(2000)
    } else {
      setExpression('smile')
      const count = 3 + Math.floor(Math.random() * 3)
      const newHearts: Heart[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 80,
        delay: Math.random() * 0.35,
      }))
      setHearts(newHearts)
      if (heartTimer.current) clearTimeout(heartTimer.current)
      heartTimer.current = setTimeout(() => setHearts([]), 1500)
      revertSoon(3000)
    }
  }

  function handleLongPress() {
    resetIdle() // 상호작용했으니 방치 카운트 리셋
    if (isTimerRunningRef.current) {
      setExpression('sulky_focus_mode')
      showBubble(sulkyFocusModeHoldMessage)
    } else {
      setExpression('sulky_daily_mode')
      showBubble(getRandomMessage(sulkyMessages).text)
    }
  }

  function handleLongPressRelease() {
    if (isTimerRunningRef.current) {
      setExpression('cheering')
      showBubble(sulkyFocusModeReleaseMessage)
      revertSoon(2000)
    } else {
      setExpression('smile')
      showBubble(sulkyDailyReleaseMessage)
      revertSoon(3000)
    }
  }

  // Play the pop-out, then ask main to hide the window (go home).
  // setVisible(false) unmounts Character so its internal drag offset resets;
  // otherwise the next step-out would show the bubble at offset 0 while the
  // character still sits at the old dragged offset (bubble appears detached
  // until the next drag re-syncs them).
  // replayComplete: a focus session finished mid-confirm and the user chose
  // yes — tell the book to play its in-book celebration after she's back in.
  function goHome(replay?: { congratsText: string }) {
    if (phase === 'leaving') return
    setPhase('leaving')
    window.setTimeout(() => {
      window.ipcRenderer.send(
        'overlay:enter-character',
        replay ? { replayComplete: true, congratsText: replay.congratsText } : undefined,
      )
      setVisible(false)
    }, LEAVE_MS)
  }

  // Right-click on the character → open the "Want me to go back?" confirm.
  function handleRightClick() {
    if (confirmFlowRef.current || phase === 'leaving') return
    resetIdle() // 상호작용했으니 방치 카운트 리셋
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    setBubbleVisible(false) // hide any normal bubble so it doesn't clash
    confirmFlowRef.current = true // defer any focus-complete until this resolves
    setConfirmOpen(true)
  }

  // yes → smile/cheering + "Bye babe!" (2s), then head home. If a focus session
  // finished during the flow, hand the deferred celebration to the book so it
  // plays the in-book version once she's back inside.
  function handleConfirmYes() {
    setConfirmOpen(false)
    if (exprTimer.current) clearTimeout(exprTimer.current)
    if (completeStep2Timer.current) clearTimeout(completeStep2Timer.current)
    setExpression(isTimerRunningRef.current ? 'cheering' : 'smile')
    showBubble(BYE_MESSAGE)
    exprTimer.current = setTimeout(() => {
      confirmFlowRef.current = false
      const pending = pendingCongratsRef.current
      pendingCongratsRef.current = null
      goHome(pending ? { congratsText: pending } : undefined)
    }, CONFIRM_REPLY_MS)
  }

  // no → smile/cheering + stay message (2s), then back to resting pose. If a
  // focus session finished during the flow, the deferred desktop celebration
  // runs right after the stay message.
  function handleConfirmNo() {
    setConfirmOpen(false)
    if (exprTimer.current) clearTimeout(exprTimer.current)
    if (completeStep2Timer.current) clearTimeout(completeStep2Timer.current)
    setExpression(isTimerRunningRef.current ? 'cheering' : 'smile')
    showBubble(STAY_MESSAGE)
    exprTimer.current = setTimeout(() => {
      confirmFlowRef.current = false
      const pending = pendingCongratsRef.current
      pendingCongratsRef.current = null
      if (pending) {
        playFocusComplete(pending) // 보류했던 '책 밖' 선물 이벤트 실행
      } else {
        setExpression(restExpression())
        resetIdle() // 머무르기로 했으니 방치 카운트 재시작
      }
    }, CONFIRM_REPLY_MS)
  }

  if (!visible) return <div className={`overlay-app theme-${theme}`} />

  return (
    <div className={`overlay-app theme-${theme}`}>
      <div
        ref={anchorRef}
        className="overlay-char-anchor"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      >
        <div className={`overlay-char-fx phase-${phase}`}>
          <SpeechBubble
            message={bubbleMessage}
            visible={bubbleVisible && !confirmOpen}
            offsetX={charOffset.x}
            offsetY={charOffset.y}
          />
          <ConfirmBubble
            ref={confirmRef}
            message={GO_BACK_QUESTION}
            visible={confirmOpen}
            offsetX={charOffset.x}
            offsetY={charOffset.y}
            onYes={handleConfirmYes}
            onNo={handleConfirmNo}
          />
          <Character
            mode={mode}
            expression={expression}
            isTimerRunning={isTimerRunning}
            locked={confirmOpen}
            onExpressionChange={(expr) => {
              if (expr === 'dragging_daily_mode') showBubble('where am I going?')
              else if (expr === 'dragging_focus_mode') showBubble('Oops!')
              resetIdle() // 드래그도 상호작용 → 방치 카운트 리셋
              setExpression(expr)
            }}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onLongPress={handleLongPress}
            onLongPressRelease={handleLongPressRelease}
            onOffsetChange={(x, y) => setCharOffset({ x, y })}
            onRightClick={handleRightClick}
          />
          <HeartEffect hearts={hearts} offsetX={charOffset.x} offsetY={charOffset.y} />
        </div>
      </div>
    </div>
  )
}
