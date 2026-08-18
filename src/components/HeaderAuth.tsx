import { Link } from 'react-router'
import { useAuth } from 'react-oidc-context'
import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { LoginButton } from '@/components/LoginButton'
import { useMyProfile } from '@/hooks/useMyProfile'
import { ROUTES } from '@/models/routes'

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
          {data?.photoUrl && <AvatarImage src={data.photoUrl} alt="" />}
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
            render={<Link to={ROUTES.profileEdit} />}
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

export function HeaderAuth() {
  const auth = useAuth()

  if (auth.isLoading) {
    return <Skeleton className="size-8 rounded-full" />
  }

  if (!auth.isAuthenticated) {
    return <LoginButton />
  }

  return <AccountMenu />
}
