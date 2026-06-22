import { useState, useRef, useEffect, useCallback } from 'react'
import type { SessionStatus } from '../types'

interface UseFocusTimerResult {
  status: SessionStatus
  remainingSeconds: number
  start: () => void
  pause: () => void
  reset: () => void
}

export function useFocusTimer(
  durationMinutes: number = 25,
  onComplete: () => void
): UseFocusTimerResult {
  const totalSeconds = Math.round(durationMinutes * 60)
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete })

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const start = useCallback(() => {
    clearTimer()
    setStatus('running')
    intervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearTimer()
          setStatus('completed')
          onCompleteRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const pause = useCallback(() => {
    clearTimer()
    setStatus('cancelled')
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    setStatus('idle')
    setRemainingSeconds(totalSeconds)
  }, [totalSeconds])

  // 언마운트 시 정리
  useEffect(() => () => clearTimer(), [])

  return { status, remainingSeconds, start, pause, reset }
}
