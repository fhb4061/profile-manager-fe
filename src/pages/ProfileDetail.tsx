import { Link, useParams } from 'react-router'
import { useAuth } from 'react-oidc-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetProfile } from '@/hooks/useGetProfile'
import type { Profile } from '@/models/profile'
import { ROUTES } from '@/models/routes'

export function ProfileDetail() {
  const { id } = useParams();
  const auth = useAuth();
  const { data, isLoading, isError } = useGetProfile(id);
  const isOwnProfile = data !== undefined && auth.user?.profile.sub === data.sub;

  const getFields = (data: Profile) => [
    { label: 'First name', value: data.givenName },
    { label: 'Last name', value: data.familyName },
  ]

  return (
    <>
      {isLoading && (
        <>
          <div className="mt-4 flex items-center gap-4">
            <Skeleton className="size-14 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card className="mt-6 py-0">
            <dl className="divide-y">
              {[0, 1].map((row) => (
                <div
                  key={row}
                  className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4"
                >
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-40 sm:col-span-2" />
                </div>
              ))}
            </dl>
          </Card>
        </>
      )}

      {isError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>Couldn't load profile. Try again.</AlertDescription>
        </Alert>
      )}

      {data && !isLoading && (
        <>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                {data.photoUrl && <AvatarImage src={data.photoUrl} alt="" />}
                <AvatarFallback className="bg-primary/10 font-heading text-lg font-semibold text-primary">
                  {data.initials}
                </AvatarFallback>
              </Avatar>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                {data.givenName} {data.familyName}
              </h1>
            </div>
            {isOwnProfile && (
              <Button variant="outline" render={<Link to={ROUTES.profileEdit} />} nativeButton={false}>
                Edit profile
              </Button>
            )}
          </div>
          <Card className="mt-6 py-0">
            <dl className="divide-y">
              {getFields(data).map((field) => (
                <div
                  key={field.label}
                  className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4"
                >
                  <dt className="text-sm text-muted-foreground">{field.label}</dt>
                  <dd className="text-sm sm:col-span-2">{field.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </>
      )}
    </>
  )
}
