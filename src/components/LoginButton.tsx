import type { Location } from 'react-router'
import { useLocation } from 'react-router'
import { useAuth } from 'react-oidc-context'
import { Button } from '@/components/ui/button'

export function LoginButton() {
  const auth = useAuth()
  const location = useLocation()

  const handleLogin = () => {
    const from = (location.state as { from?: Location } | null)?.from
    const returnTo = from ? `${from.pathname}${from.search}` : undefined

    void auth.signinRedirect(returnTo ? { state: { returnTo } } : undefined)
  }

  return <Button onClick={handleLogin}>Log in</Button>
}
