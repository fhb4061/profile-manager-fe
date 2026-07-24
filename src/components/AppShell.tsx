import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useMyProfile } from '@/hooks/useMyProfile'

function AccountMenu() {
  const auth = useAuth()
  const { data, isLoading, isError } = useMyProfile()

  if (isLoading) {
    return <Skeleton className="size-8 rounded-full" />
  }

  return (
    <Popover>
      <PopoverTrigger aria-label="Account menu">
        <Avatar>
          <AvatarFallback className="bg-primary/10 font-heading font-semibold text-primary">
            {isError || !data ? <UserRound /> : data.initials}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            className="justify-start"
            render={<Link to="/profile/edit" />}
            nativeButton={false}
          >
            Edit profile
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="justify-start"
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
      </PopoverContent>
    </Popover>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <Link to="/" className="font-heading text-sm font-semibold tracking-tight">
            Profile Manager
          </Link>
          <AccountMenu />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 py-8">{children}</main>
    </div>
  )
}
