import { Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { ProfileDetail } from './pages/ProfileDetail'
import { Callback } from './pages/Callback'
import { SilentRenew } from './pages/SilentRenew'
import { ProtectedLayout } from './components/ProtectedLayout'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="/silent-renew" element={<SilentRenew />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:id" element={<ProfileDetail />} />
      </Route>
    </Routes>
  )
}

export default App
