import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter } from 'react-router'
import { BreadcrumbTrailProvider, useBreadcrumbTrail } from './BreadcrumbTrailContext'

function TrailConsumer() {
  const trail = useBreadcrumbTrail()
  return <div data-testid="trail">{trail.join(',')}</div>
}

function TestNav() {
  return (
    <>
      <Link to="/">home</Link>
      <Link to="/camera">camera</Link>
      <Link to="/profiles">profiles</Link>
    </>
  )
}

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BreadcrumbTrailProvider>
        <TestNav />
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

  it('appends a newly visited path to the trail', async () => {
    const user = userEvent.setup()
    renderAt('/')

    await user.click(screen.getByRole('link', { name: 'camera' }))

    expect(screen.getByTestId('trail')).toHaveTextContent('/,/camera')
  })

  it('truncates the trail back to a path revisited via navigation', async () => {
    const user = userEvent.setup()
    renderAt('/')

    await user.click(screen.getByRole('link', { name: 'camera' }))
    await user.click(screen.getByRole('link', { name: 'profiles' }))
    await user.click(screen.getByRole('link', { name: 'camera' }))

    expect(screen.getByTestId('trail')).toHaveTextContent('/,/camera')
  })

  it('resets the trail to just Home when navigating there from an entry page never containing /', async () => {
    const user = userEvent.setup()
    renderAt('/camera')

    await user.click(screen.getByRole('link', { name: 'home' }))

    expect(screen.getByTestId('trail')).toHaveTextContent('/')
    expect(screen.getByTestId('trail')).not.toHaveTextContent('/camera,/')
  })
})
