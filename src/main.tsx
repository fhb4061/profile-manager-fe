import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from 'react-oidc-context'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { MotionConfig } from 'motion/react'
import './index.css'
import App from './App.tsx'
import { oidcConfig } from './lib/auth'
import { queryClient } from './lib/queryClient'
import { ErrorBoundary } from './components/ErrorBoundary'
import { registerAuthRecovery } from './lib/authRecovery'

// Tear the session down if a background renew fails or the user is signed out
// at the OP, instead of leaving the app rendering as authenticated with
// credentials the API no longer accepts.
registerAuthRecovery()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider {...oidcConfig}>
            {/* Respects the OS-level prefers-reduced-motion setting for every
                motion.* animation in the app. */}
            <MotionConfig reducedMotion="user">
              <App />
            </MotionConfig>
          </AuthProvider>
          {import.meta.env.DEV && <ReactQueryDevtools />}
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
