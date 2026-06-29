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
  const endAtRef = useRef<number>(0)            // 목표 종료 시각(epoch ms)
  const remainingRef = useRef(remainingSeconds) // start 시점의 남은 시간 참조(stale 방지)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete })
  useEffect(() => { remainingRef.current = remainingSeconds }, [remainingSeconds])

  // 설정 시간이 바뀌면(시작 전 idle 상태) 표시 시간도 동기화
  useEffect(() => {
    if (status === 'idle') setRemainingSeconds(totalSeconds)
  }, [totalSeconds, status])

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const start = useCallback(() => {
    clearTimer()
    // 1초씩 "세는(prev - 1)" 대신, 목표 종료 시각을 박아두고 매 틱마다
    // "지금 시각 vs 종료 시각" 차이로 남은 시간을 "계산"한다. → 틱이 누락돼도
    // (백그라운드 스로틀링/시스템 슬립/탭 전환) 다음 틱에서 자동 보정되고 drift도 없다.
    endAtRef.current = Date.now() + remainingRef.current * 1000
    setStatus('running')
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000))
      setRemainingSeconds(left)
      if (left <= 0) {
        clearTimer()
        setStatus('completed')
        onCompleteRef.current()
      }
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
