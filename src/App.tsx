import { Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { ProfileDetail } from './pages/ProfileDetail'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/profile/:id" element={<ProfileDetail />} />
    </Routes>
  )
}

export default App
