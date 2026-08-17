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

export function useRobotBrain({ random = Math.random }: UseRobotBrainOptions): RobotBrainState {
  const [x] = useState(() => random() * 100)

  return { mode: 'idle', x }
}
