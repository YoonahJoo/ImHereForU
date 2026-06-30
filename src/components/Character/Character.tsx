import { useState, useRef, useEffect } from 'react'
import type { AppMode, Expression } from '../../types'
import characterIdle from '../../assets/character/character_idle.png'
import characterIdleBlink from '../../assets/character/character_idle_blink.png'
import characterWave from '../../assets/character/character_wave.png'
import characterSmile from '../../assets/character/character_smile.png'
import characterSulkyDaily from '../../assets/character/character_sulky_daily.png'
import characterSulkyFocus from '../../assets/character/character_sulky_focus.png'
import characterSleepy from '../../assets/character/character_sleepy.png'
import characterFocus from '../../assets/character/character_focus.png'
import characterDraggingDaily from '../../assets/character/character_dragging_daily.png'
import characterDraggingFocus from '../../assets/character/character_dragging_focus.png'
import characterCurious from '../../assets/character/character_curious.png'
import characterCheering from '../../assets/character/character_cheering.png'
import './Character.css'

const CHARACTER_IMAGES: Record<string, string> = {
  idle: characterIdle,
  wave: characterWave,
  smile: characterSmile,
  sulky_daily_mode: characterSulkyDaily,
  sulky_focus_mode: characterSulkyFocus,
  sleepy: characterSleepy,
  focus_mode: characterFocus,
  dragging_daily_mode: characterDraggingDaily,
  dragging_focus_mode: characterDraggingFocus,
  curious: characterCurious,
  cheering: characterCheering,
}

function getCharImg(expr: string): string {
  return CHARACTER_IMAGES[expr] ?? characterIdle
}

interface CharacterProps {
  mode: AppMode
  expression: Expression
  isTimerRunning: boolean
  onExpressionChange: (expression: Expression) => void
  onClick: () => void
  onDoubleClick: () => void
  onLongPress: () => void
  onLongPressRelease: () => void
  onOffsetChange: (x: number, y: number) => void
  onRightClick?: () => void
  // When true, left-click / double-click / long-press / drag are all blocked
  // (e.g. while the overlay's "Want me to go back?" confirm bubble is open).
  locked?: boolean
}

export function Character({
  mode,
  expression,
  isTimerRunning,
  onExpressionChange,
  onClick,
  onDoubleClick,
  onLongPress,
  onLongPressRelease,
  onOffsetChange,
  onRightClick,
  locked = false,
}: CharacterProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPressed, setIsPressed] = useState(false)

  // Two-layer crossfade system
  const [layerA, setLayerA] = useState(getCharImg(expression))
  const [layerB, setLayerB] = useState(getCharImg(expression))
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A')
  const currentImgRef = useRef(getCharImg(expression))
  const activeLayerRef = useRef<'A' | 'B'>('A')

  // Blink overlay (idle only)
  const [isBlinking, setIsBlinking] = useState(false)

  // Movement animation class
  const [animClass, setAnimClass] = useState<'bouncing' | 'shaking' | ''>('')

  // Stable callback refs
  const modeRef = useRef(mode)
  const isTimerRunningRef = useRef(isTimerRunning)
  const lockedRef = useRef(locked)
  const cbs = useRef({ onClick, onDoubleClick, onLongPress, onLongPressRelease, onExpressionChange, onOffsetChange, onRightClick })
  useEffect(() => {
    modeRef.current = mode
    isTimerRunningRef.current = isTimerRunning
    lockedRef.current = locked
    cbs.current = { onClick, onDoubleClick, onLongPress, onLongPressRelease, onExpressionChange, onOffsetChange, onRightClick }
  })

  // Crossfade when expression changes
  useEffect(() => {
    const target = getCharImg(expression)
    if (target === currentImgRef.current) return
    currentImgRef.current = target

    if (activeLayerRef.current === 'A') {
      setLayerB(target)
      activeLayerRef.current = 'B'
      setActiveLayer('B')
    } else {
      setLayerA(target)
      activeLayerRef.current = 'A'
      setActiveLayer('A')
    }
  }, [expression])

  // Blink timer (idle only)
  useEffect(() => {
    if (expression !== 'idle') {
      setIsBlinking(false)
      return
    }

    let timer: ReturnType<typeof setTimeout>

    const scheduleBlink = () => {
      timer = setTimeout(() => {
        setIsBlinking(true)
        timer = setTimeout(() => {
          setIsBlinking(false)
          scheduleBlink()
        }, 150)
      }, 3000 + Math.random() * 2000)
    }

    scheduleBlink()
    return () => clearTimeout(timer)
  }, [expression])

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

  // Global mouse listeners
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!drag.current.active) return
      const dx = e.clientX - drag.current.startX
      const dy = e.clientY - drag.current.startY

      if (!drag.current.moved && Math.hypot(dx, dy) >= 5) {
        drag.current.moved = true
        const draggingExpr = isTimerRunningRef.current
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
      setAnimClass('')

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }

      if (drag.current.moved) {
        if (longPressFired.current) {
          longPressFired.current = false
          cbs.current.onLongPressRelease()
        } else {
          cbs.current.onExpressionChange(drag.current.prevExpr)
        }
        return
      }

      if (longPressFired.current) {
        longPressFired.current = false
        cbs.current.onLongPressRelease()
        return
      }

      clickCount.current++
      if (clickCount.current === 1) {
        clickTimer.current = setTimeout(() => {
          setAnimClass('bouncing')
          setTimeout(() => setAnimClass(''), 400)
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

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault() // suppress the OS context menu
    cbs.current.onRightClick?.()
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button === 2) return // right-click is handled via onContextMenu
    if (lockedRef.current) return // confirm bubble open → ignore click/drag
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
      setAnimClass('shaking')
      cbs.current.onLongPress()
    }, 3000)
  }

  const isFloat = expression === 'idle' && animClass === ''
  const isSway = expression === 'sleepy'
  const isDragging = expression === 'dragging_daily_mode' || expression === 'dragging_focus_mode'

  return (
    <div
      className={[
        'character-wrapper',
        isDragging ? 'is-dragging' : '',
        isPressed && !drag.current.moved ? 'is-pressed' : '',
      ].filter(Boolean).join(' ')}
      style={{ transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))` }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      <div className={['character-anim', animClass].filter(Boolean).join(' ')}>
        <div className={['character-inner', isFloat ? 'float' : '', isSway ? 'sway' : ''].filter(Boolean).join(' ')}>
          <div className="char-img-wrapper">
            <img
              src={layerA}
              className={`char-img char-base ${activeLayer === 'A' ? 'char-visible' : 'char-hidden'}`}
              alt="character"
              draggable={false}
            />
            <img
              src={layerB}
              className={`char-img char-overlay ${activeLayer === 'B' ? 'char-visible' : 'char-hidden'}`}
              alt=""
              draggable={false}
            />
            {isBlinking && (
              <img
                src={characterIdleBlink}
                className="char-img char-blink"
                alt=""
                draggable={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
