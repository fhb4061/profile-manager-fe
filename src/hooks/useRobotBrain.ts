import { useState } from 'react'

export type RobotMode = 'idle' | 'busy' | 'success' | 'error'

export interface RobotBrainState {
  mode: RobotMode
  x: number
}

export interface UseRobotBrainOptions {
  isFetching: number
  isMutating: number
  random?: () => number
}

export function useRobotBrain({
  isFetching,
  isMutating,
  random = Math.random,
}: UseRobotBrainOptions): RobotBrainState {
  const [x] = useState(() => random() * 100)
  const mode: RobotMode = isFetching + isMutating > 0 ? 'busy' : 'idle'

  return { mode, x }
}
