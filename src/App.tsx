import { Routes, Route } from 'react-router'
import { Home } from './pages/Home'
import { Profiles } from './pages/Profiles'
import { ProfileDetail } from './pages/ProfileDetail'
import { EditProfile } from './pages/EditProfile'
import { Callback } from './pages/Callback'
import { SilentRenew } from './pages/SilentRenew'
import { AppShell } from './components/AppShell'
import { ProtectedLayout } from './components/ProtectedLayout'

function App() {
  return (
    <Routes>
      <Route path="/callback" element={<Callback />} />
      <Route path="/silent-renew" element={<SilentRenew />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/:id" element={<ProfileDetail />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
