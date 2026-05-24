import { useState } from 'react'
import { timeBasedMessages } from '../data/messages'
import { getTimeOfDay } from '../utils/timeUtils'

interface UseTimeBasedResult {
  timeMessage: string | null
  clearTimeMessage: () => void
}

export function useTimeBased(): UseTimeBasedResult {
  const [timeMessage, setTimeMessage] = useState<string | null>(() => {
    const tod = getTimeOfDay()
    return timeBasedMessages[tod].text
  })

  function clearTimeMessage() {
    setTimeMessage(null)
  }

  return { timeMessage, clearTimeMessage }
}
