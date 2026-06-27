import { useEffect, useRef, useCallback } from 'react'

const IDLE_TIMEOUT = 10 * 60 * 1000 // 10분

interface UseIdleBehaviorResult {
  resetIdle: () => void
  pauseIdle: () => void
}

export function useIdleBehavior(onIdle: () => void): UseIdleBehaviorResult {
  // 렌더마다 직접 최신 콜백으로 동기 업데이트 (useEffect 비동기 타이밍 이슈 방지)
  const onIdleRef = useRef(onIdle)
  onIdleRef.current = onIdle

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetIdle = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      onIdleRef.current()
    }, IDLE_TIMEOUT)
  }, [])

  // Focus 타이머 실행 중처럼 방치 감지가 불필요한 구간에 타이머를 명시적으로 정지
  const pauseIdle = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // 마운트 시 타이머 시작, 언마운트 시 클린업
  useEffect(() => {
    resetIdle()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [resetIdle])

  return { resetIdle, pauseIdle }
}
