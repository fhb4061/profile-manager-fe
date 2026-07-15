import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from 'react-oidc-context'
import './index.css'
import App from './App.tsx'
import { oidcConfig } from './lib/auth'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider {...oidcConfig}>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
