import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { Button } from '@/components/ui/button'

export function AppShell({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <Link to="/" className="font-heading text-sm font-semibold tracking-tight">
            Profile Manager
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={() =>
              void auth.signoutRedirect({
                // Cognito's logout endpoint isn't standards-compliant OIDC
                // RP-Initiated Logout: it ignores post_logout_redirect_uri
                // (the param oidc-client-ts sends by default) and only
                // recognizes its own proprietary logout_uri param. client_id
                // must be passed explicitly too: oidc-client-ts only
                // auto-fills it from settings when id_token_hint is absent,
                // but id_token_hint gets auto-populated from the live
                // session, so it's never absent here.
                extraQueryParams: {
                  logout_uri: import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI,
                  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
                },
              })
            }
          >
            Log out
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 py-8">{children}</main>
    </div>
  )
}
