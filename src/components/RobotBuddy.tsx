import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useRobotBrain } from '@/hooks/useRobotBrain'

export function RobotBuddy() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const { mode } = useRobotBrain({ isFetching, isMutating })

  return (
    <div aria-hidden="true" className="pointer-events-none fixed bottom-2 left-0 z-40 size-14">
      {mode}
    </div>
  )
}
