import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { App } from './app/App'
import { AdminAuthProvider } from './hooks/useAdminAuth'
import { OwnerAuthProvider } from './hooks/useOwnerAuth'
import { TenantAuthProvider } from './hooks/useTenantAuth'
import './index.css'
import './styles/marketing.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <OwnerAuthProvider>
          <TenantAuthProvider>
            <App />
          </TenantAuthProvider>
        </OwnerAuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
