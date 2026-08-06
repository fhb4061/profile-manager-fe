import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { Home } from './pages/Home'
import { AppShell } from './components/AppShell'
import { ProtectedLayout } from './components/ProtectedLayout'
import { Skeleton } from './components/ui/skeleton'

const Profiles = lazy(() => import('./pages/Profiles').then((m) => ({ default: m.Profiles })))
const EditProfile = lazy(() =>
  import('./pages/EditProfile').then((m) => ({ default: m.EditProfile }))
)
const CameraFeed = lazy(() =>
  import('./pages/CameraFeed').then((m) => ({ default: m.CameraFeed }))
)
const ProfileDetail = lazy(() =>
  import('./pages/ProfileDetail').then((m) => ({ default: m.ProfileDetail }))
)
const Callback = lazy(() => import('./pages/Callback').then((m) => ({ default: m.Callback })))
const SilentRenew = lazy(() =>
  import('./pages/SilentRenew').then((m) => ({ default: m.SilentRenew }))
)

function App() {
  return (
    <Suspense fallback={<Skeleton className="h-32 w-full" />}>
      <Routes>
        <Route path="/callback" element={<Callback />} />
        <Route path="/silent-renew" element={<SilentRenew />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/camera" element={<CameraFeed />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/:id" element={<ProfileDetail />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
