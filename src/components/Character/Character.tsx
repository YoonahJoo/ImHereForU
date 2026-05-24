import { useState, useRef, useEffect } from 'react'
import type { AppMode, Expression } from '../../types'
import './Character.css'

const EMOJI: Record<Expression, string> = {
  idle: '😚',
  smile: '🥰',
  sulky_daily_mode: '😡',
  sulky_focus_mode: '😤',
  sleepy: '😪',
  focus_mode: '👩‍💻',
  dragging_daily_mode: '🤨',
  dragging_focus_mode: '😐',
  curious: '🥸',
  cheering: '😌',
}

interface CharacterProps {
  mode: AppMode
  expression: Expression
  onExpressionChange: (expression: Expression) => void
  onClick: () => void
  onDoubleClick: () => void
  onLongPress: () => void
  onLongPressRelease: () => void
  onOffsetChange: (x: number, y: number) => void
}

export function Character({
  mode,
  expression,
  onExpressionChange,
  onClick,
  onDoubleClick,
  onLongPress,
  onLongPressRelease,
  onOffsetChange,
}: CharacterProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPressed, setIsPressed] = useState(false)

  // Stable callback refs — updated every render, used inside effects
  const modeRef = useRef(mode)
  const cbs = useRef({ onClick, onDoubleClick, onLongPress, onLongPressRelease, onExpressionChange, onOffsetChange })
  useEffect(() => {
    modeRef.current = mode
    cbs.current = { onClick, onDoubleClick, onLongPress, onLongPressRelease, onExpressionChange, onOffsetChange }
  })

  const drag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    startOffX: 0,
    startOffY: 0,
    prevExpr: 'idle' as Expression,
  })

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = useRef(false)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clickCount = useRef(0)

  // Global mouse listeners — attached once
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!drag.current.active) return
      const dx = e.clientX - drag.current.startX
      const dy = e.clientY - drag.current.startY

      if (!drag.current.moved && Math.hypot(dx, dy) >= 5) {
        drag.current.moved = true
        // longPressTimer는 취소하지 않음 — 드래그 중에도 5초 홀드 이벤트 발생 가능
        const draggingExpr = modeRef.current === 'focus'
          ? 'dragging_focus_mode'
          : 'dragging_daily_mode'
        cbs.current.onExpressionChange(draggingExpr)
      }

      if (drag.current.moved) {
        const nx = drag.current.startOffX + dx
        const ny = drag.current.startOffY + dy
        setOffset({ x: nx, y: ny })
        cbs.current.onOffsetChange(nx, ny)
      }
    }

    function onMouseUp() {
      if (!drag.current.active) return
      drag.current.active = false
      setIsPressed(false)

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }

      if (drag.current.moved) {
        if (longPressFired.current) {
          // 드래그 중 5초 홀드도 달성 → long press release 처리 우선
          longPressFired.current = false
          cbs.current.onLongPressRelease()
        } else {
          // 일반 드래그 종료 → 이전 표정으로 복귀
          cbs.current.onExpressionChange(drag.current.prevExpr)
        }
        return
      }

      // Long press was triggered — delegate release handling to parent (mode-aware)
      if (longPressFired.current) {
        longPressFired.current = false
        cbs.current.onLongPressRelease()
        return
      }

      // Click / double-click detection
      clickCount.current++
      if (clickCount.current === 1) {
        clickTimer.current = setTimeout(() => {
          cbs.current.onClick()
          clickCount.current = 0
        }, 250)
      } else {
        if (clickTimer.current) {
          clearTimeout(clickTimer.current)
          clickTimer.current = null
        }
        cbs.current.onDoubleClick()
        clickCount.current = 0
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
      if (clickTimer.current) clearTimeout(clickTimer.current)
    }
  }, [])

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    drag.current.active = true
    drag.current.moved = false
    drag.current.startX = e.clientX
    drag.current.startY = e.clientY
    drag.current.startOffX = offset.x
    drag.current.startOffY = offset.y
    drag.current.prevExpr = expression
    setIsPressed(true)

    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true
      longPressTimer.current = null
      cbs.current.onLongPress()
    }, 5000)
  }

  const isFloat = expression === 'idle'
  const isDragging = expression === 'dragging_daily_mode' || expression === 'dragging_focus_mode'
  const isFocus = expression === 'focus_mode'

  return (
    <div
      className={[
        'character-wrapper',
        isDragging ? 'is-dragging' : '',
        isPressed && !drag.current.moved ? 'is-pressed' : '',
      ]
        .join(' ')
        .trim()}
      style={{
        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={`character-inner${isFloat ? ' float' : ''}`}>
        <span className="character-emoji">
          {EMOJI[expression]}
          {isFocus && <span className="focus-overlay">📚</span>}
        </span>
      </div>
    </div>
  )
}
