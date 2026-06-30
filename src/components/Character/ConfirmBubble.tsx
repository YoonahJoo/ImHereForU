import { forwardRef } from 'react'
import './ConfirmBubble.css'

interface ConfirmBubbleProps {
  message: string
  visible: boolean
  offsetX?: number
  offsetY?: number
  onYes: () => void
  onNo: () => void
}

/**
 * ConfirmBubble — a speech bubble that asks a yes/no question above the
 * character (used by the desktop overlay for "Want me to go back?"). Unlike
 * SpeechBubble it stays put until the user picks an option, and its buttons
 * are interactive. The forwarded ref points at the bubble root so the overlay
 * can include the yes/no buttons in its cursor hit-detection.
 */
export const ConfirmBubble = forwardRef<HTMLDivElement, ConfirmBubbleProps>(
  function ConfirmBubble({ message, visible, offsetX = 0, offsetY = 0, onYes, onNo }, ref) {
    return (
      <div
        ref={ref}
        className={`confirm-bubble${visible ? ' confirm-bubble--visible' : ''}`}
        style={{
          left: `calc(50% + ${offsetX}px)`,
          bottom: `calc(50% + 90px - ${offsetY}px)`,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="confirm-bubble-text">{message}</div>
        <div className="confirm-bubble-actions">
          <button
            className="confirm-btn confirm-yes"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onYes}
          >
            yes
          </button>
          <button
            className="confirm-btn confirm-no"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onNo}
          >
            no
          </button>
        </div>
      </div>
    )
  },
)
