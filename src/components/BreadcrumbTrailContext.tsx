/* eslint-disable react-refresh/only-export-components -- Context + hook pairing is the standard React pattern */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { ROUTES } from '@/models/routes'

const BreadcrumbTrailContext = createContext<string[] | undefined>(undefined)

function updateTrail(trail: string[], path: string): string[] {
  if (path === ROUTES.home) {
    return [ROUTES.home]
  }
  const index = trail.indexOf(path)
  if (index !== -1) {
    return trail.slice(0, index + 1)
  }
  return [...trail, path]
}

export function BreadcrumbTrailProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [trail, setTrail] = useState<string[]>(() => [location.pathname])
  const [trackedPath, setTrackedPath] = useState(location.pathname)

  // Adjusting state during render (rather than in an effect) so the trail is
  // up to date in the same commit as the location change. See
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (location.pathname !== trackedPath) {
    setTrackedPath(location.pathname)
    setTrail((prev) => updateTrail(prev, location.pathname))
  }

  return (
    <BreadcrumbTrailContext.Provider value={trail}>{children}</BreadcrumbTrailContext.Provider>
  )
}

export function useBreadcrumbTrail(): string[] {
  const trail = useContext(BreadcrumbTrailContext)
  if (trail === undefined) {
    throw new Error('useBreadcrumbTrail must be used within a BreadcrumbTrailProvider')
  }
  return trail
}
