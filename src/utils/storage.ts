import type { GiftItem, UserSettings } from '../types'

const GIFTS_KEY = 'mini-yoonah-gifts'
const SETTINGS_KEY = 'mini-yoonah-settings'

export function saveGifts(gifts: GiftItem[]): void {
  try {
    localStorage.setItem(GIFTS_KEY, JSON.stringify(gifts))
  } catch {
    // ignore write failures (e.g. private browsing quota)
  }
}

export function loadGifts(): GiftItem[] {
  try {
    const raw = localStorage.getItem(GIFTS_KEY)
    return raw ? (JSON.parse(raw) as GiftItem[]) : []
  } catch {
    return []
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

export function loadSettings(): UserSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? (JSON.parse(raw) as UserSettings) : null
  } catch {
    return null
  }
}
