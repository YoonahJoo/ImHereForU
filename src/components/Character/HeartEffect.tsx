import './HeartEffect.css'

export interface Heart {
  id: number
  x: number
  delay: number
}

interface HeartEffectProps {
  hearts: Heart[]
}

export function HeartEffect({ hearts }: HeartEffectProps) {
  if (hearts.length === 0) return null

  return (
    <div className="heart-effect">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart-particle"
          style={{
            left: `calc(50% + ${h.x}px)`,
            animationDelay: `${h.delay}s`,
          }}
        >
          💖
        </span>
      ))}
    </div>
  )
}
