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
import { getCrumbLabel, isProfileDetailPath } from '@/lib/breadcrumbLabels'

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
