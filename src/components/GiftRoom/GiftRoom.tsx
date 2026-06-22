import type { GiftItem } from '../../types'
import './GiftRoom.css'

interface GiftRoomProps {
  gifts: GiftItem[]
  onClose: () => void
  theme: 'light' | 'dark'
}

function formatDate(isoString: string): string {
  const d = new Date(isoString)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

export function GiftRoom({ gifts, onClose, theme }: GiftRoomProps) {
  return (
    <div className={`gift-room${theme === 'dark' ? ' theme-dark' : ''}`}>
      <div className="gift-room-header">
        <h2 className="gift-room-title">Gift Room</h2>
        <button className="gift-room-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {gifts.length > 0 && (
        <p className="gift-room-count">총 {gifts.length}개</p>
      )}

      <div className="gift-room-body">
        {gifts.length === 0 ? (
          <p className="gift-room-empty">
            아직 받은 선물이 없어요.<br />
            Focus Mode를 완료하면 선물을 받을 수 있어요 🎀
          </p>
        ) : (
          <div className="gift-grid">
            {gifts.map(gift => (
              <div key={gift.id} className={`gift-card gift-card--${gift.rarity}`}>
                <span className="gift-emoji">{gift.emoji}</span>
                <span className="gift-name">{gift.name}</span>
                <span className="gift-date">{formatDate(gift.receivedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
