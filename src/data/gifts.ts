// ============================================================
// Mini Yoonah — 선물 아이템 목록
// PRD 8-4 선물 시스템 기반
// ============================================================

import type { GiftItem, Rarity } from '../types'

// ────────────────────────────────────────────────────────────
// 선물 템플릿 (받기 전 정의용)
// receivedAt은 실제 지급 시점에 채워짐
// ────────────────────────────────────────────────────────────

interface GiftTemplate {
  name: string
  emoji: string
  rarity: Rarity
}

export const GIFT_TEMPLATES: GiftTemplate[] = [
  // common (높은 확률)
  { name: 'Cupcake', emoji: '🧁', rarity: 'common' },
  { name: 'Water', emoji: '💧', rarity: 'common' },
  { name: 'Jelly', emoji: '🍬', rarity: 'common' },
  { name: 'Bread', emoji: '🍞', rarity: 'common' },
  { name: 'Strawberry Milk', emoji: '🥛', rarity: 'common' },

  // uncommon (중간 확률)
  { name: 'Tiny Letter', emoji: '💌', rarity: 'uncommon' },
  { name: 'Flower', emoji: '🌸', rarity: 'uncommon' },
  { name: 'Heart', emoji: '💖', rarity: 'uncommon' },

  // rare (낮은 확률)
  { name: 'Ribbon', emoji: '🎀', rarity: 'rare' },
]

// ────────────────────────────────────────────────────────────
// 희귀도별 가중치
// common: 60%, uncommon: 30%, rare: 10%
// ────────────────────────────────────────────────────────────

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60,
  uncommon: 30,
  rare: 10,
}

// ────────────────────────────────────────────────────────────
// 가중치 기반 랜덤 선물 뽑기
// ────────────────────────────────────────────────────────────

export function getRandomGiftTemplate(): GiftTemplate {
  const totalWeight = GIFT_TEMPLATES.reduce(
    (sum, g) => sum + RARITY_WEIGHTS[g.rarity],
    0
  )

  let random = Math.random() * totalWeight

  for (const template of GIFT_TEMPLATES) {
    random -= RARITY_WEIGHTS[template.rarity]
    if (random <= 0) return template
  }

  // fallback (이론상 도달 불가)
  return GIFT_TEMPLATES[0]
}

// ────────────────────────────────────────────────────────────
// GiftItem 생성 (실제 지급 시 사용)
// ────────────────────────────────────────────────────────────

export function createGiftItem(): GiftItem {
  const template = getRandomGiftTemplate()
  return {
    id: `gift-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: template.name,
    emoji: template.emoji,
    rarity: template.rarity,
    receivedAt: new Date().toISOString(),
  }
}
