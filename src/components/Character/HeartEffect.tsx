import heartPng from '../../assets/heart.png'
import './HeartEffect.css'

export interface Heart {
  id: number
  x: number
  delay: number
}

interface HeartEffectProps {
  hearts: Heart[]
  offsetX?: number
  offsetY?: number
}

export function HeartEffect({ hearts, offsetX = 0, offsetY = 0 }: HeartEffectProps) {
  if (hearts.length === 0) return null

  return (
    <div className="heart-effect">
      {hearts.map((h) => (
        <img
          key={h.id}
          src={heartPng}
          className="heart-particle"
          alt=""
          draggable={false}
          style={{
            left: `calc(40% + ${offsetX + h.x}px)`,
            bottom: `calc(62% - ${offsetY}px)`,
            animationDelay: `${h.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
