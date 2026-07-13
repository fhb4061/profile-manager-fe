import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { profiles } from '@/lib/profiles'
import { AppShell, ProfileAvatar } from '@/components/AppShell'

export function Home() {
  return (
    <AppShell>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Profiles
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Browse profiles, or open your own to edit it.
      </p>
      <ul className="mt-6 divide-y rounded-xl border bg-card shadow-sm">
        {profiles.map((profile) => (
          <li key={profile.id}>
            <Link
              to={`/profile/${profile.id}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent"
            >
              <ProfileAvatar
                firstName={profile.firstName}
                lastName={profile.lastName}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {profile.firstName} {profile.lastName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {profile.email}
                </span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  )
}
