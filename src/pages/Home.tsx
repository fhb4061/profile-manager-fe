import { Link } from 'react-router'

export function Home() {
  return (
    <>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Profile Manager
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Welcome to Profile Manager. Log in to view and manage your profile.
      </p>
      <Link to="/camera" className="mt-4 inline-block text-sm text-primary underline underline-offset-4">
        Try the camera
      </Link>
    </>
  )
}
