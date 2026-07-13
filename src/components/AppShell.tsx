import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <Link to="/" className="font-heading text-sm font-semibold tracking-tight">
            Profile Manager
          </Link>
          <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">
            Log out
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 py-8">{children}</main>
    </div>
  )
}
