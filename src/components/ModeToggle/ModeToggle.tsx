import { AppMode } from '../../types'
import './ModeToggle.css'

interface ModeToggleProps {
  mode: AppMode
  onModeChange: (mode: AppMode) => void
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle">
      <button
        className={`mode-btn${mode === 'daily' ? ' active' : ''}`}
        onClick={() => onModeChange('daily')}
      >
        Daily
      </button>
      <button
        className={`mode-btn${mode === 'focus' ? ' active' : ''}`}
        onClick={() => onModeChange('focus')}
      >
        Focus
      </button>
    </div>
  )
}
