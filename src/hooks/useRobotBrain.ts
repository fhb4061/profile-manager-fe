import { useEffect, useState } from 'react'
import { subscribeRobotEvent, type RobotEvent } from '@/lib/robotEvents'

export type RobotMode = 'idle' | 'busy' | 'success' | 'error'

export interface RobotBrainState {
  mode: RobotMode
  x: number
}

export interface UseRobotBrainOptions {
  isFetching: number
  isMutating: number
  minWanderMs?: number
  maxWanderMs?: number
  eventDurationMs?: number
  random?: () => number
}

export function useRobotBrain({
  isFetching,
  isMutating,
  minWanderMs = 8000,
  maxWanderMs = 20000,
  eventDurationMs = 1200,
  random = Math.random,
}: UseRobotBrainOptions): RobotBrainState {
  const [x, setX] = useState(() => random() * 100)
  const [event, setEvent] = useState<RobotEvent | null>(null)
  const mode: RobotMode = event ?? (isFetching + isMutating > 0 ? 'busy' : 'idle')

  useEffect(() => subscribeRobotEvent(setEvent), [])

  useEffect(() => {
    if (!event) {
      return
    }
    const timeoutId = setTimeout(() => setEvent(null), eventDurationMs)
    return () => clearTimeout(timeoutId)
  }, [event, eventDurationMs])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const scheduleWander = () => {
      const delay = minWanderMs + random() * (maxWanderMs - minWanderMs)
      timeoutId = setTimeout(() => {
        setX(random() * 100)
        scheduleWander()
      }, delay)
    }

    scheduleWander()
    return () => clearTimeout(timeoutId)
    // Wander loop is scheduled once on mount and reschedules itself; it isn't
    // meant to restart when minWanderMs/maxWanderMs/random change mid-flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { mode, x }
}
