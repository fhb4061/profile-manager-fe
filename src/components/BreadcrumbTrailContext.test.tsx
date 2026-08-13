import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { BreadcrumbTrailProvider, useBreadcrumbTrail } from './BreadcrumbTrailContext'

function TrailConsumer() {
  const trail = useBreadcrumbTrail()
  return <div data-testid="trail">{trail.join(',')}</div>
}

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BreadcrumbTrailProvider>
        <TrailConsumer />
      </BreadcrumbTrailProvider>
    </MemoryRouter>
  )
}

describe('BreadcrumbTrailContext', () => {
  it('initializes the trail to just the current path on a fresh mount', () => {
    renderAt('/profiles')

    expect(screen.getByTestId('trail')).toHaveTextContent('/profiles')
  })
})
