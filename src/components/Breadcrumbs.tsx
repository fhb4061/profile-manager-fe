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
import { getCrumbLabel } from '@/lib/breadcrumbLabels'

export function Breadcrumbs() {
  const trail = useBreadcrumbTrail()
  const { data } = useProfiles()

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
