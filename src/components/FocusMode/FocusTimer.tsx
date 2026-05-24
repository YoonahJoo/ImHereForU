import type { SessionStatus } from '../../types'
import './FocusTimer.css'

interface FocusTimerProps {
  status: SessionStatus
  remainingSeconds: number
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function FocusTimer({ status, remainingSeconds, onStart, onPause, onReset }: FocusTimerProps) {
  return (
    <div className="focus-timer">
      <span className="timer-display">
        {status === 'completed' ? 'Done! 🎉' : formatTime(remainingSeconds)}
      </span>

      <div className="timer-controls">
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
      </div>
    </div>
  )
}
