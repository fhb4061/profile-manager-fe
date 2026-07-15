import type { Location } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function Login() {
  const auth = useAuth()
  const location = useLocation()

  const handleLogin = () => {
    const from = (location.state as { from?: Location } | null)?.from
    const returnTo = from ? `${from.pathname}${from.search}` : undefined

    void auth.signinRedirect(returnTo ? { state: { returnTo } } : undefined)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Login
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your profile
          </p>
        </CardHeader>
        <CardContent>
          <Button size="lg" className="w-full" onClick={handleLogin}>
            Log in
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
