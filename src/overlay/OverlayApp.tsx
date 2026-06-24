import { useEffect, useRef, useState } from 'react'
import type { AppMode, Expression } from '../types'
import { Character } from '../components/Character/Character'

interface ExitPayload {
  expression?: Expression
  isTimerRunning?: boolean
  mode?: AppMode
}

/**
 * OverlayApp — the renderer for the transparent, full-screen overlay window.
 *
 *  - M1: render the shared Character on a transparent surface + toggle OS-level
 *    mouse pass-through (via IPC) while the cursor is over the character.
 *  - M2: show/hide on the book's "step out" / "come home" triggers, and keep
 *    expression + timer state in sync with the book window.
 *
 * Later: lerp movement following the cursor (M3), transition/theme polish (M4).
 */
export function OverlayApp() {
  const [visible, setVisible] = useState(false)
  const [expression, setExpression] = useState<Expression>('idle')
  const [mode, setMode] = useState<AppMode>('daily')
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Screen position of the character anchor (top-left of the 240px box).
  // M2: fixed lower-right spot; M3 drives this from the cursor.
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const anchorRef = useRef<HTMLDivElement>(null)
  const wasOverRef = useRef(false)

  // Initial placement: lower-right area of the overlay.
  useEffect(() => {
    const place = () => {
      const x = Math.max(0, window.innerWidth - 240 - 60)
      const y = Math.max(0, window.innerHeight - 240 - 80)
      setPos({ x, y })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [])

  // Hit-detection: toggle mouse pass-through as the cursor enters/leaves the
  // character. With `setIgnoreMouseEvents(true, { forward: true })` the OS keeps
  // forwarding mousemove to us even while ignoring, so this stays live.
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const rect = visible ? anchorRef.current?.getBoundingClientRect() : undefined
      const isOver =
        !!rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom

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

  // ── IPC from the book (relayed through the main process) ──────────────
  useEffect(() => {
    const offShow = window.ipcRenderer.on('overlay:show', (_e, payload?: ExitPayload) => {
      if (payload?.expression) setExpression(payload.expression)
      if (typeof payload?.isTimerRunning === 'boolean') setIsTimerRunning(payload.isTimerRunning)
      if (payload?.mode) setMode(payload.mode)
      setVisible(true)
    })
    const offHide = window.ipcRenderer.on('overlay:hide', () => setVisible(false))
    const offExpr = window.ipcRenderer.on('overlay:set-expression', (_e, expr: Expression) =>
      setExpression(expr),
    )
    const offTimer = window.ipcRenderer.on('overlay:set-timer', (_e, running: boolean) =>
      setIsTimerRunning(running),
    )
    return () => {
      offShow()
      offHide()
      offExpr()
      offTimer()
    }
  }, [])

  // Double-click the desktop character to send her back into the book.
  function handleReturnHome() {
    window.ipcRenderer.send('overlay:enter-character')
  }

  if (!visible) return <div className="overlay-app" />

  return (
    <div className="overlay-app">
      <div
        ref={anchorRef}
        className="overlay-char-anchor"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      >
        <Character
          mode={mode}
          expression={expression}
          isTimerRunning={isTimerRunning}
          onExpressionChange={setExpression}
          onClick={() => {}}
          onDoubleClick={handleReturnHome}
          onLongPress={() => {}}
          onLongPressRelease={() => {}}
          onOffsetChange={() => {}}
        />
      </div>
    </div>
  )
}
