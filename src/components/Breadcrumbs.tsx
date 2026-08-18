import { Fragment } from 'react'
import { Link } from 'react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useBreadcrumbTrail } from '@/components/BreadcrumbTrailContext'
import { useProfiles } from '@/hooks/useProfiles'
import type { Profile } from '@/models/profile'

const STATIC_LABELS: Record<string, string> = {
  '/': 'Home',
  '/camera': 'Camera',
  '/profiles': 'Profiles',
  '/profile/edit': 'Edit Profile',
}

const PROFILE_PATH_PREFIX = '/profile/'
const PROFILE_PLACEHOLDER_LABEL = 'Profile'

function getCrumbLabel(path: string, profiles?: Profile[]): string {
  if (path in STATIC_LABELS) {
    return STATIC_LABELS[path]
  }

  if (isProfileDetailPath(path)) {
    const id = path.slice(PROFILE_PATH_PREFIX.length)
    const profile = profiles?.find((candidate) => candidate.sub === id)
    return profile?.givenName ?? PROFILE_PLACEHOLDER_LABEL
  }

  return path
}

/** True for /profile/:id routes, which need a profiles lookup to label; false for the static /profile/edit route. */
function isProfileDetailPath(path: string): boolean {
  return path.startsWith(PROFILE_PATH_PREFIX) && !(path in STATIC_LABELS)
}

export function Breadcrumbs() {
  const trail = useBreadcrumbTrail()
  // Only fetch the profiles list when a crumb actually needs it, so pages
  // without a /profile/:id crumb don't trigger a network request just to
  // render a breadcrumb trail.
  const needsProfileLookup = trail.some(isProfileDetailPath)
  const { data } = useProfiles({ enabled: needsProfileLookup })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {trail.map((path, index) => {
          const isLast = index === trail.length - 1
          const label = getCrumbLabel(path, data?.items)

          return (
            <Fragment key={path}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link to={path} />}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
