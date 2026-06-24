import { useEffect, useRef, useState } from 'react'
import type { AppMode, Expression } from '../types'
import { Character } from '../components/Character/Character'

interface ExitPayload {
  expression?: Expression
  isTimerRunning?: boolean
  mode?: AppMode
  theme?: 'light' | 'dark'
}

type FxPhase = 'enter' | 'shown' | 'leaving'
const LEAVE_MS = 340 // matches the pop-out transition in Overlay.css

// Geometry / motion tuning
const ANCHOR_SIZE = 240
const HALF = ANCHOR_SIZE / 2
const LERP = 0.12 // follow easing (lower = lazier)
const DEADZONE = 150 // stop following once this close to the cursor (px)
const DRAG_THRESHOLD = 5 // px before a press counts as a drag
const HIT_INSET = 0.18 // shrink the clickable box toward the visible body

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(v, max))
}

/**
 * OverlayApp — renderer for the transparent, full-screen desktop-mate window.
 *
 *  - M1: render the shared Character + toggle OS-level mouse pass-through while
 *    the cursor is over the character.
 *  - M2: show/hide on book triggers; expression + timer synced from the book.
 *  - M3: drag to reposition, click to toggle cursor-following (lerp with a
 *    dead-zone so she stays grabbable), double-click to send her home.
 */
