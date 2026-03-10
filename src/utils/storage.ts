const OWNER_TOKEN_KEY = 'tenant_owner_token'
const TENANT_TOKEN_KEY = 'tenant_tenant_token'
const ADMIN_TOKEN_KEY = 'tenant_admin_token'

export function readOwnerToken(): string | null {
  return localStorage.getItem(OWNER_TOKEN_KEY)
}

export function writeOwnerToken(token: string) {
  localStorage.setItem(OWNER_TOKEN_KEY, token)
}

export function clearOwnerToken() {
  localStorage.removeItem(OWNER_TOKEN_KEY)
}

export function readTenantToken(): string | null {
  return localStorage.getItem(TENANT_TOKEN_KEY)
}

export function writeTenantToken(token: string) {
  localStorage.setItem(TENANT_TOKEN_KEY, token)
}

export function clearTenantToken() {
  localStorage.removeItem(TENANT_TOKEN_KEY)
}

export function readAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function writeAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}
