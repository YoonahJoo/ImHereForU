import { useState, useEffect } from 'react'
import './SpeechBubble.css'

interface SpeechBubbleProps {
  message: string
  visible: boolean
  offsetX?: number
  offsetY?: number
}

export function SpeechBubble({ message, visible, offsetX = 0, offsetY = 0 }: SpeechBubbleProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [isShown, setIsShown] = useState(false)

  useEffect(() => {
    if (visible) {
      setShouldRender(true)
      // Double rAF to ensure the element is mounted before transition starts
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsShown(true))
      })
      return () => cancelAnimationFrame(id)
    } else {
      setIsShown(false)
      const t = setTimeout(() => setShouldRender(false), 280)
      return () => clearTimeout(t)
    }
  }, [visible])

  if (!shouldRender) return null

  return (
    <div
      className={`speech-bubble${isShown ? ' speech-bubble--visible' : ''}`}
      style={{
        left: `calc(50% + ${offsetX}px)`,
        bottom: `calc(50% + 90px - ${offsetY}px)`,
      }}
    >
      {message}
    </div>
  )
}
