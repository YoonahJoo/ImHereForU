import { useState } from 'react'
import type { SessionStatus } from '../../types'
import './FocusTimer.css'

interface FocusTimerProps {
  status: SessionStatus
  remainingSeconds: number
  durationMinutes: number
  onDurationChange: (minutes: number) => void
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

const MIN_MINUTES = 1
const MAX_MINUTES = 180

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function FocusTimer({
  status,
  remainingSeconds,
  durationMinutes,
  onDurationChange,
  onStart,
  onPause,
  onReset,
}: FocusTimerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(String(durationMinutes))
  const canSet = status === 'idle'

  function openEditor() {
    setDraft(String(durationMinutes))
    setIsEditing(true)
  }

  function confirmEditor() {
    const n = Math.round(Number(draft))
    const clamped = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Number.isNaN(n) ? durationMinutes : n))
    onDurationChange(clamped)
    setIsEditing(false)
  }

  return (
    <div className="focus-timer">
      {isEditing && canSet ? (
        <input
          className="timer-input"
          type="number"
          min={MIN_MINUTES}
          max={MAX_MINUTES}
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') confirmEditor() }}
          onBlur={confirmEditor}
          aria-label="Focus minutes"
        />
      ) : (
        <span className={`timer-display${status === 'completed' ? ' timer-display--done' : ''}`}>
          {status === 'completed' ? 'Done <3' : formatTime(remainingSeconds)}
        </span>
      )}

      <div className="timer-controls">
        {isEditing && canSet ? (
          <button className="timer-btn timer-btn--set" onMouseDown={(e) => e.preventDefault()} onClick={confirmEditor} aria-label="Confirm">✓</button>
        ) : (
          <>
            {canSet && (
              <button className="timer-btn timer-btn--set" onClick={openEditor} aria-label="Set time">✎</button>
            )}
            {status !== 'completed' && (
              status === 'running' ? (
                <button className="timer-btn" onClick={onPause} aria-label="Pause">⏸</button>
              ) : (
                <button className="timer-btn" onClick={onStart} aria-label="Start">▶</button>
              )
            )}
            {status !== 'idle' && (
              <button className="timer-btn timer-btn--reset" onClick={onReset} aria-label="Reset">↺</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