export function OverlayApp() {
  const [visible, setVisible] = useState(false)
  const [expression, setExpression] = useState<Expression>('idle')
  const [mode, setMode] = useState<AppMode>('daily')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [following, setFollowing] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [phase, setPhase] = useState<FxPhase>('enter')

  const anchorRef = useRef<HTMLDivElement>(null)
  const wasOverRef = useRef(false)

  // Live refs read inside the rAF loop / global listeners.
  const posRef = useRef({ x: 0, y: 0 })
  const cursorRef = useRef({ x: 0, y: 0 })
  const followingRef = useRef(false)
  const visibleRef = useRef(false)
  const dragRef = useRef({ active: false, moved: false, sx: 0, sy: 0, ox: 0, oy: 0 })

  const applyPos = (x: number, y: number) => {
    posRef.current = { x, y }
    setPos({ x, y })
  }

  const setFollow = (on: boolean) => {
    followingRef.current = on
    setFollowing(on)
    window.ipcRenderer.send('overlay:set-following', on)
  }

  useEffect(() => {
    visibleRef.current = visible
  }, [visible])

  // Initial placement: lower-right area of the overlay.
  useEffect(() => {
    const place = () => {
      const x = clamp(window.innerWidth - ANCHOR_SIZE - 60, 0, window.innerWidth - ANCHOR_SIZE)
      const y = clamp(window.innerHeight - ANCHOR_SIZE - 80, 0, window.innerHeight - ANCHOR_SIZE)
      if (!dragRef.current.active && !followingRef.current) applyPos(x, y)
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [])

  // Hit-detection: toggle pass-through as the cursor enters/leaves the visible
  // body (inset box). forward:true keeps mousemove flowing while ignoring.
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const rect = visible ? anchorRef.current?.getBoundingClientRect() : undefined
      let isOver = false
      if (rect) {
        const ix = rect.width * HIT_INSET
        const iy = rect.height * HIT_INSET
        isOver =
          e.clientX >= rect.left + ix &&
          e.clientX <= rect.right - ix &&
          e.clientY >= rect.top + iy &&
          e.clientY <= rect.bottom - iy
      }
      if (isOver !== wasOverRef.current) {
        wasOverRef.current = isOver
        window.ipcRenderer.send(
          isOver ? 'overlay:cursor-on-character' : 'overlay:cursor-off-character',
        )
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [visible])

  // ── Drag to reposition (capture on the anchor so Character's own drag
  //    logic never runs on the overlay) ─────────────────────────────────
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const d = dragRef.current
      if (!d.active) return
      const dx = e.clientX - d.sx
      const dy = e.clientY - d.sy
      if (!d.moved && Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
        d.moved = true
        if (followingRef.current) setFollow(false) // grabbing stops following
      }
      if (d.moved) {
        const nx = clamp(d.ox + dx, 0, window.innerWidth - ANCHOR_SIZE)
        const ny = clamp(d.oy + dy, 0, window.innerHeight - ANCHOR_SIZE)
        applyPos(nx, ny)
      }
    }
    function onMouseUp() {
      const d = dragRef.current
      if (!d.active) return
      d.active = false
      if (!d.moved) setFollow(!followingRef.current) // tap toggles following
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  // ── Follow loop: lerp toward the cursor, freezing within the dead-zone ──
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const d = dragRef.current
      if (visibleRef.current && followingRef.current && !d.active) {
        const p = posRef.current
        const cx = p.x + HALF
        const cy = p.y + HALF
        const dist = Math.hypot(cursorRef.current.x - cx, cursorRef.current.y - cy)
        if (dist > DEADZONE) {
          const tx = cursorRef.current.x - HALF
          const ty = cursorRef.current.y - HALF
          let nx = p.x + (tx - p.x) * LERP
          let ny = p.y + (ty - p.y) * LERP
          nx = clamp(nx, 0, window.innerWidth - ANCHOR_SIZE)
          ny = clamp(ny, 0, window.innerHeight - ANCHOR_SIZE)
          if (Math.abs(nx - p.x) > 0.1 || Math.abs(ny - p.y) > 0.1) applyPos(nx, ny)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // ── IPC from the main process / book ──────────────────────────────────
  useEffect(() => {
    const offShow = window.ipcRenderer.on('overlay:show', (_e, payload?: ExitPayload) => {
      if (payload?.expression) setExpression(payload.expression)
      if (typeof payload?.isTimerRunning === 'boolean') setIsTimerRunning(payload.isTimerRunning)
      if (payload?.mode) setMode(payload.mode)
      if (payload?.theme) setTheme(payload.theme)
      setPhase('enter') // restart the pop-in on every step-out
      setVisible(true)
    })
    const offHide = window.ipcRenderer.on('overlay:hide', () => setVisible(false))
    const offTheme = window.ipcRenderer.on('overlay:set-theme', (_e, t: 'light' | 'dark') =>
      setTheme(t),
    )
    const offExpr = window.ipcRenderer.on('overlay:set-expression', (_e, expr: Expression) =>
      setExpression(expr),
    )
    const offTimer = window.ipcRenderer.on('overlay:set-timer', (_e, running: boolean) =>
      setIsTimerRunning(running),
    )
    const offPos = window.ipcRenderer.on('overlay:set-position', (_e, p: { x: number; y: number }) => {
      cursorRef.current = p
    })
    return () => {
      offShow()
      offHide()
      offTheme()
      offExpr()
      offTimer()
      offPos()
    }
  }, [])

  // Drive the pop-in: flip 'enter' → 'shown' on the next frame so the CSS
  // transition runs from the small/transparent initial state.
  useEffect(() => {
    if (visible && phase === 'enter') {
      const raf = requestAnimationFrame(() => setPhase('shown'))
      return () => cancelAnimationFrame(raf)
    }
  }, [visible, phase])

  // Double-click the desktop character to send her back into the book —
  // play the pop-out first, then ask the main process to hide the window.
  function handleReturnHome() {
    if (phase === 'leaving') return
    setFollow(false)
    setPhase('leaving')
    window.setTimeout(() => {
      window.ipcRenderer.send('overlay:enter-character')
    }, LEAVE_MS)
  }

  function handleMouseDownCapture(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation() // keep Character's internal drag/click from firing
    dragRef.current = {
      active: true,
      moved: false,
      sx: e.clientX,
      sy: e.clientY,
      ox: posRef.current.x,
      oy: posRef.current.y,
    }
  }

  if (!visible) return <div className={`overlay-app theme-${theme}`} />

  return (
    <div className={`overlay-app theme-${theme}`}>
      <div
        ref={anchorRef}
        className={`overlay-char-anchor${following ? ' is-following' : ''}`}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        onMouseDownCapture={handleMouseDownCapture}
        onDoubleClick={handleReturnHome}
      >
        <div className={`overlay-char-fx phase-${phase}`}>
          <Character
            mode={mode}
            expression={expression}
            isTimerRunning={isTimerRunning}
            onExpressionChange={setExpression}
            onClick={() => {}}
            onDoubleClick={() => {}}
            onLongPress={() => {}}
            onLongPressRelease={() => {}}
            onOffsetChange={() => {}}
          />
        </div>
      </div>
    </div>
  )
}
