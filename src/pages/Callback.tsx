import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'

// Processes the redirect back from Cognito. Shows a loading state while
// auth is still working, then navigates to the originally-requested path
// (restored via signinRedirect's `state`) or "/" as a sensible default.
export function Callback() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.isLoading) {
      return
    }

    if (!auth.isAuthenticated) {
      navigate('/', { replace: true })
      return
    }

    const state = auth.user?.state as { returnTo?: string } | undefined
    navigate(state?.returnTo || '/', { replace: true })
  }, [auth.isLoading, auth.isAuthenticated, auth.user, navigate])

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  )
}
