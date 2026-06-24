import { useEffect, useRef, useState } from 'react'
import type { AppMode, Expression } from '../types'
import { Character } from '../components/Character/Character'
import { SpeechBubble } from '../components/Character/SpeechBubble'
import { HeartEffect, type Heart } from '../components/Character/HeartEffect'
import {
  dailyMessages,
  focusMessages,
  focusCheeringMessages,
  sulkyMessages,
  sulkyDailyReleaseMessage,
  sulkyFocusModeHoldMessage,
  sulkyFocusModeReleaseMessage,
  getRandomMessage,
} from '../data/messages'

interface ExitPayload {
  expression?: Expression
  isTimerRunning?: boolean
  mode?: AppMode
  theme?: 'light' | 'dark'
}

type FxPhase = 'enter' | 'shown' | 'leaving'
const LEAVE_MS = 340 // matches the pop-out transition in Overlay.css
const HIT_INSET = 0.18 // shrink the clickable box toward the visible body

/**
 * OverlayApp — renderer for the transparent, full-screen desktop-mate window.
 *
 * The desktop character stays where you drag her (no cursor-following) and
 * reacts to clicks just like she does inside the book. A 🏠 button above her
 * sends her home. Expression is owned locally so desktop interactions aren't
 * overridden by the book; only timer + theme are synced in.
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
  // Fixed anchor position (top-left of the 240px box). She stays here unless
  // dragged; dragging moves her via Character's own offset (charOffset).
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const anchorRef = useRef<HTMLDivElement>(null)
  const homeBtnRef = useRef<HTMLButtonElement>(null)
  const wasOverRef = useRef(false)
  const isTimerRunningRef = useRef(false)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exprTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heartTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    isTimerRunningRef.current = isTimerRunning
  }, [isTimerRunning])

  const restExpression = (): Expression => (isTimerRunningRef.current ? 'focus_mode' : 'idle')

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

  // ── Hit-detection: pass-through toggles off only over the character or the
  //    home button; frozen mid-press so a drag never loses its mouse stream ──
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
      if (!over) {
        const hr = homeBtnRef.current?.getBoundingClientRect()
        if (hr && hr.width > 0) {
          over = x >= hr.left && x <= hr.right && y >= hr.top && y <= hr.bottom
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
      if (payload?.expression) setExpression(payload.expression)
      if (typeof payload?.isTimerRunning === 'boolean') setIsTimerRunning(payload.isTimerRunning)
      if (payload?.theme) setTheme(payload.theme)
      setCharOffset({ x: 0, y: 0 })
      setPhase('enter') // restart the pop-in on every step-out
      setVisible(true)
    })
    const offHide = window.ipcRenderer.on('overlay:hide', () => setVisible(false))
    const offTimer = window.ipcRenderer.on('overlay:set-timer', (_e, running: boolean) =>
      setIsTimerRunning(running),
    )
    const offTheme = window.ipcRenderer.on('overlay:set-theme', (_e, t: 'light' | 'dark') =>
      setTheme(t),
    )
    return () => {
      offShow()
      offHide()
      offTimer()
      offTheme()
    }
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
    }
  }, [])

  // ── Interactions — same vibe as the book ──────────────────────────────
  function handleClick() {
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

  // 🏠 button — play the pop-out, then ask main to hide the window.
  function handleReturnHome(e: React.MouseEvent) {
    e.stopPropagation()
    if (phase === 'leaving') return
    setPhase('leaving')
    window.setTimeout(() => window.ipcRenderer.send('overlay:enter-character'), LEAVE_MS)
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
          <button
            ref={homeBtnRef}
            className={`overlay-home-btn${phase === 'shown' ? ' is-ready' : ''}`}
            style={{
              transform: `translate(calc(-50% + ${charOffset.x}px), calc(-50% - 180px + ${charOffset.y}px))`,
            }}
            title="Send Yoonah back into the book"
            aria-label="Send Yoonah home"
            onClick={handleReturnHome}
            onMouseDown={(e) => e.stopPropagation()}
          >
            🏠
          </button>
          <SpeechBubble
            message={bubbleMessage}
            visible={bubbleVisible}
            offsetX={charOffset.x}
            offsetY={charOffset.y}
          />
          <Character
            mode={mode}
            expression={expression}
            isTimerRunning={isTimerRunning}
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
        </div>
      </div>
    </div>
  )
}
