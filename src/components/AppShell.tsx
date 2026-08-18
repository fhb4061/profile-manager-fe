import { Link, Outlet } from 'react-router'
import { Home } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { HeaderAuth } from '@/components/HeaderAuth'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { BreadcrumbTrailProvider } from '@/components/BreadcrumbTrailContext'
import { ROUTES } from '@/models/routes'

export function AppShell() {
  return (
    <BreadcrumbTrailProvider>
      <div className="min-h-svh bg-background">
        <header className="border-b">
          <div className="flex h-14 w-full items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <Link to={ROUTES.home} aria-label="Home" className="text-muted-foreground hover:text-foreground">
                <Home className="size-4" />
              </Link>
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <HeaderAuth />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl px-6 py-8">
          <Outlet />
        </main>
      </div>
    </BreadcrumbTrailProvider>
  )
}
