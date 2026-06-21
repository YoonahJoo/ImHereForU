import { useEffect } from 'react'
import { loadSettings } from '../../utils/storage'
import bookOutside from '../../assets/book-outside.jpeg'
import bookLight from '../../assets/book-light.png'
import bookDark from '../../assets/book-dark.png'
import './BookIntro.css'

interface BookIntroProps {
  onComplete: () => void
}

export function BookIntro({ onComplete }: BookIntroProps) {
  const theme = loadSettings()?.theme ?? 'light'
  const bookInside = theme === 'dark' ? bookDark : bookLight

  useEffect(() => {
    const timer = setTimeout(() => {
      window.ipcRenderer.send('resize-window', { width: 900, height: 639 })
      onComplete()
    }, 4000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="book-intro">
      <div className="book-flip-wrapper">
        <div className="book-flip">
          <div className="book-face book-face-front">
            <img src={bookOutside} alt="book cover" />
          </div>
          <div className="book-face book-face-back">
            <img src={bookInside} alt="book inside" />
          </div>
        </div>
      </div>
    </div>
  )
}
