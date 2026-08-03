import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { AppShell } from '@/components/AppShell'

// Single place route protection lives: new protected pages nest under this
// layout route (see App.tsx) rather than each getting a bespoke guard.
export function ProtectedLayout() {
  const auth = useAuth()
  const location = useLocation()

  if (auth.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    // Capture the attempted path so Login can pass it through to
    // signinRedirect's `state`, and Callback can restore it after auth.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
