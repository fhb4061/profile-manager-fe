import { QueryClient } from '@tanstack/react-query'

// Lives here rather than in main.tsx so non-React code (the axios interceptor,
// the auth event handlers) can drop cached data when a session ends, without
// importing the app entry point and dragging in createRoot side effects.
export const queryClient = new QueryClient()
