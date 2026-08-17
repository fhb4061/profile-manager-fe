import { MutationCache, QueryClient } from '@tanstack/react-query'
import { emitRobotEvent } from './robotEvents'

// Lives here rather than in main.tsx so non-React code (the axios interceptor,
// the auth event handlers) can drop cached data when a session ends, without
// importing the app entry point and dragging in createRoot side effects.
export const queryClient = new QueryClient({
  // Global mutation callbacks so the robot mascot can react to any
  // mutation's outcome without per-page wiring.
  mutationCache: new MutationCache({
    onSuccess: () => emitRobotEvent('success'),
    onError: () => emitRobotEvent('error'),
  }),
})
