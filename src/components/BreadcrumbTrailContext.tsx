/* eslint-disable react-refresh/only-export-components -- Context + hook pairing is the standard React pattern */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'

const BreadcrumbTrailContext = createContext<string[] | undefined>(undefined)

export function BreadcrumbTrailProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [trail] = useState<string[]>(() => [location.pathname])

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
