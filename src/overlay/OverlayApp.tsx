import { useEffect, useRef, useState } from 'react'
import type { AppMode, Expression } from '../types'
import { Character } from '../components/Character/Character'

/**
 * OverlayApp — the renderer for the transparent, full-screen overlay window.
 *
 * Responsibilities (M1):
 *  - Render the shared Character component on a transparent surface.
 *  - Detect when the cursor is over the character and toggle OS-level
 *    mouse pass-through via IPC, so clicks elsewhere reach the apps below.
 *
 * Later milestones add: expression sync from the book (M2), lerp movement
 * following the cursor (M3), and transition/theme polish (M4).
 */
export function OverlayApp() {
  // Character expression — synced from the book window in M2.
  const [expression, setExpression] = useState<Expression>('idle')
  const [mode] = useState<AppMode>('daily')

  // Screen position of the character anchor (top-left of the 240px box).
  // M1: fixed starting spot near the lower-right; M3 drives this from the cursor.
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const anchorRef = useRef<HTMLDivElement>(null)
  const wasOverRef = useRef(false)

  // Initial placement: lower-right area of the overlay (once we know the size).
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

  // Hit-detection: toggle mouse pass-through as the cursor enters/leaves
  // the character. `setIgnoreMouseEvents(true, { forward: true })` keeps
  // forwarding mousemove to us even while ignoring, so this stays live.
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (!rect) return
      const isOver =
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
  }, [])

  // Expression sync from the book window (wired fully in M2).
  useEffect(() => {
    const handler = (_e: unknown, expr: Expression) => setExpression(expr)
    window.ipcRenderer.on('overlay:set-expression', handler)
    return () => {
      window.ipcRenderer.off('overlay:set-expression', handler)
    }
  }, [])

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
          isTimerRunning={false}
          onExpressionChange={setExpression}
          onClick={() => {}}
          onDoubleClick={() => {}}
          onLongPress={() => {}}
          onLongPressRelease={() => {}}
          onOffsetChange={() => {}}
        />
      </div>
    </div>
  )
}
